import { useState, useCallback } from 'react';

/**
 * Custom hook for managing sidebar favorites
 * Persists favorites in localStorage
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const saveFavorites = useCallback((newFavorites: Set<number>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-favorites', JSON.stringify(Array.from(newFavorites)));
    }
  }, []);

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

