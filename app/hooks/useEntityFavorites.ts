import { useState, useCallback, useEffect } from 'react';

export type EntityType = 'teams' | 'leagues' | 'countries';

/**
 * Custom hook for managing favorites for different entity types
 * Persists favorites in localStorage with separate keys for each entity type
 */
export function useEntityFavorites(entityType: EntityType) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  const storageKey = `favorites-${entityType}`;

  // Load favorites from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setFavorites(new Set(JSON.parse(stored)));
        } catch (error) {
          console.error(`Error loading ${entityType} favorites:`, error);
        }
      }
      setIsHydrated(true);
    }
  }, [storageKey, entityType]);

  const saveFavorites = useCallback((newFavorites: Set<number>) => {
    if (typeof window !== 'undefined' && isHydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newFavorites)));
      } catch (error) {
        console.error(`Error saving ${entityType} favorites:`, error);
      }
    }
  }, [isHydrated, storageKey, entityType]);

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
    favoritesCount: favorites.size,
  };
}

