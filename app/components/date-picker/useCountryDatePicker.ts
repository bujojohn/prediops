'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatePicker } from './DatePickerProvider';
import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Country } from '@/schemas/country.schema';

interface UseCountryDatePickerProps {
  country: Country;
  initialDate?: string;
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
  initialDate 
}: UseCountryDatePickerProps): UseCountryDatePickerReturn {
  const { state, selectDate: selectDateGlobal, addCachedDate } = useDatePicker();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
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

      const fixturesResponse = await sportmonks.getFixturesByDate(date, {
        include: 'participants;scores;state;predictions.type;league.country',
        per_page: 50,
        page: 1,
      });

      const allFixtures = fixturesResponse?.data || [];
      
      // Filter fixtures for this specific country
      const countryFixtures = allFixtures.filter((fixture: Fixture) => {
        return fixture.league?.country?.id === country.id;
      });

      console.log(`Found ${countryFixtures.length} fixtures for ${country.name} on ${date}`);
      
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
    if (country?.id && selectedDate) {
      loadFixturesForDate(selectedDate);
    }
  }, [country?.id, selectedDate, loadFixturesForDate]);

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
