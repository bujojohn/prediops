import type { Team } from '@/schemas/team.schema';
import type { Participant } from '@/schemas/participant.schema';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Country } from '@/schemas/country.schema';
import type { League } from '@/schemas/league.schema';
import { generateTeamSlug } from './team-utils';
import { generateCountrySlug } from './country-utils';

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
  TEAM_PREDICTIONS: (teamId: string, slug: string) => `/team/${teamId}/${slug}#predictions`,
  TEAM_FIXTURES: (teamId: string, slug: string) => `/team/${teamId}/${slug}#fixtures`,
  
  // Country routes
  COUNTRY_BASE: '/country',
  COUNTRY_DETAIL: (countryId: string) => `/country/${countryId}`,
  COUNTRY_PREDICTIONS: (countryId: string, slug: string) => `/predictions/country/${slug}?id=${countryId}`,
  
  // League routes
  LEAGUE_BASE: '/league',
  LEAGUE_DETAIL: (leagueId: string) => `/league/${leagueId}`,
  LEAGUE_PREDICTIONS: (leagueId: string, slug: string) => `/predictions/league/${slug}?id=${leagueId}`,
  
  // Fixture routes
  FIXTURE_DETAIL: (fixtureId: string) => `/fixtures/${fixtureId}`,
} as const;

/**
 * Generate URL for a team
 */
export function generateTeamUrl(team: Team | Participant): string {
  const teamId = team.id.toString();
  const slug = generateTeamSlug(team);
  return ROUTES.TEAM_DETAIL(teamId, slug);
}

/**
 * Generate URL for a team with fixture context
 */
export function generateTeamFixtureUrl(team: Team | Participant, fixtureId?: string): string {
  const teamId = team.id.toString();
  const slug = generateTeamSlug(team);
  
  if (fixtureId) {
    // Link to team page with fixtures tab and scroll to specific fixture
    return `${ROUTES.TEAM_FIXTURES(teamId, slug)}&fixture=${fixtureId}`;
  }
  
  return ROUTES.TEAM_FIXTURES(teamId, slug);
}

/**
 * Generate URL for a country
 */
export function generateCountryUrl(country: Country): string {
  return ROUTES.COUNTRY_DETAIL(country.id.toString());
}

/**
 * Generate URL for a country's predictions
 */
export function generateCountryPredictionsUrl(country: Country): string {
  const slug = generateCountrySlug(country);
  return ROUTES.COUNTRY_PREDICTIONS(country.id.toString(), slug);
}

/**
 * Generate URL for a league
 */
export function generateLeagueUrl(league: League): string {
  return ROUTES.LEAGUE_DETAIL(league.id.toString());
}

/**
 * Generate URL for a league's predictions
 */
export function generateLeaguePredictionsUrl(league: League): string {
  const slug = league.name?.toLowerCase().replace(/\s+/g, '-') || `league-${league.id}`;
  return ROUTES.LEAGUE_PREDICTIONS(league.id.toString(), slug);
}

/**
 * Generate URL for a fixture
 */
export function generateFixtureUrl(fixture: Fixture): string {
  return ROUTES.FIXTURE_DETAIL(fixture.id.toString());
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
