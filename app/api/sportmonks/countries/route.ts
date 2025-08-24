import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body || {};

    const response = await sportmonks.getCountries(config);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Countries API Error:', error);
    
    // Return proper error response instead of misleading mock data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch countries',
        message: errorMessage,
        note: 'Check your SportMonks API configuration'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await sportmonks.getCountries({
      include: 'continent;leagues:name,official_name,fifa_name,iso2,iso3,image_path',
      order: 'asc',
      sortBy: 'name'
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Countries API Error:', error);
    
    // Return proper error response instead of misleading mock data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch countries',
        message: errorMessage,
        note: 'Check your SportMonks API configuration'
      },
      { status: 500 }
    );
  }
} 