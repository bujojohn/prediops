import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET() {
  try {
    // Test basic API connectivity
    const response = await sportmonks.getLeagues({
      per_page: 1,
      page: 1
    });

    return NextResponse.json({
      success: true,
      status: 'API is working',
      timestamp: new Date().toISOString(),
      data: {
        hasLeagues: response?.data && response.data.length > 0,
        totalLeagues: response?.data?.length || 0,
        pagination: response?.pagination
      }
    });
  } catch (error) {
    console.error('SportMonks Health Check Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        status: 'API is not working',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Check if SPORTMONKS_API_TOKEN is set in your environment variables',
          'Verify your API token is valid and has the required permissions',
          'Check if you have reached your API rate limits',
          'Ensure your internet connection is working'
        ]
      },
      { status: 500 }
    );
  }
}
