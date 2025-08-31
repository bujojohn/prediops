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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's an API authentication error
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API authentication failed',
          message: 'No scheduled fixtures found - please check your SportMonks API configuration',
          details: 'Invalid or missing API token'
        },
        { status: 401 }
      );
    }
    
    // Check if it's a rate limit or service error
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('Service unavailable')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Service temporarily unavailable',
          message: 'No scheduled fixtures found - please try again later',
          details: 'API rate limit exceeded or service unavailable'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch countries',
        message: 'No scheduled fixtures found - please try again later',
        details: errorMessage,
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
        { 
          success: false, 
          error: 'No countries found',
          message: 'No scheduled fixtures found for today'
        },
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's an API authentication error
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API authentication failed',
          message: 'No scheduled fixtures found - please check your SportMonks API configuration',
          details: 'Invalid or missing API token'
        },
        { status: 401 }
      );
    }
    
    // Check if it's a rate limit or service error
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('Service unavailable')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Service temporarily unavailable',
          message: 'No scheduled fixtures found - please try again later',
          details: 'API rate limit exceeded or service unavailable'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch countries',
        message: 'No scheduled fixtures found - please try again later',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 