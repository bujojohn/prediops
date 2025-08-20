import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockCountries } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body || {};

    const response = await sportmonks.getCountries(config);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Countries API Error:', error);
    
    // Return mock data on error
    return NextResponse.json({
      data: mockCountries,
      message: 'Using mock data due to API error'
    });
  }
}

export async function GET() {
  try {
    const response = await sportmonks.getCountries({
      include: 'continent;leagues',
      select: 'name,official_name,fifa_name,iso2,iso3,image_path',
      order: 'asc',
      sortBy: 'name'
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Countries API Error:', error);
    
    // Return mock data on error
    return NextResponse.json({
      data: mockCountries,
      message: 'Using mock data due to API error'
    });
  }
} 