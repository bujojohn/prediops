'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

export interface UsePredictionsOptions {
  initialFixtures: Fixture[];
}

export interface UsePredictionsReturn {
  fixtures: Fixture[];
  page: number;
  isLoadingMore: boolean;
  hasMore: boolean;
  isLoadingDateFixtures: boolean;
  loadFixturesForDate: (date: string) => Promise<void>;
  loadNextPage: () => Promise<void>;
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>;
}

/**
 * Hook for managing predictions/fixtures state and data loading
 */
export function usePredictions({ initialFixtures }: UsePredictionsOptions): UsePredictionsReturn {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures || []);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingDateFixtures, setIsLoadingDateFixtures] = useState(false);

  // Load fixtures for selected date
  const loadFixturesForDate = useCallback(async (date: string) => {
    try {
      setIsLoadingDateFixtures(true);
      const response = await fetch(
        `/api/sportmonks/fixtures/date/${date}?include=participants;scores;state;predictions.type;league.country;events&per_page=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load fixtures for selected date');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setFixtures(data.data);
        setPage(1);
        setHasMore(data.data.length >= 100);
      } else {
        setFixtures([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading fixtures for date:', date, err);
      setFixtures([]);
      setHasMore(false);
    } finally {
      setIsLoadingDateFixtures(false);
    }
  }, []);

  // Load next page of fixtures
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/sportmonks/fixtures?page=${nextPage}&per_page=50`, { 
        cache: 'no-store' 
      });
      const json = await res.json();
      const next: Fixture[] = json?.data?.data || [];
      
      if (next.length === 0) {
        setHasMore(false);
      } else {
        // Deduplicate by fixture.id
        const seen = new Set<number>(fixtures.map((f) => f.id));
        const merged = fixtures.concat(next.filter((f) => !seen.has(f.id)));
        setFixtures(merged);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading next page:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, fixtures]);

  // Load initial fixtures for today if no fixtures exist
  useEffect(() => {
    if (fixtures.length === 0 && initialFixtures.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      loadFixturesForDate(today);
    }
  }, [fixtures.length, initialFixtures.length, loadFixturesForDate]);

  return {
    fixtures,
    page,
    isLoadingMore,
    hasMore,
    isLoadingDateFixtures,
    loadFixturesForDate,
    loadNextPage,
    setFixtures,
  };
}
