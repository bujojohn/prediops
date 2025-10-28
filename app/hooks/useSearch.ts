'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchScope } from '@/app/components/navigation/sidebar/SearchScopeDropdown';
import type { Country } from '@/schemas/country.schema';
import type { League } from '@/schemas/league.schema';
import type { Team } from '@/schemas/team.schema';
import type { Fixture } from '@/schemas/fixture.schema';

interface SearchResult {
  countries: Country[];
  leagues: League[];
  teams: Team[];
  fixtures: Fixture[];
  totalResults: number;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult;
  query: string;
  scope: string;
  timestamp: string;
}

/**
 * Hook for server-side search functionality
 * Uses SportMonks API search endpoints for real-time, accurate results
 */
export function useSearch(query: string, scope: SearchScope = 'all') {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    console.log('useSearch: Query changed to:', query);
    const timer = setTimeout(() => {
      console.log('useSearch: Setting debounced query to:', query);
      setDebouncedQuery(query);
    }, 100); // Reduced from 300ms to 100ms for better responsiveness

    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const searchQuery = useQuery<SearchResult, Error>({
    queryKey: ['search', debouncedQuery, scope],
    queryFn: async () => {
      console.log('useSearch: queryFn called with debouncedQuery:', debouncedQuery, 'scope:', scope);
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        console.log('useSearch: Query too short, returning empty results');
        return {
          countries: [],
          leagues: [],
          teams: [],
          fixtures: [],
          totalResults: 0,
        };
      }

      setIsSearching(true);
      console.log('useSearch: Starting search request');
      
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&scope=${scope}&limit=10`
        );
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data: SearchResponse = await response.json();
        console.log('useSearch: Search response received:', data);
        
        if (!data.success) {
          throw new Error('Search request failed');
        }

        return data.data;
      } finally {
        setIsSearching(false);
      }
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const clearSearch = useCallback(() => {
    setDebouncedQuery('');
  }, []);

  return {
    results: searchQuery.data || {
      countries: [],
      leagues: [],
      teams: [],
      fixtures: [],
      totalResults: 0,
    },
    isLoading: searchQuery.isLoading || isSearching,
    error: searchQuery.error,
    hasResults: (searchQuery.data?.totalResults || 0) > 0,
    clearSearch,
    isSearching,
  };
}
