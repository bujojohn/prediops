import { useState, useCallback } from 'react';
import type { CountryWithLeagues } from '../types';

export type SortOption = 'name' | 'fixtures' | 'favorites';

/**
 * Custom hook for sorting countries in the sidebar
 */
export function useSorting() {
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const sortCountries = useCallback(
    (
      countries: CountryWithLeagues[],
      countryTodayCounts: Map<number, number>,
      favorites: Set<number>
    ): CountryWithLeagues[] => {
      const sorted = [...countries];

      switch (sortBy) {
        case 'fixtures':
          return sorted.sort((a, b) => {
            const countA = countryTodayCounts.get(a.id) || 0;
            const countB = countryTodayCounts.get(b.id) || 0;
            // Sort by fixture count descending, then by name
            if (countB !== countA) {
              return countB - countA;
            }
            return (a.name || a.fifa_name || '').localeCompare(b.name || b.fifa_name || '');
          });

        case 'favorites':
          return sorted.sort((a, b) => {
            const aIsFav = favorites.has(a.id) ? 1 : 0;
            const bIsFav = favorites.has(b.id) ? 1 : 0;
            // Sort favorites first, then by name
            if (bIsFav !== aIsFav) {
              return bIsFav - aIsFav;
            }
            return (a.name || a.fifa_name || '').localeCompare(b.name || b.fifa_name || '');
          });

        case 'name':
        default:
          return sorted.sort((a, b) =>
            (a.name || a.fifa_name || '').localeCompare(b.name || b.fifa_name || '')
          );
      }
    },
    [sortBy]
  );

  return {
    sortBy,
    setSortBy,
    sortCountries,
  };
}

