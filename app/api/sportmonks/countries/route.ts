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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include') || 'leagues';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Get countries with leagues
    const countries = await sportmonks.getCountries({
      include,
      per_page: limit,
      page,
    });

    if (!countries?.data) {
      return NextResponse.json(
        { success: false, error: 'No countries found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: countries.data,
      pagination: countries.pagination,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching countries:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch countries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 