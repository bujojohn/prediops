import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const include = searchParams.get('include') || 'participants;scores;state;predictions.type;league.country;events';
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '50'), 50);
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const season_id = searchParams.get('season_id');

    console.log(`API: Fetching fixtures for league ${id}`);
    console.log(`API: Date range: ${date_from} to ${date_to}`);

    // Build API configuration
    const apiConfig = {
      include,
      per_page,
      page,
      filters: { fixtureLeagues: id } as any,
    };

    // Add date filters if provided
    if (date_from) {
      apiConfig.filters.date_from = date_from;
    }
    if (date_to) {
      apiConfig.filters.date_to = date_to;
    }
    if (season_id) {
      apiConfig.filters.season_id = season_id;
    }

    console.log('API Config:', apiConfig);

    // Try to get fixtures with league filter
    const fixturesResponse = await sportmonks.getAllFixtures(apiConfig);
    
    let fixtures = fixturesResponse?.data || [];
    
    // Filter fixtures to ensure they belong to the specified league
    fixtures = fixtures.filter((fixture: any) => {
      const fixtureLeagueId = fixture.league?.id?.toString();
      return fixtureLeagueId === id;
    });

    console.log(`API: Found ${fixtures.length} fixtures for league ${id}`);

    return NextResponse.json({
      success: true,
      data: fixtures,
      pagination: fixturesResponse?.pagination,
      timestamp: new Date().toISOString(),
      count: fixtures.length,
    });

  } catch (error) {
    console.error('API: Error fetching league fixtures:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch league fixtures',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
