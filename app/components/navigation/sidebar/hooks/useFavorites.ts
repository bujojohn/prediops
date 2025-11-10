import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing sidebar favorites
 * Persists favorites in localStorage
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load favorites from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-favorites');
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
      setIsHydrated(true);
    }
  }, []);

  const saveFavorites = useCallback((newFavorites: Set<number>) => {
    if (typeof window !== 'undefined' && isHydrated) {
      localStorage.setItem('sidebar-favorites', JSON.stringify(Array.from(newFavorites)));
    }
  }, [isHydrated]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      saveFavorites(newSet);
      return newSet;
    });
  }, [saveFavorites]);

  const isFavorite = useCallback((id: number) => favorites.has(id), [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}

