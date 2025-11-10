import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

/**
 * Teams endpoint for search functionality
 * Provides teams data for the enhanced search feature
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const per_page = parseInt(searchParams.get('per_page') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const include = searchParams.get('include') || 'country';

    console.log('API: Fetching teams for search...');

    const teamsResponse = await sportmonks.getTeams({
      include,
      per_page,
      page,
    });

    if (!teamsResponse?.data || teamsResponse.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No teams found',
        message: 'Failed to fetch teams data'
      }, { status: 404 });
    }

    console.log(`API: Successfully fetched ${teamsResponse.data.length} teams`);
    
    return NextResponse.json({
      success: true,
      data: teamsResponse.data,
      timestamp: new Date().toISOString(),
      pagination: teamsResponse.pagination,
      metadata: {
        totalCount: teamsResponse.data.length,
        hasMore: teamsResponse.pagination?.has_more || false,
      }
    });
  } catch (error) {
    console.error('API: Error fetching teams:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch teams data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
