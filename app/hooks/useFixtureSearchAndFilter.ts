'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { 
  FixtureFilters, 
  DEFAULT_FILTERS, 
  filterFixtures,
  hasActiveFilters 
} from '@/app/components/fixtures/fixture-search-utils';

export interface UseFixtureSearchAndFilterOptions {
  initialFilters?: Partial<FixtureFilters>;
  debounceMs?: number;
}

export interface UseFixtureSearchAndFilterReturn {
  filters: FixtureFilters;
  filteredFixtures: Fixture[];
  hasActiveFilters: boolean;
  updateFilters: (filters: FixtureFilters) => void;
  updateFilter: <K extends keyof FixtureFilters>(key: K, value: FixtureFilters[K]) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof FixtureFilters) => void;
  filterStats: {
    total: number;
    filtered: number;
    leagues: number;
    teams: number;
  };
}

/**
 * Hook for managing fixture search and filtering
 * Provides filtered fixtures and filter management utilities
 */
export function useFixtureSearchAndFilter(
  fixtures: Fixture[],
  options: UseFixtureSearchAndFilterOptions = {}
): UseFixtureSearchAndFilterReturn {
  const { initialFilters = {} } = options;
  
  const [filters, setFilters] = useState<FixtureFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Memoized filtered fixtures
  const filteredFixtures = useMemo(() => {
    return filterFixtures(fixtures, filters);
  }, [fixtures, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: FixtureFilters) => {
    setFilters(newFilters);
  }, []);

  // Update single filter
  const updateFilter = useCallback(<K extends keyof FixtureFilters>(
    key: K, 
    value: FixtureFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key: keyof FixtureFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: DEFAULT_FILTERS[key],
    }));
  }, []);

  // Check if any filters are active
  const hasActiveFiltersState = useMemo(() => {
    return hasActiveFilters(filters);
  }, [filters]);

  // Filter statistics
  const filterStats = useMemo(() => {
    const uniqueLeagues = new Set<string>();
    const uniqueTeams = new Set<string>();
    
    filteredFixtures.forEach(fixture => {
      if (fixture.league?.name) {
        uniqueLeagues.add(fixture.league.name);
      }
      fixture.participants?.forEach(participant => {
        if (participant.name) {
          uniqueTeams.add(participant.name);
        }
      });
    });

    return {
      total: fixtures.length,
      filtered: filteredFixtures.length,
      leagues: uniqueLeagues.size,
      teams: uniqueTeams.size,
    };
  }, [fixtures.length, filteredFixtures]);

  return {
    filters,
    filteredFixtures,
    hasActiveFilters: hasActiveFiltersState,
    updateFilters,
    updateFilter,
    clearFilters,
    clearFilter,
    filterStats,
  };
}
