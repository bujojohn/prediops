import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockLiveFixtures } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    // Use default configuration (includes participants:name, scores, state)
    const liveFixtures = await sportmonks.getLiveFixtures();
    
    return NextResponse.json({
      success: true,
      data: liveFixtures,
      timestamp: new Date().toISOString(),
      count: liveFixtures?.data?.length || 0,
    });
  } catch (error) {
    console.error('Live Fixtures API Error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Not an Error instance');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check for various error conditions
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Return mock data if API is not configured or unauthorized
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json({
        success: true,
        data: mockLiveFixtures,
        timestamp: new Date().toISOString(),
        count: mockLiveFixtures.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    // Return mock data for network errors or other issues
    if (errorMessage.includes('Network Error') || errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
      return NextResponse.json({
        success: true,
        data: mockLiveFixtures,
        timestamp: new Date().toISOString(),
        count: mockLiveFixtures.data.length,
        note: 'Using mock data - Network error'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch live fixtures',
        message: errorMessage
      },
      { status: 500 }
    );
  }
} 