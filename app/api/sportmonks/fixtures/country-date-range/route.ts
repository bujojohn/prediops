import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const countryId = searchParams.get('countryId');

    if (!startDate || !endDate || !countryId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: startDate, endDate, and countryId',
      }, { status: 400 });
    }

    console.log(`API: Fetching fixtures for country ${countryId} between ${startDate} and ${endDate}`);

    // Get fixtures for the date range
    const fixturesResponse = await sportmonks.getFixturesByDateRange(startDate, endDate, {
      include: 'participants;scores;state;predictions;predictions.type;league.country;periods.type;events.period;events.type;metadata.type',
      per_page: 50,
      page: 1,
    });

    const allFixtures = fixturesResponse?.data || [];
    
    // Filter fixtures for the specific country
    type FixtureWithCountry = { 
      league?: { 
        id?: number | string | null;
        country?: { id?: number | string | null } | null 
      } | null 
    };
    const countryFixtures = allFixtures.filter((fixture: FixtureWithCountry) => {
      return fixture.league?.country?.id?.toString() === countryId;
    });

    // Count unique leagues that have fixtures (not total fixtures)
    const leaguesWithFixtures = new Set();
    countryFixtures.forEach((fixture: FixtureWithCountry) => {
      if (fixture.league?.id) {
        leaguesWithFixtures.add(fixture.league.id);
      }
    });

    const leagueCount = leaguesWithFixtures.size;
    const fixtureCount = countryFixtures.length;

    console.log(`API: Found ${fixtureCount} fixtures across ${leagueCount} leagues for country ${countryId} between ${startDate} and ${endDate}`);

    return NextResponse.json({
      success: true,
      data: countryFixtures,
      count: leagueCount, // Return count of leagues with fixtures, not total fixtures
      fixtureCount: fixtureCount, // Also provide total fixture count for reference
      leaguesWithFixtures: Array.from(leaguesWithFixtures),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API: Error fetching fixtures by date range and country:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fixtures by date range and country',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

