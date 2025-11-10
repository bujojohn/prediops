import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

/**
 * Unified search endpoint that searches across all SportMonks entities
 * Uses server-side search for better performance and real-time data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const scope = searchParams.get('scope') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters',
      }, { status: 400 });
    }

    console.log(`API: Searching for "${query}" in scope: ${scope}`);
    console.log('API: Search parameters:', { query, scope, limit });

    const results: {
      countries: Array<Record<string, unknown>>;
      leagues: Array<Record<string, unknown>>;
      teams: Array<Record<string, unknown>>;
      fixtures: Array<Record<string, unknown>>;
      totalResults: number;
    } = {
      countries: [],
      leagues: [],
      teams: [],
      fixtures: [],
      totalResults: 0,
    };

    // Search based on scope
    const searchPromises = [];

    // Always search countries (fast, local data)
    if (scope === 'all' || scope === 'countries') {
      searchPromises.push(
        searchCountries(query, limit)
          .then(data => { results.countries = data; })
          .catch(err => console.error('Country search error:', err))
      );
    }

    // Search leagues
    if (scope === 'all' || scope === 'leagues') {
      searchPromises.push(
        searchLeagues(query, limit)
          .then(data => { results.leagues = data; })
          .catch(err => console.error('League search error:', err))
      );
    }

    // Search teams
    if (scope === 'all' || scope === 'teams') {
      searchPromises.push(
        searchTeams(query, limit)
          .then(data => { results.teams = data; })
          .catch(err => console.error('Team search error:', err))
      );
    }

    // Search fixtures
    if (scope === 'all' || scope === 'fixtures') {
      searchPromises.push(
        searchFixtures(query, limit)
          .then(data => { results.fixtures = data; })
          .catch(err => console.error('Fixture search error:', err))
      );
    }

    // Execute all searches in parallel
    await Promise.all(searchPromises);

    // Calculate total results
    results.totalResults = results.countries.length + 
                         results.leagues.length + 
                         results.teams.length + 
                         results.fixtures.length;

    console.log(`API: Found ${results.totalResults} results for "${query}"`);

    return NextResponse.json({
      success: true,
      data: results,
      query,
      scope,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API: Search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Search countries using local data (fastest)
 */
