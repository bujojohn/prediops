import { useState, useCallback, useEffect } from 'react';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'sidebar-recent-searches';

/**
 * Custom hook for managing recent search history
 * Persists searches in localStorage
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load recent searches from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
      setIsHydrated(true);
    }
  }, []);

  const addToRecentSearches = useCallback((term: string) => {
    console.log('Adding to recent searches:', term);
    if (!term || term.trim().length < 2 || !isHydrated) {
      console.log('Skipping add to recent searches - term too short or not hydrated');
      return;
    }

    const trimmedTerm = term.trim();
    setRecentSearches(prev => {
      const updated = [trimmedTerm, ...prev.filter((t) => t !== trimmedTerm)].slice(0, MAX_RECENT_SEARCHES);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log('Updated recent searches in localStorage:', updated);
      }
      
      return updated;
    });
  }, [isHydrated]);

  const clearRecentSearches = useCallback(() => {
    console.log('Clearing recent searches');
    setRecentSearches([]);
    if (typeof window !== 'undefined' && isHydrated) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Recent searches cleared from localStorage');
    }
  }, [isHydrated]);

  return {
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  };
}

