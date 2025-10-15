import { useState, useCallback } from 'react';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'sidebar-recent-searches';

/**
 * Custom hook for managing recent search history
 * Persists searches in localStorage
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const addToRecentSearches = useCallback((term: string) => {
    if (!term || term.trim().length < 2) return;

    const trimmedTerm = term.trim();
    const updated = [trimmedTerm, ...recentSearches.filter((t) => t !== trimmedTerm)].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [recentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  };
}

