'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

export interface UseFixtureManagementOptions {
  initialFixtures?: Fixture[];
  apiEndpoint?: string;
  enableInfiniteScroll?: boolean;
  enableDateFiltering?: boolean;
  pageSize?: number;
}

export interface UseFixtureManagementReturn {
  fixtures: Fixture[];
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadFixtures: (params?: Record<string, any>) => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadFixturesForDate: (date: string) => Promise<void>;
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>;
  clearError: () => void;
}

/**
 * Generic hook for managing fixtures across different contexts
 * Can be used for predictions, league pages, team pages, live matches, etc.
 */
export function useFixtureManagement({
  initialFixtures = [],
  apiEndpoint = '/api/sportmonks/fixtures',
  enableInfiniteScroll = true,
  enableDateFiltering = true,
  pageSize = 50,
}: UseFixtureManagementOptions = {}): UseFixtureManagementReturn {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic fixture loading function
  const loadFixtures = useCallback(async (params: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        per_page: pageSize.toString(),
        include: 'participants;scores;state;predictions.type;league.country;events',
        ...params,
      });

      const response = await fetch(`${apiEndpoint}?${searchParams}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load fixtures: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setFixtures(data.data);
        setPage(1);
        setHasMore(data.data.length >= pageSize);
      } else {
        setFixtures([]);
        setHasMore(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load fixtures';
      setError(errorMessage);
      setFixtures([]);
      setHasMore(false);
      console.error('Error loading fixtures:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, pageSize]);

  // Load fixtures for specific date
  const loadFixturesForDate = useCallback(async (date: string) => {
    if (!enableDateFiltering) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/sportmonks/fixtures/date/${date}?include=participants;scores;state;predictions.type;league.country;events&per_page=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load fixtures for date: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setFixtures(data.data);
        setPage(1);
        setHasMore(data.data.length >= pageSize);
      } else {
        setFixtures([]);
        setHasMore(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load fixtures for date';
      setError(errorMessage);
      setFixtures([]);
      setHasMore(false);
      console.error('Error loading fixtures for date:', date, err);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, enableDateFiltering]);

  // Load next page (infinite scroll)
  const loadNextPage = useCallback(async () => {
    if (!enableInfiniteScroll || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const searchParams = new URLSearchParams({
        page: nextPage.toString(),
        per_page: pageSize.toString(),
        include: 'participants;scores;state;predictions.type;league.country;events',
      });

      const response = await fetch(`${apiEndpoint}?${searchParams}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load next page: ${response.statusText}`);
      }

      const data = await response.json();
      const next: Fixture[] = data?.data?.data || [];
      
      if (next.length === 0) {
        setHasMore(false);
      } else {
        // Deduplicate by fixture.id
        const seen = new Set<number>(fixtures.map((f) => f.id));
        const merged = fixtures.concat(next.filter((f) => !seen.has(f.id)));
        setFixtures(merged);
        setPage(nextPage);
        setHasMore(next.length >= pageSize);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load next page';
      setError(errorMessage);
      setHasMore(false);
      console.error('Error loading next page:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [enableInfiniteScroll, isLoadingMore, hasMore, page, pageSize, fixtures, apiEndpoint]);

  // Load initial fixtures if none provided
  useEffect(() => {
    if (fixtures.length === 0 && initialFixtures.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      if (enableDateFiltering) {
        loadFixturesForDate(today);
      } else {
        loadFixtures();
      }
    }
  }, [fixtures.length, initialFixtures.length, loadFixturesForDate, loadFixtures, enableDateFiltering]);

  return {
    fixtures,
    page,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadFixtures,
    loadNextPage,
    loadFixturesForDate,
    setFixtures,
    clearError,
  };
}
