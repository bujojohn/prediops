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

    // Build filters dynamically
    let filters = searchParams.get('filters');
    
    if (!filters) {
      // Default filter
      filters = 'todayDate';
      
      // If team ID is provided, fetch team fixtures
      if (teamId) {
        const filterParts = [`teamId:${teamId}`];
        
        if (startDate && endDate) {
          filterParts.push(`startingAtBetween:${startDate},${endDate}`);
        } else if (startDate) {
          filterParts.push(`startingAtAfter:${startDate}`);
        }
        
        filters = filterParts.join(';');
      }
    }

    const fixtures = await sportmonks.getUpcomingFixtures({
      include,
      filters,
      sortBy: sortBy as 'starting_at' | 'name',
      order: order as 'asc' | 'desc',
      page,
      per_page,
    });

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
      },
      { status: 500 }
    );
  }
}


