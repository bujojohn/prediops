import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockLiveFixtures } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const latestScores = await sportmonks.getLatestLiveScores({
      include: 'participants;scores;state;predictions;league;venue',
      sortBy: 'starting_at',
      order: 'desc',
      per_page: 50,
    });
    
    return NextResponse.json({
      success: true,
      data: latestScores,
      timestamp: new Date().toISOString(),
      count: latestScores?.data?.length || 0,
    });
  } catch (error) {
    console.error('Latest Live Scores API Error:', error);
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
        error: 'Failed to fetch latest live scores',
        message: errorMessage
      },
      { status: 500 }
    );
  }
} 