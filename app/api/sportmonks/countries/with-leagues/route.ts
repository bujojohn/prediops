import { NextResponse } from 'next/server';
import { getCountriesWithLeagues } from '@/lib/utils/country-utils';

export async function GET() {
  try {
    console.log('API: Fetching countries with leagues...');
    
    const countries = await getCountriesWithLeagues();
    
    console.log(`API: Successfully fetched ${countries.length} countries with leagues`);
    
    return NextResponse.json({
      success: true,
      data: countries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API: Error fetching countries with leagues:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch countries with leagues',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
