import type { Fixture } from '@/schemas/fixture.schema';

export interface FixtureFilters {
  searchQuery: string;
  leagues: string[];
  teams: string[];
  status: ('live' | 'upcoming' | 'finished')[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  hasPredictions: boolean | null;
  hasValueBets: boolean | null;
}

export const DEFAULT_FILTERS: FixtureFilters = {
  searchQuery: '',
  leagues: [],
  teams: [],
  status: [],
  dateRange: { from: null, to: null },
  hasPredictions: null,
  hasValueBets: null,
};

/**
 * Filter fixtures based on search query and filters
 */
export function filterFixtures(fixtures: Fixture[], filters: FixtureFilters): Fixture[] {
  return fixtures.filter(fixture => {
    // Search query filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home')?.name?.toLowerCase() || '';
      const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away')?.name?.toLowerCase() || '';
      const leagueName = fixture.league?.name?.toLowerCase() || '';
      
      if (!homeTeam.includes(searchLower) && 
          !awayTeam.includes(searchLower) && 
          !leagueName.includes(searchLower)) {
        return false;
      }
    }

    // League filter
    if (filters.leagues.length > 0) {
      const fixtureLeague = fixture.league?.name || '';
      if (!filters.leagues.includes(fixtureLeague)) {
        return false;
      }
    }

    // Team filter
    if (filters.teams.length > 0) {
      const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home')?.name || '';
      const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away')?.name || '';
      
      if (!filters.teams.includes(homeTeam) && !filters.teams.includes(awayTeam)) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0) {
      const fixtureStatus = getFixtureStatus(fixture);
      if (!filters.status.includes(fixtureStatus)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      if (!fixture.starting_at) return false;
      
      const fixtureDate = new Date(fixture.starting_at).toISOString().split('T')[0];
      
      if (filters.dateRange.from && fixtureDate < filters.dateRange.from) {
        return false;
      }
      
      if (filters.dateRange.to && fixtureDate > filters.dateRange.to) {
        return false;
      }
    }

    // Predictions filter
    if (filters.hasPredictions !== null) {
      const hasPredictions = !!(fixture.predictions && fixture.predictions.length > 0);
      if (hasPredictions !== filters.hasPredictions) {
        return false;
      }
    }

    // Value bets filter (this would need to be implemented based on your value bet logic)
    if (filters.hasValueBets !== null) {
      // Placeholder - you'll need to implement this based on your value bet detection logic
      const hasValueBets = false; // TODO: Implement value bet detection
      if (hasValueBets !== filters.hasValueBets) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get fixture status based on current time and fixture data
 */
export function getFixtureStatus(fixture: Fixture): 'live' | 'upcoming' | 'finished' {
  if (!fixture.starting_at) return 'upcoming';
  
  const now = new Date();
  const fixtureTime = new Date(fixture.starting_at);
  
  // If fixture has a result, it's finished
  if (fixture.result_info || (fixture.scores && fixture.scores.length > 0)) {
    return 'finished';
  }
  
  // If fixture is in the past but no result, consider it finished
  if (fixtureTime < now) {
    return 'finished';
  }
  
  // If fixture is starting soon (within 2 hours), consider it live
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (fixtureTime <= twoHoursFromNow) {
    return 'live';
  }
  
  return 'upcoming';
}

/**
 * Extract unique leagues from fixtures
 */
export function extractLeagues(fixtures: Fixture[]): string[] {
  const leagues = new Set<string>();
  fixtures.forEach(fixture => {
    if (fixture.league?.name) {
      leagues.add(fixture.league.name);
    }
  });
  return Array.from(leagues).sort();
}

/**
 * Extract unique teams from fixtures
 */
export function extractTeams(fixtures: Fixture[]): string[] {
  const teams = new Set<string>();
  fixtures.forEach(fixture => {
    fixture.participants?.forEach(participant => {
      if (participant.name) {
        teams.add(participant.name);
      }
    });
  });
  return Array.from(teams).sort();
}

/**
 * Get filter summary for display
 */
export function getFilterSummary(filters: FixtureFilters): string {
  const parts: string[] = [];
  
  if (filters.searchQuery) {
    parts.push(`Search: "${filters.searchQuery}"`);
  }
  
  if (filters.leagues.length > 0) {
    parts.push(`${filters.leagues.length} league${filters.leagues.length > 1 ? 's' : ''}`);
  }
  
  if (filters.teams.length > 0) {
    parts.push(`${filters.teams.length} team${filters.teams.length > 1 ? 's' : ''}`);
  }
  
  if (filters.status.length > 0) {
    parts.push(filters.status.join(', '));
  }
  
  if (filters.dateRange.from || filters.dateRange.to) {
    const dateRange = [];
    if (filters.dateRange.from) dateRange.push(`from ${filters.dateRange.from}`);
    if (filters.dateRange.to) dateRange.push(`to ${filters.dateRange.to}`);
    parts.push(dateRange.join(' '));
  }
  
  if (filters.hasPredictions === true) {
    parts.push('with predictions');
  }
  
  if (filters.hasValueBets === true) {
    parts.push('with value bets');
  }
  
  return parts.join(' • ');
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FixtureFilters): boolean {
  return !!(
    filters.searchQuery ||
    filters.leagues.length > 0 ||
    filters.teams.length > 0 ||
    filters.status.length > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.hasPredictions !== null ||
    filters.hasValueBets !== null
  );
}
