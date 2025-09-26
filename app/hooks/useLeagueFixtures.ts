'use client';

import { useCallback } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { useFixtureManagement } from './useFixtureManagement';

export interface UseLeagueFixturesOptions {
  leagueId: string;
  initialFixtures?: Fixture[];
  seasonId?: string;
}

export interface UseLeagueFixturesReturn {
  fixtures: Fixture[];
  upcomingFixtures: Fixture[];
  recentFixtures: Fixture[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadLeagueFixtures: (params?: Record<string, string | number | boolean>) => Promise<void>;
  loadNextPage: () => Promise<void>;
  clearError: () => void;
}

/**
 * Specialized hook for league fixtures that extends the generic fixture management
 * Provides league-specific functionality like season filtering and fixture categorization
 */
export function useLeagueFixtures({ 
  leagueId, 
  initialFixtures = [],
  seasonId 
}: UseLeagueFixturesOptions): UseLeagueFixturesReturn {
  const {
    fixtures,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadFixtures,
    loadNextPage,
    clearError,
  } = useFixtureManagement({
    initialFixtures,
    apiEndpoint: `/api/sportmonks/leagues/${leagueId}/fixtures`,
    enableInfiniteScroll: true,
    enableDateFiltering: true,
    pageSize: 50,
  });

  // Separate upcoming and recent fixtures
  const upcomingFixtures = fixtures.filter(fixture => {
    if (!fixture.starting_at) return false;
    return new Date(fixture.starting_at) > new Date();
  }).slice(0, 10); // Next 10 fixtures

  const recentFixtures = fixtures.filter(fixture => {
    if (!fixture.starting_at) return false;
    return new Date(fixture.starting_at) <= new Date();
  }).slice(-10); // Last 10 fixtures

  // League-specific fixture loading
  const loadLeagueFixtures = useCallback(async (params: Record<string, string | number | boolean> = {}) => {
    try {
      const leagueParams = {
        league_id: leagueId,
        ...(seasonId && { season_id: seasonId }),
        ...params,
      };
      
      await loadFixtures(leagueParams);
    } catch (err) {
      console.error('Error loading league fixtures:', leagueId, err);
      throw err;
    }
  }, [loadFixtures, leagueId, seasonId]);

  return {
    fixtures,
    upcomingFixtures,
    recentFixtures,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadLeagueFixtures,
    loadNextPage,
    clearError,
  };
}
