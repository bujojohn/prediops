'use client';

import type { Fixture } from '@/schemas/fixture.schema';
import { useFixturesByDate, useInfiniteFixtures } from './usePredictionsQuery';

export interface UsePredictionsWithQueryOptions {
  initialFixtures: Fixture[];
  selectedDate: string;
}

export interface UsePredictionsWithQueryReturn {
  fixtures: Fixture[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for managing predictions/fixtures state using React Query
 * This replaces the manual state management with React Query for better caching and error handling
 */
export function usePredictionsWithQuery({ 
  initialFixtures, 
  selectedDate 
}: UsePredictionsWithQueryOptions): UsePredictionsWithQueryReturn {
  
  // Use React Query to fetch fixtures by date
  const {
    data: fixturesByDate = [],
    isLoading: isLoadingByDate,
    isError: isErrorByDate,
    error: errorByDate,
    refetch: refetchByDate,
  } = useFixturesByDate(selectedDate);

  // Use infinite query for pagination (if needed in the future)
  const {
    isError: isErrorInfinite,
    error: errorInfinite,
  } = useInfiniteFixtures(initialFixtures);

  // Determine which data source to use
  const fixtures = fixturesByDate.length > 0 ? fixturesByDate : initialFixtures;
  const isLoading = isLoadingByDate;
  const isError = isErrorByDate || isErrorInfinite;
  const error = errorByDate || errorInfinite;
  const refetch = refetchByDate;

  return {
    fixtures,
    isLoading,
    isError,
    error,
    refetch,
  };
}
