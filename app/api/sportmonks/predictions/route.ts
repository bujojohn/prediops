import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Use default configuration (includes fixture and type, filters by predictionTypes:237)
    const predictions = await sportmonks.getPredictions();
    
    // Apply limit if specified
    const limitedData = limit && predictions?.data ? {
      ...predictions,
      data: predictions.data.slice(0, limit)
    } : predictions;
    
    return NextResponse.json({
      success: true,
      data: limitedData,
      timestamp: new Date().toISOString(),
      count: limitedData?.data?.length || 0,
    });
  } catch (error) {
    console.error('Predictions API Error:', error);
    
    // Return proper error response instead of misleading mock data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch predictions',
        message: errorMessage,
        note: 'Check your SportMonks API configuration'
      },
      { status: 500 }
    );
  }
} 