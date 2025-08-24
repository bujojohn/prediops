'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDatePicker } from './DatePickerProvider';

interface Fixture {
  id: number;
  starting_at: string;
  // Add other fixture properties as needed
}

interface UseDatePickerReturn {
  selectedDate: string;
  selectDate: (date: string) => void;
  fixtures: Fixture[];
  isLoading: boolean;
  error: string | null;
  isDateCached: (date: string) => boolean;
  isDatePreloaded: (date: string) => boolean;
  refreshFixtures: () => void;
}

export function useDatePickerWithFixtures(): UseDatePickerReturn {
  const { 
    state, 
    selectDate, 
    isDateCached, 
    isDatePreloaded, 
    addCachedDate 
  } = useDatePicker();
  
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load fixtures for a specific date
  const loadFixturesForDate = useCallback(async (date: string) => {
    if (isDateCached(date)) {
      // Return cached fixtures if available
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format date for API (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      // Fetch fixtures for the selected date
      const response = await fetch(`/api/sportmonks/fixtures/date/${formattedDate}?limit=50`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fixtures: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setFixtures(data.data);
        addCachedDate(date); // Mark as cached
      } else {
        throw new Error(data.error || 'No fixtures found for this date');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fixtures');
      console.error('Error loading fixtures for date:', date, err);
    } finally {
      setIsLoading(false);
    }
  }, [isDateCached, addCachedDate]);

  // Handle date selection
  const handleDateSelect = useCallback(async (date: string) => {
    selectDate(date);
    await loadFixturesForDate(date);
  }, [selectDate, loadFixturesForDate]);

  // Refresh fixtures for current date
  const refreshFixtures = useCallback(() => {
    if (state.selectedDate) {
      loadFixturesForDate(state.selectedDate);
    }
  }, [state.selectedDate, loadFixturesForDate]);

  // Load fixtures when selected date changes
  useEffect(() => {
    if (state.selectedDate) {
      loadFixturesForDate(state.selectedDate);
    }
  }, [state.selectedDate, loadFixturesForDate]);

  return {
    selectedDate: state.selectedDate,
    selectDate: handleDateSelect,
    fixtures,
    isLoading,
    error,
    isDateCached,
    isDatePreloaded,
    refreshFixtures,
  };
}
