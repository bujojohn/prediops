/**
 * Centralized slug generation utilities for SEO-friendly URLs
 * 
 * All slugs are generated dynamically from entity names - no database storage needed.
 * Slugs are used in URLs alongside Sportmonks API IDs for better SEO.
 */

/**
 * Base slug generation function
 * Converts any text into a URL-safe slug
 * 
 * @param text - The text to convert to a slug
 * @param maxLength - Maximum length of the slug (default: 60)
 * @returns URL-safe slug
 * 
 * @example
 * generateSlug("Manchester United F.C.") → "manchester-united-fc"
 * generateSlug("Premier League 2023/24") → "premier-league-2023-24"
 */
export function generateSlug(text: string, maxLength: number = 60): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace whitespace with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, maxLength);
}

/**
 * Generate slug for a team
 * 
 * @example
 * generateTeamSlug({ id: 85, name: "Manchester United" })
 * → "manchester-united"
 */
export function generateTeamSlug(team: { id: number; name?: string | null }): string {
  // Debug logging - always log in development (both server and client)
  // Using console.log directly to ensure it always shows
  console.log('[generateTeamSlug] Input:', {
    teamId: team?.id,
    teamName: team?.name,
    hasName: !!team?.name,
    isClient: typeof window !== 'undefined',
    env: process.env.NODE_ENV
  });

  let slug: string;
  if (team.name) {
    slug = generateSlug(team.name);
  } else {
    slug = `team-${team.id}`;
  }

  // Debug logging - always log
  console.log('[generateTeamSlug] Output:', {
    slug,
    teamId: team?.id,
    teamName: team?.name,
    isClient: typeof window !== 'undefined',
    env: process.env.NODE_ENV
  });

  return slug;
}

/**
 * Generate slug for a league
 * 
 * @example
 * generateLeagueSlug({ id: 8, name: "Premier League" })
 * → "premier-league"
 */
export function generateLeagueSlug(league: { id: number; name?: string | null }): string {
  if (league.name) {
    return generateSlug(league.name);
  }
  return `league-${league.id}`;
}

/**
 * Generate slug for a country
 * 
 * @example
 * generateCountrySlug({ id: 462, name: "England" })
 * → "england"
 */
export function generateCountrySlug(country: { id: number; name?: string | null }): string {
  if (country.name) {
    return generateSlug(country.name);
  }
  return `country-${country.id}`;
}

/**
 * Generate slug for a fixture
 * Creates a descriptive slug from team names
 * 
 * @example
 * generateFixtureSlug({
 *   id: 18535517,
 *   participants: [
 *     { name: "Manchester United", meta: { location: "home" } },
 *     { name: "Liverpool", meta: { location: "away" } }
 *   ]
 * })
 * → "manchester-united-vs-liverpool"
 */
export function generateFixtureSlug(fixture: {
  id: number;
  participants?: Array<{
    name?: string | null;
    meta?: { location?: string | null; winner?: boolean | null; position?: number | null } | null;
  }> | null;
}): string {
  if (!fixture.participants || fixture.participants.length < 2) {
    return `fixture-${fixture.id}`;
  }

  const home = fixture.participants.find(p => p.meta?.location === 'home');
  const away = fixture.participants.find(p => p.meta?.location === 'away');

  if (home?.name && away?.name) {
    const homeSlug = generateSlug(home.name, 25);
    const awaySlug = generateSlug(away.name, 25);
    return `${homeSlug}-vs-${awaySlug}`;
  }

  // Fallback to first two participants if home/away not found
  const first = fixture.participants[0]?.name;
  const second = fixture.participants[1]?.name;

  if (first && second) {
    const firstSlug = generateSlug(first, 25);
    const secondSlug = generateSlug(second, 25);
    return `${firstSlug}-vs-${secondSlug}`;
  }

  return `fixture-${fixture.id}`;
}

/**
 * Normalize a slug for comparison
 * Useful for checking if two slugs are equivalent
 */
export function normalizeSlug(slug: string): string {
  return generateSlug(slug);
}

/**
 * Check if a slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) return false;
  
  // Should only contain lowercase letters, numbers, and hyphens
  const slugPattern = /^[a-z0-9-]+$/;
  return slugPattern.test(slug);
}

