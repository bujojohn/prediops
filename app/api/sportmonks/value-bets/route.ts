import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Use default configuration (includes fixture:name)
    const valueBets = await sportmonks.getValueBets();
    
    // Apply limit if specified
    const limitedData = limit && valueBets?.data ? {
      ...valueBets,
      data: valueBets.data.slice(0, limit)
    } : valueBets;
    
    return NextResponse.json({
      success: true,
      data: limitedData,
      timestamp: new Date().toISOString(),
      count: limitedData?.data?.length || 0,
    });
  } catch (error) {
    console.error('Value Bets API Error:', error);
    
    // Return proper error response instead of misleading mock data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch value bets',
        message: errorMessage,
        note: 'Check your SportMonks API configuration'
      },
      { status: 500 }
    );
  }
} 