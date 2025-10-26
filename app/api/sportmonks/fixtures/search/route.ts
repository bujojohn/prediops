import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

/**
 * Fixtures search endpoint for search functionality
 * Provides upcoming fixtures data for the enhanced search feature
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const per_page = parseInt(searchParams.get('per_page') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const include = searchParams.get('include') || 'participants;scores;state;league.country';

    console.log('API: Fetching fixtures for search...');

    const fixturesResponse = await sportmonks.getUpcomingFixtures({
      include,
      per_page,
      page,
      filters: 'todayDate', // Get today's fixtures for search
    });

    if (!fixturesResponse?.data || fixturesResponse.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fixtures found',
        message: 'Failed to fetch fixtures data'
      }, { status: 404 });
    }

    console.log(`API: Successfully fetched ${fixturesResponse.data.length} fixtures`);
    
    return NextResponse.json({
      success: true,
      data: fixturesResponse.data,
      timestamp: new Date().toISOString(),
      pagination: fixturesResponse.pagination,
      metadata: {
        totalCount: fixturesResponse.data.length,
        hasMore: fixturesResponse.pagination?.has_more || false,
      }
    });
  } catch (error) {
    console.error('API: Error fetching fixtures:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fixtures data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
