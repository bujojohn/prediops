import { Country } from '@/schemas/country.schema';
import { getCountries } from '@/lib/data/countries';

/**
 * Generate a SEO-friendly slug from a country name
 */
export function generateCountrySlug(country: Country): string {
  const name = country.name || country.fifa_name || country.official_name || 'unknown';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Generate the full URL for a country's predictions page
 */
export function getCountryPredictionsUrl(country: Country, leagueId?: number): string {
  const slug = generateCountrySlug(country);
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
let countriesWithLeaguesCache: { countries: (Country & { fixtureCount: number })[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get countries that have available leagues (with caching)
 */
export async function getCountriesWithLeagues(): Promise<(Country & { fixtureCount: number })[]> {
  // Check cache first
  if (countriesWithLeaguesCache && Date.now() - countriesWithLeaguesCache.timestamp < CACHE_DURATION) {
    return countriesWithLeaguesCache.countries;
  }

  try {
    // Fetch all leagues to determine which countries have data
    const response = await fetch('/api/sportmonks/leagues/country/available');
    const data = await response.json();
    
    if (data.success && data.data?.countries) {
      // Update cache
      countriesWithLeaguesCache = {
        countries: data.data.countries,
        timestamp: Date.now()
      };
      return data.data.countries;
    }
  } catch (error) {
    console.error('Error fetching countries with leagues:', error);
  }

  // Fallback: return all countries if API fails
  const allCountries = getCountries();
  return allCountries.map(country => ({ ...country, fixtureCount: 0 }));
}

/**
 * Clear the countries with leagues cache
 */
export function clearCountriesWithLeaguesCache(): void {
  countriesWithLeaguesCache = null;
}
