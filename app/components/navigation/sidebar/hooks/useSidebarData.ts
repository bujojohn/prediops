import { useState, useCallback } from 'react';
import type { CountryWithLeagues, League } from '../types';

/**
 * Custom hook for managing sidebar data (countries and leagues)
 */
export function useSidebarData() {
  const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
  const [countryLeagues, setCountryLeagues] = useState<Map<number, League[]>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());

  const loadCountriesWithLeagues = useCallback(async () => {
    try {
      const response = await fetch('/api/sportmonks/countries/with-leagues');
      const data = await response.json();
      
      if (data.success) {
        const countries = data.data || [];
        setAllCountries(countries);
        return countries;
      } else {
        console.error('Failed to load countries:', data.error);
        setAllCountries([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading countries with leagues:', error);
      setAllCountries([]);
      return [];
    }
  }, []);

  const loadCountryLeagues = useCallback(async (countryId: number) => {
    setLoadingStates(prev => {
      if (prev.has(countryId)) {
        return prev; // Already loading
      }
      return new Map(prev).set(countryId, true);
    });
    
    try {
      const response = await fetch(`/api/sportmonks/leagues/country/${countryId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const leagues = data.data.filter((league: League) => league.active);
        setCountryLeagues(prev => new Map(prev).set(countryId, leagues));
        return leagues;
      } else {
        console.error('Failed to load leagues for country:', countryId, data.error);
        setCountryLeagues(prev => new Map(prev).set(countryId, []));
        return [];
      }
    } catch (error) {
      console.error('Error loading leagues for country:', countryId, error);
      setCountryLeagues(prev => new Map(prev).set(countryId, []));
      return [];
    } finally {
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(countryId);
        return newMap;
      });
    }
  }, []);

  const clearCache = useCallback(() => {
    setCountryLeagues(new Map());
  }, []);

  return {
    allCountries,
    countryLeagues,
    loadingStates,
    loadCountriesWithLeagues,
    loadCountryLeagues,
    clearCache,
  };
}

