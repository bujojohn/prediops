'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { SIDEBAR_CONFIG } from '@/app/components/navigation/sidebar/config';
import { League } from '@/schemas/league.schema';

interface LeaguesByCountry {
  [countryId: number]: League[];
}

interface LeaguesResponse {
  success: boolean;
  data: LeaguesByCountry;
  timestamp: string;
  metadata: {
    totalLeagues: number;
    countriesWithLeagues: number;
  };
}

/**
 * Hook for fetching all leagues grouped by country
 * Uses server-side preloading with 24-hour caching
 * Follows SportMonks best practices for efficient data loading
 * TODO: handle cases where data not returned because no internet connection
 */
export function useServerSideLeagues(): UseQueryResult<LeaguesByCountry, Error> {
  return useQuery<LeaguesByCountry, Error>({
    queryKey: ['sidebar', 'leagues-server-side'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/leagues/optimized');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch server-side leagues: ${response.status} ${errorText}`);
      }

      const data: LeaguesResponse = await response.json();
      return data.success ? data.data : {};
    },
    staleTime: SIDEBAR_CONFIG.CACHE.STALE_TIME.COUNTRY_LEAGUES, // 24 hours
    gcTime: SIDEBAR_CONFIG.CACHE.GC_TIME.COUNTRY_LEAGUES, // 48 hours
    retry: SIDEBAR_CONFIG.RETRY.MAX_ATTEMPTS,
  });
}

/**
 * Hook for getting leagues for a specific country
 * Uses the preloaded server-side data
 */
export function useCountryLeagues(countryId: number): League[] {
  const { data: leaguesByCountry = {} } = useServerSideLeagues();
  return leaguesByCountry[countryId] || [];
}
