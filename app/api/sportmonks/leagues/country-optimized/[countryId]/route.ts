import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { NextRequest } from 'next/server';

/**
 * Optimized leagues by country endpoint with 24-hour caching
 * Uses SportMonks best practices and implements efficient caching strategy
 * For static data like countries, types, states - use local data files instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const { countryId } = await params;
    const { searchParams } = new URL(request.url);
    const idAfter = searchParams.get('idAfter');
    const populate = searchParams.get('populate') === 'true';
    
    console.log(`API: Fetching optimized leagues for country ${countryId}...`, { idAfter, populate });
    
    // Use SportMonks best practices for efficient data loading
    const leaguesResponse = await sportmonks.getLeaguesByCountryId(countryId, {
      // Use populate filter to disable includes and enable efficient pagination
      filters: populate ? 'populate' : undefined,
      per_page: populate ? 1000 : 50, // Use larger page size when populate is enabled
      page: 1,
      // Use idAfter for incremental updates
      ...(idAfter && { filters: `idAfter:${idAfter}` }),
    });

    if (!leaguesResponse?.data) {
      return NextResponse.json({
        success: false,
        error: 'No leagues found',
        message: `No leagues found for country ${countryId}`
      }, { status: 404 });
    }

    // Filter only active leagues
    const activeLeagues = leaguesResponse.data.filter((league: { active?: boolean | null }) => league.active === true);
    
    console.log(`API: Successfully fetched ${activeLeagues.length} active leagues for country ${countryId}`);
    
    return NextResponse.json({
      success: true,
      data: activeLeagues,
      pagination: leaguesResponse.pagination,
      timestamp: new Date().toISOString(),
      // Include metadata for client-side caching
      metadata: {
        countryId: parseInt(countryId),
        idAfter: idAfter || null,
        populate: populate,
        totalCount: activeLeagues.length,
        hasMore: leaguesResponse.pagination?.has_more || false,
        // Cache headers for 24-hour caching
        cacheControl: 'public, max-age=86400, stale-while-revalidate=3600', // 24 hours with 1 hour stale-while-revalidate
      }
    });
  } catch (error) {
    const { countryId: errorCountryId } = await params;
    console.error(`API: Error fetching optimized leagues for country ${errorCountryId}:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch optimized leagues data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
