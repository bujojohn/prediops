'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ValueBet } from '@/schemas/valuebet.schema';
import { 
  type ValueBetFilters, 
  filterValueBets, 
  calculateValueBetStats,
  hasActiveFilters,
  type ValueBetFilter,
  type ValueBetSortBy,
  type SortOrder
} from '@/lib/utils/value-bet-utils';

interface UseValueBetFiltersOptions {
  enableUrlState?: boolean;
  defaultFilters?: Partial<ValueBetFilters>;
}

export function useValueBetFilters(
  valueBets: ValueBet[],
  options: UseValueBetFiltersOptions = {}
) {
  const { enableUrlState = false, defaultFilters = {} } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize filters from URL or defaults
  const initialFilters: ValueBetFilters = useMemo(() => {
    if (enableUrlState && searchParams) {
      return {
        searchQuery: searchParams.get('search') || defaultFilters.searchQuery || '',
        filterValue: (searchParams.get('filter') as ValueBetFilter) || defaultFilters.filterValue || 'all',
        sortBy: (searchParams.get('sortBy') as ValueBetSortBy) || defaultFilters.sortBy || 'value',
        sortOrder: (searchParams.get('order') as SortOrder) || defaultFilters.sortOrder || 'desc',
      };
    }
    
    return {
      searchQuery: defaultFilters.searchQuery || '',
      filterValue: defaultFilters.filterValue || 'all',
      sortBy: defaultFilters.sortBy || 'value',
      sortOrder: defaultFilters.sortOrder || 'desc',
    };
  }, [enableUrlState, searchParams, defaultFilters]);

  const [filters, setFilters] = useState<ValueBetFilters>(initialFilters);

  // Sync filters with URL when they change
  useEffect(() => {
    if (enableUrlState) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      
      if (filters.searchQuery) {
        params.set('search', filters.searchQuery);
      } else {
        params.delete('search');
      }
      
      if (filters.filterValue !== 'all') {
        params.set('filter', filters.filterValue);
      } else {
        params.delete('filter');
      }
      
      if (filters.sortBy !== 'value') {
        params.set('sortBy', filters.sortBy);
      } else {
        params.delete('sortBy');
      }
      
      if (filters.sortOrder !== 'desc') {
        params.set('order', filters.sortOrder);
      } else {
        params.delete('order');
      }

      const newSearch = params.toString();
      const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, enableUrlState, searchParams, router, pathname]);

  // Update filter function
  const updateFilter = useCallback((key: keyof ValueBetFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      filterValue: 'all',
      sortBy: 'value',
      sortOrder: 'desc',
    });
  }, []);

  // Memoized filtered and sorted value bets
  const filteredValueBets = useMemo(() => {
    return filterValueBets(valueBets, filters);
  }, [valueBets, filters]);

  // Memoized statistics
  const stats = useMemo(() => {
    return calculateValueBetStats(filteredValueBets);
  }, [filteredValueBets]);

  return {
    filters,
    filteredValueBets,
    updateFilter,
    clearFilters,
    stats,
    hasActiveFilters: hasActiveFilters(filters),
  };
}

