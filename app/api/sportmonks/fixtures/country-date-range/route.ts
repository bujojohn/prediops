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
    type FixtureWithCountry = { league?: { country?: { id?: number | string | null } | null } | null };
    const countryFixtures = allFixtures.filter((fixture: FixtureWithCountry) => {
      return fixture.league?.country?.id?.toString() === countryId;
    });

    console.log(`API: Found ${countryFixtures.length} fixtures for country ${countryId} between ${startDate} and ${endDate}`);

    return NextResponse.json({
      success: true,
      data: countryFixtures,
      count: countryFixtures.length,
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

