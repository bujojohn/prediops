import { getCountryById } from '@/lib/data/countries';

/**
 * Resolves country name from league data with multiple fallback strategies
 * @param league League object with country information
 * @returns Country name or 'Other' if unable to resolve
 */
export function resolveCountryName(league?: { country?: { name?: string | null; id?: number } | null; name?: string | null }): string {
  if (!league) return 'Other';
  
  // Try to get country name from multiple sources
  let country = league.country?.name;
  
  // If country name is missing, try to resolve from country_id
  if (!country && league.country?.id) {
    const countryData = getCountryById(league.country.id);
    country = countryData?.name || undefined;
  }
  
  // If still no country, try to infer from league name for known leagues
  if (!country) {
    const leagueName = league.name?.toLowerCase() || '';
    if (leagueName.includes('bundesliga')) country = 'Germany';
    else if (leagueName.includes('ligue 1') || leagueName.includes('ligue1')) country = 'France';
    else if (leagueName.includes('premier league')) country = 'England';
    else if (leagueName.includes('serie a') || leagueName.includes('seriea')) country = 'Italy';
    else if (leagueName.includes('la liga') || leagueName.includes('laliga')) country = 'Spain';
    else if (leagueName.includes('eredivisie')) country = 'Netherlands';
    else if (leagueName.includes('primeira liga') || leagueName.includes('liga portugal')) country = 'Portugal';
    else if (leagueName.includes('super lig') || leagueName.includes('superlig')) country = 'Turkey';
    else if (leagueName.includes('jupiler pro league')) country = 'Belgium';
    else if (leagueName.includes('scottish premiership')) country = 'Scotland';
    else if (leagueName.includes('championship')) country = 'England';
    else if (leagueName.includes('league 1') || leagueName.includes('league1')) country = 'England';
    else if (leagueName.includes('league 2') || leagueName.includes('league2')) country = 'England';
    else country = 'Other';
  }
  
  return country;
}

/**
 * Creates a league group title with proper country resolution
 * @param league League object
 * @returns Formatted title like "Germany - Bundesliga"
 */
export function createLeagueGroupTitle(league?: { country?: { name?: string | null; id?: number } | null; name?: string | null }): string {
  const country = resolveCountryName(league);
  const leagueName = league?.name || 'League';
  return `${country} - ${leagueName}`;
}
