import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Optimized countries endpoint using local data files
 * Follows SportMonks best practices by using cached static entities
 * Eliminates API calls for static data like countries, types, and states
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idAfter = searchParams.get('idAfter');
    const populate = searchParams.get('populate') === 'true';
    
    console.log('API: Fetching countries from local data...', { idAfter, populate });
    
    // Read countries data from local file
    const dataPath = join(process.cwd(), 'data', 'countries.json');
    const countriesData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    if (!countriesData?.data) {
      return NextResponse.json({
        success: false,
        error: 'No countries data found',
        message: 'Failed to load local countries data'
      }, { status: 404 });
    }

    let countries = countriesData.data;
    
    // Apply idAfter filter for incremental updates (if needed)
    if (idAfter) {
      const idAfterNum = parseInt(idAfter);
      countries = countries.filter((country: { id: number }) => country.id > idAfterNum);
    }

    console.log(`API: Successfully loaded ${countries.length} countries from local data`);
    
    return NextResponse.json({
      success: true,
      data: countries,
      timestamp: new Date().toISOString(),
      // Include metadata for client-side caching
      metadata: {
        idAfter: idAfter || null,
        populate: populate,
        totalCount: countries.length,
        hasMore: false, // Local data is complete
        source: 'local-data', // Indicates data source
      }
    });
  } catch (error) {
    console.error('API: Error loading local countries data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load local countries data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
