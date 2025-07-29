import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockLiveFixtures } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const liveFixtures = await sportmonks.getLiveFixtures();
    
    return NextResponse.json({
      success: true,
      data: liveFixtures,
      timestamp: new Date().toISOString(),
      count: liveFixtures?.data?.length || 0,
    });
  } catch (error) {
    console.error('Live Fixtures API Error:', error);
    
    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({
        success: true,
        data: mockLiveFixtures,
        timestamp: new Date().toISOString(),
        count: mockLiveFixtures.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch live fixtures',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 