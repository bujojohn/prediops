import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const { countryId } = await params;
    
    // Get all leagues - fetch multiple pages to get all leagues
    let allLeagues: League[] = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages && currentPage <= 10) { // Limit to 10 pages to avoid infinite loops
      const leaguesResponse = await sportmonks.getLeagues({
        include: 'country;sport',
        per_page: 50,
        page: currentPage
      });

      const pageLeagues = leaguesResponse?.data || [];
      allLeagues = [...allLeagues, ...pageLeagues];
      
      // Check if there are more pages
      hasMorePages = pageLeagues.length === 50 && (leaguesResponse?.pagination?.has_more || false);
      currentPage++;
    }
    
    // Filter leagues by country ID
    const countryLeagues = allLeagues.filter((league: League) => 
      league.country_id?.toString() === countryId || league.country?.id?.toString() === countryId
    );

    // Get today's date for fixture counting
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's fixtures to count per league
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
      include: 'league.country',
      per_page: 50,
      page: 1,
    });

    const todayFixtures = fixturesResponse?.data || [];
    
    // Count fixtures per league
    const leagueFixtureCounts: Record<number, number> = {};
    
    todayFixtures.forEach((fixture: Fixture) => {
      const leagueId = fixture.league?.id;
      if (leagueId) {
        leagueFixtureCounts[leagueId] = (leagueFixtureCounts[leagueId] || 0) + 1;
      }
    });

    // Add fixture counts to leagues
    const leaguesWithFixtureCounts = countryLeagues.map(league => ({
      ...league,
      fixtureCount: leagueFixtureCounts[league.id] || 0
    }));

    // Sort leagues by name
    const sortedLeagues = leaguesWithFixtureCounts.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    return NextResponse.json({
      success: true,
      data: sortedLeagues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Country Leagues API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch leagues for country',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
