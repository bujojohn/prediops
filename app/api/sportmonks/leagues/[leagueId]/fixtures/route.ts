import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log(`Fetching fixtures for league ${leagueId} between ${startDate} and ${endDate}`);

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate and endDate are required',
        },
        { status: 400 }
      );
    }

    // Fetch fixtures for the date range
    const fixturesResponse = await sportmonks.getFixturesByDateRange(
      startDate,
      endDate,
      {
        include: 'participants;scores;state;predictions.type;league.country;stage;round',
        filters: { fixtureLeagues: leagueId },
        per_page: 50,
      }
    );

    const rawFixtures = fixturesResponse?.data || [];

    // Filter client-side to ensure we only get fixtures for this league
    const fixtures = rawFixtures.filter((fixture: { league?: { id?: number } }) => {
      const fixtureLeagueId = fixture.league?.id?.toString();
      return fixtureLeagueId === leagueId;
    });

    console.log(
      `League ${leagueId}: Raw fixtures: ${rawFixtures.length}, Filtered: ${fixtures.length}`
    );

    // Log predictions status for debugging
    const fixturesWithPredictions = fixtures.filter(f => f.predictions && f.predictions.length > 0);
    console.log(
      `League ${leagueId}: Fixtures with predictions: ${fixturesWithPredictions.length}/${fixtures.length}`
    );

    return NextResponse.json({
      success: true,
      data: fixtures,
      timestamp: new Date().toISOString(),
      count: fixtures.length,
    });
  } catch (error) {
    console.error('League fixtures API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch league fixtures',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