async function searchCountries(query: string, limit: number) {
  try {
    // Use local countries data for fastest search
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sportmonks/countries/optimized?populate=true`);
    const data = await response.json();
    
    if (!data.success) return [];

    const countries = data.data || [];
    const searchLower = query.toLowerCase();
    
    return countries
      .filter((country: { name?: string }) => {
        const name = (country.name || '').toLowerCase();
        return name.includes(searchLower);
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Country search error:', error);
    return [];
  }
}

/**
 * Search leagues using SportMonks API
 */
async function searchLeagues(query: string, limit: number) {
  try {
    console.log(`API: Searching leagues for "${query}"`);
    const leaguesResponse = await sportmonks.getLeaguesBySearch(query, {
      per_page: limit,
      include: 'country;sport',
    });

    console.log(`API: Found ${leaguesResponse?.data?.length || 0} leagues`);
    return leaguesResponse?.data || [];
  } catch (error) {
    console.error('League search error:', error);
    return [];
  }
}

/**
 * Search teams using SportMonks API
 */
async function searchTeams(query: string, limit: number) {
  try {
    console.log(`API: Searching teams for "${query}"`);
    const teamsResponse = await sportmonks.getTeamsBySearch(query, {
      per_page: limit,
      include: 'country',
    });

    console.log(`API: Found ${teamsResponse?.data?.length || 0} teams`);
    return teamsResponse?.data || [];
  } catch (error) {
    console.error('Team search error:', error);
    return [];
  }
}

/**
 * Search fixtures using SportMonks API
 * Returns fixtures matching the query within the next 60 days (and up to 2 hours in the past for live matches)
 */
async function searchFixtures(query: string, limit: number) {
  try {
    console.log(`API: Searching fixtures for "${query}"`);
    
    // Calculate date range: 2 hours ago to 365 days (1 year) from now
    // This allows for live matches that might have started recently
    // Extended to 1 year to include fixtures scheduled well in advance (e.g., next season)
    const now = new Date();
    const minDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days (1 year) from now
    
    console.log(`API: Date range for filtering: ${minDate.toISOString()} to ${maxDate.toISOString()} (365 days)`);
    
    // Try the search endpoint first
    let fixturesResponse;
    try {
      console.log(`API: Calling getFixturesBySearchName with query: "${query}"`);
      fixturesResponse = await sportmonks.getFixturesBySearchName(query, {
        per_page: limit * 5, // Fetch more to account for date filtering
        include: 'participants;scores;state;league.country;league.sport',
        order: 'desc', // Descending order to get upcoming fixtures first
      });
      
      // Log the raw response structure for debugging
      console.log(`API: Raw response from getFixturesBySearchName:`, {
        responseType: typeof fixturesResponse,
        responseKeys: fixturesResponse ? Object.keys(fixturesResponse) : 'null/undefined',
        hasData: !!fixturesResponse?.data,
        hasDataArray: Array.isArray(fixturesResponse?.data),
        dataLength: fixturesResponse?.data?.length ?? 'not an array',
        fullResponseString: JSON.stringify(fixturesResponse, null, 2).substring(0, 500), // First 500 chars
      });
      
      // Check if response structure is different (maybe data is directly an array?)
      if (!fixturesResponse?.data && Array.isArray(fixturesResponse)) {
        console.log('API: Response is directly an array, wrapping in data property');
        fixturesResponse = { data: fixturesResponse };
      }
      
      // Check if response has a different structure
      if (!fixturesResponse?.data && fixturesResponse) {
        console.log('API: Response structure unexpected, checking alternative properties');
        console.log('API: Full response:', JSON.stringify(fixturesResponse, null, 2));
      }
      
      // Log first fixture if available for debugging
      if (fixturesResponse?.data?.length > 0) {
        const firstFixture = fixturesResponse.data[0];
        console.log('API: First fixture from search:', {
          id: firstFixture.id,
          starting_at: firstFixture.starting_at,
          state: firstFixture.state?.name || firstFixture.state_id,
          hasParticipants: !!firstFixture.participants,
        });
      } else {
        console.log(`API: No fixtures in response.data for query "${query}"`);
      }
    } catch (searchError) {
      console.error('API: Fixture search endpoint error:', searchError);
      if (searchError instanceof Error) {
        console.error('API: Error message:', searchError.message);
        console.error('API: Error stack:', searchError.stack);
      }
      // If search endpoint fails, try to get upcoming fixtures and filter client-side
      console.log('API: Falling back to upcoming fixtures + client-side filter');
      const upcomingResponse = await sportmonks.getUpcomingFixtures({
        per_page: limit * 5, // Get more to filter
        include: 'participants;scores;state;league.country;league.sport',
      });
      
      const allUpcoming = upcomingResponse?.data || [];
      const searchLower = query.toLowerCase();
      
      // Type for fixture filtering
      type Fixture = {
        participants?: Array<{ name?: string | null }> | null;
        league?: { name?: string | null } | null;
        starting_at?: string | null;
      };
      
      // Filter fixtures that match the search query
      const filtered = (allUpcoming as Fixture[]).filter((fixture) => {
        const homeTeam = fixture.participants?.[0]?.name?.toLowerCase() || '';
        const awayTeam = fixture.participants?.[1]?.name?.toLowerCase() || '';
        const leagueName = fixture.league?.name?.toLowerCase() || '';
        return homeTeam.includes(searchLower) || 
               awayTeam.includes(searchLower) || 
               leagueName.includes(searchLower);
      });
      
      fixturesResponse = { data: filtered };
      console.log(`API: Filtered ${filtered.length} fixtures from ${allUpcoming.length} upcoming fixtures`);
    }

    // Handle different response structures
    let allFixtures: Array<Record<string, unknown>> = [];
    
    // SportMonks API might return data in different structures
    if (Array.isArray(fixturesResponse)) {
      // Response is directly an array
      allFixtures = fixturesResponse;
      console.log(`API: Response is directly an array with ${allFixtures.length} items`);
    } else if (fixturesResponse?.data) {
      // Response has a data property
      if (Array.isArray(fixturesResponse.data)) {
        allFixtures = fixturesResponse.data;
        console.log(`API: Response has data array with ${allFixtures.length} items`);
      } else if (fixturesResponse.data?.data && Array.isArray(fixturesResponse.data.data)) {
        // Nested data structure
        allFixtures = fixturesResponse.data.data;
        console.log(`API: Response has nested data array with ${allFixtures.length} items`);
      }
    } else if (fixturesResponse) {
      // Log unexpected structure
      console.log(`API: Unexpected response structure:`, {
        type: typeof fixturesResponse,
        keys: Object.keys(fixturesResponse),
        sample: JSON.stringify(fixturesResponse, null, 2).substring(0, 1000),
      });
    }
    
    console.log(`API: Total fixtures for "${query}" before date filter: ${allFixtures.length}`);
    
    if (allFixtures.length === 0) {
      console.log(`API: No fixtures returned from API for "${query}"`);
      console.log(`API: Full response was:`, JSON.stringify(fixturesResponse, null, 2).substring(0, 2000));
      return [];
    }
    
    // Log all fixture dates for debugging
    console.log(`API: Sample fixture dates:`, allFixtures.slice(0, 5).map((f: { starting_at?: string | null }) => ({
      starting_at: f.starting_at,
      parsed: f.starting_at ? new Date(f.starting_at).toISOString() : 'invalid',
    })));
    
    // Filter by date: include fixtures from 2 hours ago to 60 days in the future
    const filteredByDate = allFixtures.filter((fixture: { starting_at?: string | null; state?: { name?: string | null } }) => {
      // Always include live fixtures regardless of date
      const stateName = fixture.state?.name?.toLowerCase() || '';
      if (stateName === 'in play' || stateName === 'live' || stateName === 'paused') {
        console.log(`API: Including live fixture: ${fixture.starting_at}, state: ${stateName}`);
        return true;
      }
      
      if (!fixture.starting_at) {
        // If no date but state indicates it might be upcoming, include it
        return stateName !== 'finished' && stateName !== 'ft' && stateName !== 'full time';
      }
      
      try {
        const fixtureDate = new Date(fixture.starting_at);
        // Include fixtures from 2 hours ago (might be live) up to 1 year in the future
        const isInRange = fixtureDate >= minDate && fixtureDate <= maxDate;
        
        if (!isInRange) {
          console.log(`API: Excluding fixture outside date range: ${fixture.starting_at} (range: ${minDate.toISOString()} to ${maxDate.toISOString()})`);
        }
        
        return isInRange;
      } catch {
        console.warn('API: Failed to parse fixture date:', fixture.starting_at);
        // If date parsing fails but it's not explicitly finished, include it
        return stateName !== 'finished' && stateName !== 'ft' && stateName !== 'full time';
      }
    });
    
    console.log(`API: Fixtures after date filter (2h ago to 365 days): ${filteredByDate.length}`);
    
    // Sort filtered results in ascending order by starting_at (upcoming matches first)
    const sortedFixtures = filteredByDate.sort((a: { starting_at?: string | null }, b: { starting_at?: string | null }) => {
      // Handle fixtures without dates - put them at the end
      if (!a.starting_at && !b.starting_at) return 0;
      if (!a.starting_at) return 1;
      if (!b.starting_at) return -1;
      
      try {
        const dateA = new Date(a.starting_at).getTime();
        const dateB = new Date(b.starting_at).getTime();
        // Ascending order: earliest dates first
        return dateA - dateB;
      } catch {
        // If date parsing fails, keep original order
        return 0;
      }
    }).slice(0, limit); // Limit to requested number after sorting
    
    console.log(`API: Fixtures after sorting (ascending): ${sortedFixtures.length}`);
    
    if (filteredByDate.length === 0 && allFixtures.length > 0) {
      // Log details about why fixtures were filtered out
      const sampleFixture = allFixtures[0] as { id?: number; starting_at?: string | null; state?: { name?: string } | null; state_id?: number };
      console.log('API: Warning - All fixtures filtered out. Sample fixture:', {
        id: sampleFixture.id,
        starting_at: sampleFixture.starting_at,
        state: sampleFixture.state?.name || sampleFixture.state_id,
        dateInRange: sampleFixture.starting_at ? (() => {
          try {
            const date = new Date(sampleFixture.starting_at);
            return date >= minDate && date <= maxDate;
          } catch {
            return false;
          }
        })() : false,
      });
    }
    
    if (sortedFixtures.length === 0) {
      console.log(`API: No fixtures found for "${query}" within the date range (2h ago to 365 days)`);
      return [];
    }

    // Show sample fixture for debugging
    if (sortedFixtures.length > 0) {
      const sample = sortedFixtures[0] as { id?: number; name?: string; starting_at?: string | null; state?: { name?: string } | null; state_id?: number; participants?: Array<{ name?: string | null }> | null };
      console.log('API: Sample fixture being returned (first after sorting):', {
        id: sample.id,
        name: sample.name,
        starting_at: sample.starting_at,
        state: sample.state?.name || sample.state_id || 'no state',
        participants: sample.participants?.map((p: { name?: string | null }) => p?.name).filter(Boolean).join(' vs ') || 'no participants'
      });
    }
    
    console.log(`API: Returning ${sortedFixtures.length} fixtures for "${query}" (sorted ascending by date)`);
    return sortedFixtures;
  } catch (error) {
    console.error('API: Fixture search error:', error);
    if (error instanceof Error) {
      console.error('API: Error message:', error.message);
      console.error('API: Error stack:', error.stack);
    }
    return [];
  }
}