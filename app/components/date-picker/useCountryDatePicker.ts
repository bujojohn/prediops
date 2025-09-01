'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatePicker } from './DatePickerProvider';
import { sportmonks } from '@/lib/sportmonks';
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
      
      try {
        // Use the more efficient getLeaguesByFixtureDate endpoint
        const leaguesResponse = await sportmonks.getLeaguesByFixtureDate(date, {
          include: 'country;fixtures',
          per_page: 50,
          page: 1,
        });

        const allLeagues = leaguesResponse?.data || [];
        
        // Find leagues for this specific country and extract their fixtures
        allLeagues.forEach((league: any) => {
          if (league.country?.id === country.id && league.fixtures) {
            countryFixtures.push(...league.fixtures);
          }
        });

        console.log(`Found ${countryFixtures.length} fixtures for ${country.name} on ${date} using new endpoint`);
      } catch (newEndpointError) {
        console.log(`New endpoint failed, falling back to getFixturesByDate:`, newEndpointError);
        
        // Fall back to the original method
        const fixturesResponse = await sportmonks.getFixturesByDate(date, {
          include: 'participants;scores;state;predictions.type;league.country',
          per_page: 50,
          page: 1,
        });

        const allFixtures = fixturesResponse?.data || [];
        
        // Filter fixtures for this specific country
        countryFixtures = allFixtures.filter((fixture: Fixture) => {
          return fixture.league?.country?.id === country.id;
        });

        console.log(`Found ${countryFixtures.length} fixtures for ${country.name} on ${date} using fallback method`);
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
    // Only load fixtures if we don't have any yet or if the date changes
    if (country?.id && selectedDate && fixtures.length === 0 && initialFixtures.length === 0) {
      loadFixturesForDate(selectedDate);
    }
  }, [country?.id, selectedDate, loadFixturesForDate, fixtures.length, initialFixtures.length]);

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
