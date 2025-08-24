import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include') || 'participants;scores;state;league.country';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const { date } = params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get fixtures for the specific date
    const fixtures = await sportmonks.getFixturesByDate(date, { 
      include,
      per_page: limit,
      page,
    });

    if (!fixtures?.data) {
      return NextResponse.json(
        { success: false, error: 'No fixtures found for this date' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fixtures.data,
      pagination: fixtures.pagination,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching fixtures by date:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fixtures for the specified date',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
