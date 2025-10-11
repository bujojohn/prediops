import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include') || 'participants;scores;state;predictions;league;periods.type;events.period;events.type;metadata.type';
    const sortBy = searchParams.get('sortBy') || 'starting_at';
    const order = searchParams.get('order') || 'desc';
    const page = Number(searchParams.get('page') || '1');
    const per_page = Number(searchParams.get('per_page') || '50');
    
    // Team-specific query parameters
    const teamId = searchParams.get('teamId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let fixtures;

    // If team ID and dates are provided, use the specific team endpoint
    if (teamId && startDate && endDate) {
      console.log(`Fetching fixtures for team ${teamId} between ${startDate} and ${endDate}`);
      fixtures = await sportmonks.getFixuresByDateRangeForTeam(
        teamId,
        startDate,
        endDate,
        {
          include,
          sortBy: sortBy as 'starting_at' | 'name',
          order: order as 'asc' | 'desc',
          page,
          per_page,
        }
      );
    } else {
      // Use generic fixtures endpoint with filters
      const filters = searchParams.get('filters') || 'todayDate';
      
      console.log(`Fetching fixtures with filters: ${filters}`);
      fixtures = await sportmonks.getUpcomingFixtures({
        include,
        filters,
        sortBy: sortBy as 'starting_at' | 'name',
        order: order as 'asc' | 'desc',
        page,
        per_page,
      });
    }

    return NextResponse.json({
      success: true,
      data: fixtures,
      timestamp: new Date().toISOString(),
      count: fixtures?.data?.length || 0,
    });
  } catch (error) {
    console.error('Fixtures API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch fixtures',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


