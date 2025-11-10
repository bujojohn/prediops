'use client';

import { useCallback } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { useFixtureManagement } from './useFixtureManagement';

export interface UseTeamFixturesOptions {
  teamId: string;
  initialFixtures?: Fixture[];
}

export interface UseTeamFixturesReturn {
  fixtures: Fixture[];
  upcomingFixtures: Fixture[];
  recentFixtures: Fixture[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadTeamFixtures: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  clearError: () => void;
}

/**
 * Specialized hook for team fixtures that extends the generic fixture management
 * Provides team-specific functionality like upcoming/recent fixture separation
 */
export function useTeamFixtures({ 
  teamId, 
  initialFixtures = [] 
}: UseTeamFixturesOptions): UseTeamFixturesReturn {
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
    apiEndpoint: '/api/sportmonks/fixtures', // Use main fixtures endpoint with team parameters
    enableInfiniteScroll: true,
    enableDateFiltering: false, // Teams typically show all fixtures
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

  // Team-specific fixture loading
  const loadTeamFixtures = useCallback(async () => {
    try {
      // Set date range for team fixtures (last 30 days to next 30 days)
      const today = new Date();
      const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      await loadFixtures({
        teamId: teamId,
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: endDate.toISOString().split('T')[0], // YYYY-MM-DD format
        include: 'participants;scores;state;predictions.type;league.country;events',
      });
    } catch (err) {
      console.error('Error loading team fixtures:', teamId, err);
      throw err;
    }
  }, [loadFixtures, teamId]);

  return {
    fixtures,
    upcomingFixtures,
    recentFixtures,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadTeamFixtures,
    loadNextPage,
    clearError,
  };
}
