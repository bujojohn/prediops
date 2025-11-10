import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Types endpoint using local data files
 * Follows SportMonks best practices by using cached static entities
 * Eliminates API calls for static data like types
 */
export async function GET() {
  try {
    console.log('API: Fetching types from local data...');
    
    // Read types data from local file
    const dataPath = join(process.cwd(), 'data', 'types.json');
    const typesData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    if (!typesData?.data) {
      return NextResponse.json({
        success: false,
        error: 'No types data found',
        message: 'Failed to load local types data'
      }, { status: 404 });
    }

    console.log(`API: Successfully loaded ${typesData.data.length} types from local data`);
    
    return NextResponse.json({
      success: true,
      data: typesData.data,
      timestamp: new Date().toISOString(),
      metadata: {
        totalCount: typesData.data.length,
        source: 'local-data',
      }
    });
  } catch (error) {
    console.error('API: Error loading local types data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load local types data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
