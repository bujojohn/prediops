import type { Team } from '@/schemas/team.schema';
import type { Participant } from '@/schemas/participant.schema';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Country } from '@/schemas/country.schema';
import type { League } from '@/schemas/league.schema';
import {
  generateTeamSlug,
  generateLeagueSlug,
  generateCountrySlug,
  generateFixtureSlug
} from './slug-utils';

/**
 * Centralized route definitions for the application
 */
export const ROUTES = {
  // Base routes
  HOME: '/',
  PREDICTIONS: '/predictions',
  LIVE: '/live',
  VALUE_BETS: '/value-bets',
  TEAMS: '/teams',
  
  // Team routes
  TEAM_BASE: '/team',
  TEAM_DETAIL: (teamId: string, slug: string) => `/team/${teamId}/${slug}`,
  TEAM_OVERVIEW: (teamId: string, slug: string) => `/team/${teamId}/${slug}#overview`,
  TEAM_PREDICTIONS: (teamId: string, slug: string) => `/team/${teamId}/${slug}#predictions`,
  TEAM_FIXTURES: (teamId: string, slug: string) => `/team/${teamId}/${slug}#fixtures`,
  
  // Country routes
  COUNTRY_BASE: '/country',
  COUNTRY_DETAIL: (countryId: string | number, slug: string) => `/country/${countryId}/${slug}`,
  COUNTRY_PREDICTIONS: (countryId: string | number, slug: string) => `/predictions/country/${countryId}/${slug}`,
  
  // League routes
  LEAGUE_BASE: '/league',
  LEAGUE_DETAIL: (leagueId: string | number, slug: string) => `/league/${leagueId}/${slug}`,
  LEAGUE_PREDICTIONS: (leagueId: string | number, slug: string) => `/predictions/league/${leagueId}/${slug}`,
  
  // Fixture routes
  FIXTURE_BASE: '/fixture',
  FIXTURE_DETAIL: (fixtureId: string | number, slug: string) => `/fixture/${fixtureId}/${slug}`,
} as const;

/**
 * Generate URL for a team (overview page)
 */
export function generateTeamUrl(team: Team | Participant): string {
  const teamId = team.id.toString();
  const slug = generateTeamSlug(team);
  return ROUTES.TEAM_OVERVIEW(teamId, slug);
}

/**
 * Generate URL for a team with fixture context
 */
export function generateTeamFixtureUrl(team: Team | Participant, fixtureId?: string): string {
  // Debug logging - always log in development (both server and client)
  if (process.env.NODE_ENV === 'development') {
    console.log('[generateTeamFixtureUrl] Input:', {
      teamId: team?.id,
      teamName: team?.name,
      fixtureId,
      hasTeam: !!team,
      isClient: typeof window !== 'undefined'
    });
  }

  const teamId = team.id.toString();
  const slug = generateTeamSlug(team);
  
  let url: string;
  if (fixtureId) {
    // Link to team page with fixtures tab and scroll to specific fixture
    // Query parameters must come before fragments in URLs
    // ROUTES.TEAM_FIXTURES returns /team/{teamId}/{slug}#fixtures
    // We need: /team/{teamId}/{slug}?fixture={fixtureId}#fixtures
    const baseUrl = ROUTES.TEAM_DETAIL(teamId, slug);
    url = `${baseUrl}?fixture=${fixtureId}#fixtures`;
  } else {
    url = ROUTES.TEAM_FIXTURES(teamId, slug);
  }

  // Debug logging - always log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[generateTeamFixtureUrl] Output:', {
      url,
      teamId,
      slug,
      fixtureId,
      isClient: typeof window !== 'undefined'
    });
  }

  return url;
}

/**
 * Generate URL for a country
 */
export function generateCountryUrl(country: Country): string {
  const slug = generateCountrySlug(country);
  return ROUTES.COUNTRY_DETAIL(country.id, slug);
}

/**
 * Generate URL for a country's predictions
 */
export function generateCountryPredictionsUrl(country: Country): string {
  const slug = generateCountrySlug(country);
  return ROUTES.COUNTRY_PREDICTIONS(country.id, slug);
}

/**
 * Generate URL for a league
 */
export function generateLeagueUrl(league: League): string {
  const slug = generateLeagueSlug(league);
  return ROUTES.LEAGUE_DETAIL(league.id, slug);
}

/**
 * Generate URL for a league's predictions
 */
export function generateLeaguePredictionsUrl(league: League): string {
  const slug = generateLeagueSlug(league);
  return ROUTES.LEAGUE_PREDICTIONS(league.id, slug);
}

/**
 * Generate URL for a fixture
 */
export function generateFixtureUrl(fixture: Fixture): string {
  const slug = generateFixtureSlug(fixture);
  return ROUTES.FIXTURE_DETAIL(fixture.id, slug);
}

/**
 * Generate URL for a fixture with team context
 */
export function generateFixtureTeamUrl(fixture: Fixture, teamId: string): string {
  const baseUrl = generateFixtureUrl(fixture);
  return `${baseUrl}?team=${teamId}`;
}

/**
 * Check if a URL is external
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Get link target for external URLs
 */
export function getLinkTarget(url: string, forceNewTab = false): '_blank' | '_self' | undefined {
  if (forceNewTab || isExternalUrl(url)) {
    return '_blank';
  }
  return undefined;
}

/**
 * Get rel attributes for external links
 */
export function getLinkRel(url: string, forceNewTab = false): string {
  if (forceNewTab || isExternalUrl(url)) {
    return 'noopener noreferrer';
  }
  return '';
}
