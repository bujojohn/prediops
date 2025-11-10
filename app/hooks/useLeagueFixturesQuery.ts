'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Fixture } from '@/schemas/fixture.schema';

interface UseLeagueFixturesQueryOptions {
  leagueId: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

/**
 * React Query hook for fetching league fixtures
 * 
 * Features:
 * - Automatic caching (5 minute stale time)
 * - Background refetching
 * - Request deduplication
 * - Loading and error states
 * 
 * @example
 * const { data, isLoading, error, refetch } = useLeagueFixturesQuery({
 *   leagueId: '8',
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 * });
 */
export function useLeagueFixturesQuery({
  leagueId,
  startDate,
  endDate,
  enabled = true
}: UseLeagueFixturesQueryOptions): UseQueryResult<Fixture[], Error> {
  const startStr = startDate?.toISOString().split('T')[0];
  const endStr = endDate?.toISOString().split('T')[0];

  return useQuery<Fixture[], Error>({
    queryKey: ['league-fixtures', leagueId, startStr, endStr],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();

      if (startStr && endStr) {
        params.append('startDate', startStr);
        params.append('endDate', endStr);
      }
      
      params.append('leagueId', leagueId);

      const response = await fetch(`/api/sportmonks/leagues/${leagueId}/fixtures?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch league fixtures: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      }
      
      if (data.fixtures && Array.isArray(data.fixtures)) {
        return data.fixtures;
      }

      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    },
    enabled: enabled && !!leagueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Query key factory for league fixtures
 * Useful for manual cache invalidation
 */
export const leagueFixturesQueryKeys = {
  all: ['league-fixtures'] as const,
  league: (leagueId: string) => ['league-fixtures', leagueId] as const,
  leagueWithDates: (leagueId: string, startDate?: string, endDate?: string) => 
    ['league-fixtures', leagueId, startDate, endDate] as const,
};

