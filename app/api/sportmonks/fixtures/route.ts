import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include') || 'participants;scores;state;predictions;league';
    const filters = searchParams.get('filters') || 'todayDate';
    const sortBy = searchParams.get('sortBy') || 'starting_at';
    const order = searchParams.get('order') || 'desc';
    const page = Number(searchParams.get('page') || '1');
    const per_page = Number(searchParams.get('per_page') || '50');

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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch fixtures',
      },
      { status: 500 }
    );
  }
}


