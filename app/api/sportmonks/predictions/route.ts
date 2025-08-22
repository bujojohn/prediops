import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockPredictions } from '@/lib/mock-data';

export async function GET() {
  try {
    // Use default configuration (includes fixture and type, filters by predictionTypes:237)
    const predictions = await sportmonks.getPredictions();
    
    return NextResponse.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString(),
      count: predictions?.data?.length || 0,
    });
  } catch (error) {
    console.error('Predictions API Error:', error);
    
    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({
        success: true,
        data: mockPredictions,
        timestamp: new Date().toISOString(),
        count: mockPredictions.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch predictions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 