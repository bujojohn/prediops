'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatePicker } from './DatePickerProvider';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Country } from '@/schemas/country.schema';

interface UseCountryDatePickerProps {
  country: Country;
  initialDate?: string;
  initialFixtures?: Fixture[];
}

interface UseCountryDatePickerReturn {
  selectedDate: string;
  fixtures: Fixture[];
  isLoading: boolean;
  error: string | null;
  selectDate: (date: string) => Promise<void>;
  refreshFixtures: () => Promise<void>;
  fixturesByLeague: Record<number, Fixture[]>;
  totalFixtures: number;
  hasFixtures: boolean;
}

export function useCountryDatePicker({ 
  country, 
  initialDate,
  initialFixtures = []
}: UseCountryDatePickerProps): UseCountryDatePickerReturn {
  const { state, selectDate: selectDateGlobal, addCachedDate } = useDatePicker();
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with provided date or use global state
  const selectedDate = initialDate || state.selectedDate;

  // Group fixtures by league
  const fixturesByLeague = fixtures.reduce((acc, fixture) => {
    const leagueId = fixture.league?.id;
    if (leagueId) {
      if (!acc[leagueId]) {
        acc[leagueId] = [];
      }
      acc[leagueId].push(fixture);
    }
    return acc;
  }, {} as Record<number, Fixture[]>);

  const totalFixtures = fixtures.length;
  const hasFixtures = totalFixtures > 0;

  // Load fixtures for a specific date and country
  const loadFixturesForDate = useCallback(async (date: string) => {
    if (!country?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Loading fixtures for ${country.name} on ${date}`);

      // Try the new endpoint first, fall back to the old one if it fails
      let countryFixtures: Fixture[] = [];
      
             // Use internal API route to avoid CORS issues
       const response = await fetch(`/api/sportmonks/fixtures/date-country?date=${date}&countryId=${country.id}`);
       
       if (!response.ok) {
         throw new Error(`Failed to fetch fixtures: ${response.statusText}`);
       }
       
       const result = await response.json();
       
       if (result.success) {
         countryFixtures = result.data;
         console.log(`Found ${countryFixtures.length} fixtures for ${country.name} on ${date} using internal API`);
       } else {
         throw new Error(result.error || 'Failed to fetch fixtures');
       }
      
      setFixtures(countryFixtures);
      addCachedDate(date);
      
    } catch (err) {
      console.error(`Error loading fixtures for ${country.name} on ${date}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load fixtures');
      setFixtures([]);
    } finally {
      setIsLoading(false);
    }
  }, [country, addCachedDate]);

  // Select date and load fixtures
  const selectDate = useCallback(async (date: string) => {
    selectDateGlobal(date);
    await loadFixturesForDate(date);
  }, [selectDateGlobal, loadFixturesForDate]);

  // Refresh fixtures for current date
  const refreshFixtures = useCallback(async () => {
    await loadFixturesForDate(selectedDate);
  }, [loadFixturesForDate, selectedDate]);

  // Load fixtures on mount and when country changes
  useEffect(() => {
    // Only load fixtures if we don't have any yet
    if (country?.id && selectedDate && fixtures.length === 0) {
      loadFixturesForDate(selectedDate);
    }
  }, [country?.id, selectedDate, loadFixturesForDate, fixtures.length]);

  return {
    selectedDate,
    fixtures,
    isLoading,
    error,
    selectDate,
    refreshFixtures,
    fixturesByLeague,
    totalFixtures,
    hasFixtures,
  };
}
