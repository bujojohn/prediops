import { Country } from '@/schemas/country.schema';
import { getCountries } from '@/lib/data/countries';
import { sportmonks } from '@/lib/sportmonks';

/**
 * Generate a SEO-friendly slug from a country name
 */
export function generateCountrySlug(country: Country): string {
  const name = country.name || country.fifa_name || country.official_name || 'unknown';
  
  // Handle special cases and edge cases
  let slug = name
    .toLowerCase()
    .trim()
    // Replace spaces and common separators with hyphens
    .replace(/[\s\-_]+/g, '-')
    // Remove special characters that could cause routing issues
    .replace(/[^a-z0-9\-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  // Ensure we have a valid slug
  if (!slug || slug.length === 0) {
    slug = `country-${country.id}`;
  }
  
  // Debug logging
  console.log(`Generated slug for ${name} (ID: ${country.id}): ${slug}`);
  
  return slug;
}

/**
 * Generate the full URL for a country's predictions page
 */
export function getCountryPredictionsUrl(country: Country, leagueId?: number): string {
  const slug = generateCountrySlug(country);
  // Use the predictions/country route which actually exists
  const baseUrl = `/predictions/country/${slug}?id=${country.id}`;
  
  if (leagueId) {
    return `${baseUrl}&league=${leagueId}`;
  }
  
  return baseUrl;
}

/**
 * Find a country by its slug
 */
export function findCountryBySlug(countries: Country[], slug: string): Country | undefined {
  return countries.find(country => {
    const countrySlug = generateCountrySlug(country);
    return countrySlug === slug.toLowerCase();
  });
}

/**
 * Get country display name with fallbacks
 */
export function getCountryDisplayName(country: Country): string {
  return country.name || country.fifa_name || country.official_name || 'Unknown Country';
}

/**
 * Cache for countries with available leagues
 */
let countriesWithLeaguesCache: { countries: (Country & { fixtureCount: number; leaguesCount: number })[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get countries that have available leagues (with caching) - OPTIMIZED VERSION
 */
export async function getCountriesWithLeagues(): Promise<(Country & { fixtureCount: number; leaguesCount: number })[]> {
  // Check cache first
  if (countriesWithLeaguesCache && Date.now() - countriesWithLeaguesCache.timestamp < CACHE_DURATION) {
    return countriesWithLeaguesCache.countries;
  }

  try {
    // Use the new leagues by fixture date endpoint to get only countries with active leagues today
    const today = new Date().toISOString().split('T')[0];
    const leaguesResponse = await sportmonks.getLeaguesByFixtureDate(today, {
      include: 'country',
      per_page: 50, // SportMonks max per_page is 50
      page: 1
    });

    if (leaguesResponse?.data) {
      // Group leagues by country and count them
      const countryLeaguesMap = new Map<number, { country: any; leaguesCount: number; fixtureCount: number }>();
      
      leaguesResponse.data.forEach((league: any) => {
        const countryId = league.country_id || league.country?.id;
        if (countryId && league.active) { // Only count active leagues
          if (!countryLeaguesMap.has(countryId)) {
            countryLeaguesMap.set(countryId, {
              country: league.country,
              leaguesCount: 0,
              fixtureCount: 0
            });
          }
          const countryData = countryLeaguesMap.get(countryId)!;
          countryData.leaguesCount++;
          countryData.fixtureCount += 1; // Base fixture count per active league
        }
      });

      // Get all countries from local data
      const allCountries = getCountries();
      
      // Map countries with their league data
      const countriesWithLeagues = allCountries
        .filter(country => countryLeaguesMap.has(country.id))
        .map(country => {
          const leagueData = countryLeaguesMap.get(country.id)!;
          return {
            ...country,
            fixtureCount: leagueData.fixtureCount,
            leaguesCount: leagueData.leaguesCount
          };
        })
        .sort((a, b) => (b.fixtureCount || 0) - (a.fixtureCount || 0)); // Sort by fixture count

      // Update cache
      countriesWithLeaguesCache = {
        countries: countriesWithLeagues,
        timestamp: Date.now()
      };

      console.log(`Found ${countriesWithLeagues.length} countries with leagues for today`);
      return countriesWithLeagues;
    }
  } catch (error) {
    console.error('Error fetching countries with leagues:', error);
  }

  // Fallback: return all countries if API fails
  const allCountries = getCountries();
  return allCountries.map(country => ({ ...country, fixtureCount: 0, leaguesCount: 0 }));
}

/**
 * Get leagues for a specific country using the new optimized endpoint
 */
export async function getCountryLeagues(countryId: number): Promise<any[]> {
  try {
    const leaguesResponse = await sportmonks.getLeaguesByCountryId(countryId.toString(), {
      include: 'country;sport;currentseason',
      per_page: 50,
      page: 1
    });

    if (leaguesResponse?.data) {
      // Sort leagues by name and filter active ones
      const sortedLeagues = leaguesResponse.data
        .filter((league: any) => league.active)
        .sort((a: any, b: any) => {
          const nameA = a.name?.toLowerCase() || '';
          const nameB = b.name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });

      console.log(`Found ${sortedLeagues.length} active leagues for country ${countryId}`);
      return sortedLeagues;
    }
  } catch (error) {
    console.error(`Error fetching leagues for country ${countryId}:`, error);
  }

  return [];
}

/**
 * Clear the countries with leagues cache
 */
export function clearCountriesWithLeaguesCache(): void {
  countriesWithLeaguesCache = null;
}
