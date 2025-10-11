'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Fixture } from '@/schemas/fixture.schema';

interface UseTeamFixturesQueryOptions {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

interface TeamFixturesResponse {
  fixtures: Fixture[];
  total: number;
}

/**
 * React Query hook for fetching team fixtures
 * 
 * Features:
 * - Automatic caching (5 minute stale time)
 * - Background refetching
 * - Request deduplication
 * - Loading and error states
 * 
 * @example
 * const { data, isLoading, error, refetch } = useTeamFixturesQuery({
 *   teamId: '123',
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
 * });
 */
export function useTeamFixturesQuery({
  teamId,
  startDate,
  endDate,
  enabled = true
}: UseTeamFixturesQueryOptions): UseQueryResult<Fixture[], Error> {
  const startStr = startDate?.toISOString().split('T')[0];
  const endStr = endDate?.toISOString().split('T')[0];

  return useQuery<Fixture[], Error>({
    queryKey: ['team-fixtures', teamId, startStr, endStr],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams({
        teamId,
      });

      if (startStr) params.append('startDate', startStr);
      if (endStr) params.append('endDate', endStr);

      const response = await fetch(`/api/sportmonks/fixtures?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch team fixtures: ${response.status} ${errorText}`);
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
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Query key factory for team fixtures
 * Useful for manual cache invalidation
 */
export const teamFixturesQueryKeys = {
  all: ['team-fixtures'] as const,
  team: (teamId: string) => ['team-fixtures', teamId] as const,
  teamWithDates: (teamId: string, startDate?: string, endDate?: string) => 
    ['team-fixtures', teamId, startDate, endDate] as const,
};

