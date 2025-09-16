import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Team } from '@/schemas/team.schema';
import { Fixture } from '@/schemas/fixture.schema';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // 'all', 'countries', 'leagues', 'teams', 'fixtures'
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ 
      data: [], 
      message: 'Search query must be at least 2 characters long' 
    });
  }

  try {
    const results = [];

    // Search countries
    if (!type || type === 'all' || type === 'countries') {
      try {
        const countriesResponse = await sportmonks.getCountries({
          filters: `name:${query}`,
          include: 'continent',
          per_page: Math.min(limit, 5)
        });
        
        if (countriesResponse.data) {
          results.push(...countriesResponse.data.map((country: Country) => ({
            id: country.id,
            type: 'country' as const,
            name: country.name,
            subtitle: country.official_name,
            icon: '🌍',
            url: `/countries/${country.id}`,
            metadata: {
              iso2: country.iso2,
              continent: country.continent?.name
            }
          })));
        }
      } catch (error) {
        console.error('Error searching countries:', error);
      }
    }

    // Search leagues
    if (!type || type === 'all' || type === 'leagues') {
      try {
        const leaguesResponse = await sportmonks.getLeagues({
          filters: `name:${query}`,
          include: 'country',
          per_page: Math.min(limit, 5)
        });
        
        if (leaguesResponse.data) {
          results.push(...leaguesResponse.data.map((league: League) => ({
            id: league.id,
            type: 'league' as const,
            name: league.name,
            subtitle: league.country?.name || 'Unknown Country',
            icon: '🏆',
            url: `/leagues/${league.id}`,
            metadata: {
              type: league.type,
              country: league.country?.name
            }
          })));
        }
      } catch (error) {
        console.error('Error searching leagues:', error);
      }
    }

    // Search teams
    if (!type || type === 'all' || type === 'teams') {
      try {
        const teamsResponse = await sportmonks.getTeams({
          filters: `name:${query}`,
          include: 'country',
          per_page: Math.min(limit, 5)
        });
        
        if (teamsResponse.data) {
          results.push(...teamsResponse.data.map((team: Team) => ({
            id: team.id,
            type: 'team' as const,
            name: team.name,
            subtitle: team.country?.name || 'Unknown Country',
            icon: '⚽',
            url: `/teams/${team.id}`,
            metadata: {
              founded: team.founded,
              country: team.country?.name
            }
          })));
        }
      } catch (error) {
        console.error('Error searching teams:', error);
      }
    }

    // Search fixtures (upcoming matches)
    if (!type || type === 'all' || type === 'fixtures') {
      try {
        const fixturesResponse = await sportmonks.getUpcomingFixtures({
          filters: `name:${query}`,
          include: 'participants;league',
          per_page: Math.min(limit, 5)
        });
        
        if (fixturesResponse.data) {
          results.push(...fixturesResponse.data.map((fixture: Fixture) => ({
            id: fixture.id,
            type: 'fixture' as const,
            name: `${fixture.participants?.[0]?.name || 'TBD'} vs ${fixture.participants?.[1]?.name || 'TBD'}`,
            subtitle: fixture.league?.name || 'Unknown League',
            icon: '🏟️',
            url: `/fixtures/${fixture.id}`,
            metadata: {
              date: fixture.starting_at,
              league: fixture.league?.name
            }
          })));
        }
      } catch (error) {
        console.error('Error searching fixtures:', error);
      }
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aName = (a?.name || '').toString();
      const bName = (b?.name || '').toString();
      const aExact = aName.toLowerCase() === query.toLowerCase();
      const bExact = bName.toLowerCase() === query.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return aName.localeCompare(bName);
    });

    return NextResponse.json({
      data: sortedResults.slice(0, limit),
      total: sortedResults.length,
      query,
      type
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        message: 'An error occurred while searching'
      },
      { status: 500 }
    );
  }
}
