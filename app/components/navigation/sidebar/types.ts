import type { Country } from '@/schemas/country.schema';

/**
 * Shared Types for Sidebar Components
 */

export interface CountryWithLeagues extends Country {
  fixtureCount: number;
  leaguesCount: number;
}

export interface League {
  id: number;
  name: string;
  active: boolean;
  type?: string;
  short_code?: string;
  country_id?: number;
}

export interface Team {
  id: number;
  name: string;
  image_path?: string;
  country_id?: number;
}

export interface Fixture {
  id: number;
  starting_at: string;
  participants: { id: number; name: string }[];
  league: { id: number; name: string; country_id?: number };
}

export interface SearchResults {
  countries: CountryWithLeagues[];
  leagues: { country: CountryWithLeagues; league: League }[];
  teams: { country: CountryWithLeagues; team: Team }[];
  tournaments: CountryWithLeagues[];
  fixtures: {
    fixture: Fixture;
    country: CountryWithLeagues;
  }[];
  hasResults: boolean;
}

export interface TopLeague {
  id: number;
  name: string;
  country: string;
  short_code: string;
  countryId: number;
}

export interface SearchDataCache<T> {
  data: T[];
  timestamp: number;
  ttl: number;
}

