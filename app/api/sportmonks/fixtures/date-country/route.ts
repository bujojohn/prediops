import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const countryId = searchParams.get('countryId');

    if (!date || !countryId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: date and countryId',
      }, { status: 400 });
    }

    console.log(`API: Fetching fixtures for country ${countryId} on ${date}`);

    const fixturesResponse = await sportmonks.getFixturesByDate(date, {
      include: 'participants;scores;state;predictions.type;league.country',
      per_page: 50,
      page: 1,
    });

    const allFixtures = fixturesResponse?.data || [];
    
    // Filter fixtures for the specific country
    const countryFixtures = allFixtures.filter((fixture: any) => {
      return fixture.league?.country?.id?.toString() === countryId;
    });

    console.log(`API: Found ${countryFixtures.length} fixtures for country ${countryId} on ${date}`);

    return NextResponse.json({
      success: true,
      data: countryFixtures,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API: Error fetching fixtures by date and country:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fixtures by date and country',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
