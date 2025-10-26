'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  SIDEBAR_CONFIG
} from '@/app/components/navigation/sidebar/config';

// Types
interface Country {
  id: number;
  name: string;
  image_path: string;
  leagues: League[];
}

interface League {
  id: number;
  name: string;
  image_path: string;
  country_id: number;
}

interface CountryLeaguesResponse {
  success: boolean;
  data: League[];
}

// Removed fixture count interfaces as per requirements

/**
 * Hook for fetching countries using local data files
 * Follows SportMonks best practices by using cached static entities
 */
export function useCountriesQuery(): UseQueryResult<Country[], Error> {
  return useQuery<Country[], Error>({
    queryKey: ['sidebar', 'countries-local'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/countries/optimized?populate=true');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch local countries: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    },
    staleTime: SIDEBAR_CONFIG.CACHE.STALE_TIME.COUNTRIES, // 7 days for local data
    gcTime: SIDEBAR_CONFIG.CACHE.GC_TIME.COUNTRIES, // 30 days for local data
    retry: SIDEBAR_CONFIG.RETRY.MAX_ATTEMPTS,
  });
}

/**
 * Hook for fetching leagues for a specific country using optimized endpoint with 24-hour caching
 */
export function useCountryLeaguesQuery(
  countryId: number,
  enabled: boolean = true
): UseQueryResult<League[], Error> {
  return useQuery<League[], Error>({
    queryKey: ['sidebar', 'country-leagues-optimized', countryId],
    queryFn: async () => {
      const response = await fetch(`/api/sportmonks/leagues/country-optimized/${countryId}?populate=true`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch optimized country leagues: ${response.status} ${errorText}`);
      }

      const data: CountryLeaguesResponse = await response.json();
      return data.success ? data.data : [];
    },
    enabled: enabled && !!countryId,
    staleTime: SIDEBAR_CONFIG.CACHE.STALE_TIME.COUNTRY_LEAGUES, // 24 hours as per requirements
    gcTime: SIDEBAR_CONFIG.CACHE.GC_TIME.COUNTRY_LEAGUES, // 48 hours
    retry: SIDEBAR_CONFIG.RETRY.MAX_ATTEMPTS,
  });
}

// Removed all fixture count hooks as per requirements

/**
 * Hook for fetching types using local data files
 * Follows SportMonks best practices by using cached static entities
 */
export function useTypesQuery(): UseQueryResult<{ id: number; name: string; code: string; developer_name: string; model_type: string; stat_group: string | null }[], Error> {
  return useQuery<{ id: number; name: string; code: string; developer_name: string; model_type: string; stat_group: string | null }[], Error>({
    queryKey: ['sidebar', 'types-local'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/types');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch local types: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    },
    staleTime: SIDEBAR_CONFIG.CACHE.STALE_TIME.TYPES, // 30 days for static data
    gcTime: SIDEBAR_CONFIG.CACHE.GC_TIME.TYPES, // 60 days for static data
    retry: SIDEBAR_CONFIG.RETRY.MAX_ATTEMPTS,
  });
}

/**
 * Hook for fetching states using local data files
 * Follows SportMonks best practices by using cached static entities
 */
export function useStatesQuery(): UseQueryResult<{ id: number; state: string; name: string; short_name: string; developer_name: string }[], Error> {
  return useQuery<{ id: number; state: string; name: string; short_name: string; developer_name: string }[], Error>({
    queryKey: ['sidebar', 'states-local'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/states');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch local states: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    },
    staleTime: SIDEBAR_CONFIG.CACHE.STALE_TIME.STATES, // 30 days for static data
    gcTime: SIDEBAR_CONFIG.CACHE.GC_TIME.STATES, // 60 days for static data
    retry: SIDEBAR_CONFIG.RETRY.MAX_ATTEMPTS,
  });
}

/**
 * Query key factories for cache invalidation
 */
export const sidebarQueryKeys = {
  all: ['sidebar'] as const,
  countries: () => ['sidebar', 'countries-local'] as const,
  countryLeagues: (countryId: number) => ['sidebar', 'country-leagues-optimized', countryId] as const,
  types: () => ['sidebar', 'types-local'] as const,
  states: () => ['sidebar', 'states-local'] as const,
};
