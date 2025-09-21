import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { Fixture } from '@/schemas/fixture.schema';

/**
 * Query function to fetch fixtures by date
 */
async function fetchFixturesByDate(date: string): Promise<Fixture[]> {
  const response = await fetch(
    `/api/sportmonks/fixtures/date/${date}?include=participants;scores;state;predictions.type;league.country;events&per_page=100`
  );
  
  if (!response.ok) {
    throw new Error('Failed to load fixtures for selected date');
  }

  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  
  return [];
}

/**
 * Query function to fetch fixtures with pagination
 */
async function fetchFixturesPage(page: number): Promise<Fixture[]> {
  const response = await fetch(
    `/api/sportmonks/fixtures?page=${page}&per_page=50`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to load fixtures page');
  }

  const data = await response.json();
  return data?.data?.data || [];
}

/**
 * Hook to fetch fixtures for a specific date
 */
export function useFixturesByDate(date: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['fixtures', 'date', date],
    queryFn: () => fetchFixturesByDate(date),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch fixtures with infinite pagination
 */
export function useInfiniteFixtures(initialData?: Fixture[]) {
  return useInfiniteQuery({
    queryKey: ['fixtures', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchFixturesPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer fixtures than requested, we've reached the end
      return lastPage.length < 50 ? undefined : allPages.length + 1;
    },
    initialData: initialData ? {
      pages: [initialData],
      pageParams: [1],
    } : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
