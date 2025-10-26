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
 */
async function searchFixtures(query: string, limit: number) {
  try {
    console.log(`API: Searching fixtures for "${query}"`);
    const fixturesResponse = await sportmonks.getFixturesBySearchName(query, {
      per_page: limit,
      include: 'participants;scores;state;league.country;league.sport',
    });

    console.log(`API: Found ${fixturesResponse?.data?.length || 0} fixtures`);
    return fixturesResponse?.data || [];
  } catch (error) {
    console.error('Fixture search error:', error);
    return [];
  }
}