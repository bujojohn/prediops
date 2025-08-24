import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET() {
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
    
    // Return proper error response instead of misleading mock data
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch latest live scores',
        message: errorMessage,
        note: 'Check your SportMonks API configuration'
      },
      { status: 500 }
    );
  }
} 