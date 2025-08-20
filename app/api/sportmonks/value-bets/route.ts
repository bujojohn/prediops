import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockValueBets } from '@/lib/mock-data';

export async function GET(_request: NextRequest) {
  try {
    // Use default configuration (includes fixture:name)
    const valueBets = await sportmonks.getValueBets();
    
    return NextResponse.json({
      success: true,
      data: valueBets,
      timestamp: new Date().toISOString(),
      count: valueBets?.data?.length || 0,
    });
  } catch (error) {
    console.error('Value Bets API Error:', error);
    
    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({
        success: true,
        data: mockValueBets,
        timestamp: new Date().toISOString(),
        count: mockValueBets.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch value bets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 