import { readFileSync } from 'fs';
import { join } from 'path';

export interface Country {
  id: number;
  name: string;
  image_path: string;
  fifa_name?: string;
  official_name?: string;
  leagues?: League[];
  leaguesCount?: number;
  fixtureCount?: number;
}

export interface League {
  id: number;
  name: string;
  image_path: string;
  country_id: number;
  active?: boolean | null;
}

/**
 * Load countries data from local JSON file
 * This eliminates API calls and provides instant loading
 */
export function loadCountriesData(): Country[] {
  try {
    const dataPath = join(process.cwd(), 'data', 'countries.json');
    const countriesData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    if (!countriesData?.data) {
      console.warn('No countries data found in local file');
      return [];
    }

    // Transform the data to include leagues and counts
    return countriesData.data.map((country: any) => ({
      ...country,
      leagues: [], // Will be populated when needed
      leaguesCount: 0, // Will be calculated when needed
      fixtureCount: 0, // Removed as per requirements
    }));
  } catch (error) {
    console.error('Error loading local countries data:', error);
    return [];
  }
}

/**
 * Load countries data with leagues populated
 * This is a more comprehensive version that includes league data
 */
export function loadCountriesWithLeaguesData(): Country[] {
  try {
    const dataPath = join(process.cwd(), 'data', 'countries.json');
    const countriesData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    if (!countriesData?.data) {
      console.warn('No countries data found in local file');
      return [];
    }

    // For now, return countries without leagues
    // In a real implementation, you would load leagues data and populate them
    return countriesData.data.map((country: any) => ({
      ...country,
      leagues: [], // Will be populated when needed
      leaguesCount: 0, // Will be calculated when needed
      fixtureCount: 0, // Removed as per requirements
    }));
  } catch (error) {
    console.error('Error loading local countries with leagues data:', error);
    return [];
  }
}
