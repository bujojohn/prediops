import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Use configuration that includes all necessary data for live match detection
    const liveFixtures = await sportmonks.getLiveFixtures({
      include: 'participants;scores;state;predictions.type;league.country;events;periods.type;events.period;events.type;metadata.type',
      sortBy: 'starting_at',
      order: 'desc',
      per_page: 50,
      page: 1
    });
    
    // Apply limit if specified
    const limitedData = limit && liveFixtures?.data ? {
      ...liveFixtures,
      data: liveFixtures.data.slice(0, limit)
    } : liveFixtures;
    
    return NextResponse.json({
      success: true,
      data: limitedData,
      timestamp: new Date().toISOString(),
      count: limitedData?.data?.length || 0,
    });
  } catch (error) {
    console.error('Live Fixtures API Error:', error);
    
    // Return proper error response instead of misleading mock data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch live fixtures',
        message: errorMessage,
        note: 'Check your SportMonks API configuration'
      },
      { status: 500 }
    );
  }
}
