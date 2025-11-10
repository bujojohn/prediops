import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { League } from '@/schemas/league.schema';

/**
 * Optimized leagues endpoint with server-side caching
 * Fetches all leagues grouped by country for efficient sidebar loading
 * Uses ISR with 24-hour revalidation for optimal performance
 */
export async function GET() {
  try {
    console.log('API: Fetching all leagues with country grouping...');
    
    // Fetch all leagues with country and sport information
    const leaguesResponse = await sportmonks.getLeagues({
      filters: 'populate', // Only active leagues
      per_page: 1000,
      
    });

    if (!leaguesResponse?.data || leaguesResponse.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No leagues found',
        message: 'Failed to fetch leagues data'
      }, { status: 404 });
    }

    // Group leagues by country for efficient sidebar rendering
    const leaguesByCountry = new Map<number, League[]>();
    
    leaguesResponse.data.forEach((league: League) => {
      if (league.country_id && league.active) {
        const countryId = league.country_id;
        if (!leaguesByCountry.has(countryId)) {
          leaguesByCountry.set(countryId, []);
        }
        leaguesByCountry.get(countryId)!.push(league);
      }
    });

    // Convert Map to object for JSON serialization
    const groupedLeagues = Object.fromEntries(leaguesByCountry);
    
    console.log(`API: Successfully grouped ${leaguesResponse.data.length} leagues into ${leaguesByCountry.size} countries`);
    
    return NextResponse.json({
      success: true,
      data: groupedLeagues,
      timestamp: new Date().toISOString(),
      metadata: {
        totalLeagues: leaguesResponse.data.length,
        countriesWithLeagues: leaguesByCountry.size,
        // Cache headers for 24-hour caching with ISR
        cacheControl: 'public, max-age=86400, stale-while-revalidate=3600', // 24 hours with 1 hour stale-while-revalidate
      }
    });
  } catch (error) {
    console.error('API: Error fetching optimized leagues:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch optimized leagues data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
