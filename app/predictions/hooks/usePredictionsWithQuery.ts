'use client';

import { useCallback } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { useFixtureManagement } from '@/app/hooks/useFixtureManagement';

export interface UsePredictionsWithQueryOptions {
  initialFixtures: Fixture[];
}

export interface UsePredictionsWithQueryReturn {
  fixtures: Fixture[];
  page: number;
  isLoadingDateFixtures: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadFixturesForDate: (date: string) => Promise<void>;
  loadNextPage: () => Promise<void>;
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>;
  clearError: () => void;
}

/**
 * Specialized hook for predictions that extends the generic fixture management
 * Provides predictions-specific functionality while maintaining reusability
 */
export function usePredictionsWithQuery({ 
  initialFixtures 
}: UsePredictionsWithQueryOptions): UsePredictionsWithQueryReturn {
  const {
    fixtures,
    page,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadFixturesForDate,
    loadNextPage,
    setFixtures,
    clearError,
  } = useFixtureManagement({
    initialFixtures,
    apiEndpoint: '/api/sportmonks/fixtures',
    enableInfiniteScroll: true,
    enableDateFiltering: true,
    pageSize: 50, // Maximum allowed by API
  });

  // Predictions-specific date loading with enhanced error handling
  const loadPredictionsForDate = useCallback(async (date: string) => {
    try {
      await loadFixturesForDate(date);
    } catch (err) {
      console.error('Error loading predictions for date:', date, err);
      throw err;
    }
  }, [loadFixturesForDate]);

  return {
    fixtures,
    page,
    isLoadingDateFixtures: isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadFixturesForDate: loadPredictionsForDate,
    loadNextPage,
    setFixtures,
    clearError,
  };
}