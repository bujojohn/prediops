import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * States endpoint using local data files
 * Follows SportMonks best practices by using cached static entities
 * Eliminates API calls for static data like states
 */
export async function GET() {
  try {
    console.log('API: Fetching states from local data...');
    
    // Read states data from local file
    const dataPath = join(process.cwd(), 'data', 'states.json');
    const statesData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    if (!statesData?.data) {
      return NextResponse.json({
        success: false,
        error: 'No states data found',
        message: 'Failed to load local states data'
      }, { status: 404 });
    }

    console.log(`API: Successfully loaded ${statesData.data.length} states from local data`);
    
    return NextResponse.json({
      success: true,
      data: statesData.data,
      timestamp: new Date().toISOString(),
      metadata: {
        totalCount: statesData.data.length,
        source: 'local-data',
      }
    });
  } catch (error) {
    console.error('API: Error loading local states data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load local states data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
