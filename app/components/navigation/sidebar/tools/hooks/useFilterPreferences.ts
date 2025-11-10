'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type ScopeKey = string; // reuse SearchScope string type upstream

interface FilterState {
  favorites: boolean;
}

type Preferences = Record<ScopeKey, FilterState>;

const DEFAULTS: FilterState = { favorites: false };

export function useFilterPreferences(scope: ScopeKey) {
  const [prefs, setPrefs] = useState<Preferences>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sidebar-filter-preferences');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migrate old format to new format
        const migrated: Preferences = {};
        Object.keys(parsed).forEach((key) => {
          migrated[key] = { favorites: parsed[key]?.favorites ?? false };
        });
        setPrefs(migrated);
      }
    } catch {
      // ignore
    }
  }, []);

  const current = useMemo<FilterState>(() => {
    return prefs[scope] || DEFAULTS;
  }, [prefs, scope]);

  const update = useCallback((next: Partial<FilterState>) => {
    setPrefs((prev) => {
      const merged: Preferences = {
        ...prev,
        [scope]: { ...(prev[scope] || DEFAULTS), ...next },
      };
      try {
        localStorage.setItem('sidebar-filter-preferences', JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  }, [scope]);

  return {
    state: current,
    setFavorites: (v: boolean) => update({ favorites: v }),
  };
}


