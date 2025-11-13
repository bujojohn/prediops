import type { Fixture } from '@/schemas/fixture.schema';
import type { League } from '@/schemas/league.schema';
import type { Country } from '@/schemas/country.schema';
import type { Continent } from '@/schemas/continent.schema';
import { dateKeyUTC, formatDateLocal } from '@/lib/utils';
import { createLeagueGroupTitle } from '@/lib/utils/league-utils';

export interface FixtureGroupMeta {
  league?: League | null;
  country?: Country | null;
  continent?: Continent | null;
}

export interface FixtureGroup {
  id: string;
  title: string;
  fixtures: Fixture[];
  meta?: FixtureGroupMeta;
}

/**
 * Groups fixtures by date
 */
export function groupByDate(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, { title: string; fixtures: Fixture[] }>();
  
  for (const fixture of fixtures) {
    const key = fixture.starting_at ? dateKeyUTC(fixture.starting_at) : 'unknown';
    const title = fixture.starting_at ? formatDateLocal(fixture.starting_at) : 'Unknown Date';
    const entry = map.get(key) || { title, fixtures: [] };
    entry.fixtures.push(fixture);
    map.set(key, entry);
  }
  
  return Array.from(map.entries()).map(([id, { title, fixtures }]) => ({
    id,
    title,
    fixtures,
  }));
}

/**
 * Groups fixtures by league
 */
export function groupByLeague(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<
    string,
    { title: string; fixtures: Fixture[]; meta?: FixtureGroupMeta }
  >();
  
  for (const fixture of fixtures) {
    const key = createLeagueGroupTitle(fixture.league || undefined);
    const league = fixture.league ?? null;
    const country = (league?.country as Country | undefined | null) ?? null;
    const continent = country?.continent ?? null;

    const existing = map.get(key);
    if (existing) {
      existing.fixtures.push(fixture);
      existing.meta = {
        league: existing.meta?.league ?? league,
        country: existing.meta?.country ?? country ?? null,
        continent: existing.meta?.continent ?? continent ?? null,
      };
    } else {
      map.set(key, {
        title: key,
        fixtures: [fixture],
        meta: {
          league,
          country: country ?? null,
          continent: continent ?? null,
        },
      });
    }
  }
  
  return Array.from(map.entries()).map(([id, { title, fixtures, meta }]) => ({
    id,
    title,
    fixtures,
    meta,
  }));
}

/**
 * Determines which date groups should be collapsed based on selected date
 * @param groups - Array of fixture groups
 * @param selectedDate - The currently selected date (ISO string)
 * @returns Set of group IDs that should be collapsed
 */
export function getInitialCollapsedDates(groups: FixtureGroup[], selectedDate: string): Set<string> {
  const collapsedDates = new Set<string>();
  
  groups.forEach(group => {
    // Check if this group contains fixtures for the selected date
    const hasSelectedDateFixture = group.fixtures.some(fixture => {
      if (!fixture.starting_at) return false;
      const fixtureDate = new Date(fixture.starting_at).toISOString().split('T')[0];
      return fixtureDate === selectedDate;
    });
    
    // If not the selected date's group, collapse it
    if (!hasSelectedDateFixture) {
      collapsedDates.add(group.id);
    }
  });
  
  return collapsedDates;
}
