'use client';

import { useState, useCallback, useMemo } from 'react';
import { addDays, subDays, startOfDay, format, isValid } from 'date-fns';
import type { DateSelectionMode, DateRange } from './UnifiedDateSelector';

export interface UseUnifiedDateSelectorProps {
  /** Initial mode */
  initialMode?: DateSelectionMode;
  /** Initial date for single mode */
  initialDate?: string;
  /** Initial date range for range mode */
  initialRange?: DateRange;
  /** Maximum future days allowed */
  maxFutureDays?: number;
  /** Maximum past days allowed */
  maxPastDays?: number;
  /** Callback when selection changes */
  onSelectionChange?: (data: { mode: DateSelectionMode; date?: string; range?: DateRange }) => void;
}

export interface UseUnifiedDateSelectorReturn {
  /** Current selection mode */
  mode: DateSelectionMode;
  /** Current selected date (single mode) */
  selectedDate: string | undefined;
  /** Current selected range (range mode) */
  selectedRange: DateRange;
  /** Change the selection mode */
  setMode: (mode: DateSelectionMode) => void;
  /** Change the selected date */
  setSelectedDate: (date: string) => void;
  /** Change the selected range */
  setSelectedRange: (range: DateRange) => void;
  /** Get formatted display text */
  getDisplayText: () => string;
  /** Get date range as query parameters */
  getQueryParams: () => Record<string, string>;
  /** Check if there's a valid selection */
  hasValidSelection: () => boolean;
  /** Reset to default values */
  reset: () => void;
  /** Get available date limits */
  getDateLimits: () => {
    minDate: string;
    maxDate: string;
    today: string;
  };
}

/**
 * Hook for managing unified date selector state
 * 
 * Features:
 * - Manages both single date and date range selections
 * - Provides utility functions for formatting and validation
 * - Handles date limits and constraints
 * - Generates query parameters for URL updates
 */
export function useUnifiedDateSelector({
  initialMode = 'single',
  initialDate,
  initialRange,
  maxFutureDays = 21,
  maxPastDays = 365,
  onSelectionChange,
}: UseUnifiedDateSelectorProps = {}): UseUnifiedDateSelectorReturn {
  
  const [mode, setModeState] = useState<DateSelectionMode>(initialMode);
  const [selectedDate, setSelectedDateState] = useState<string | undefined>(initialDate);
  const [selectedRange, setSelectedRangeState] = useState<DateRange>(
    initialRange || { from: null, to: null }
  );

  // Calculate date limits
  const dateLimits = useMemo(() => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, maxFutureDays);
    const minDate = maxPastDays ? subDays(today, maxPastDays) : subDays(today, 365); // Default to 1 year if unlimited

    return {
      minDate: format(minDate, 'yyyy-MM-dd'),
      maxDate: format(maxDate, 'yyyy-MM-dd'),
      today: format(today, 'yyyy-MM-dd'),
    };
  }, [maxFutureDays, maxPastDays]);

  // Set mode with callback
  const setMode = useCallback((newMode: DateSelectionMode) => {
    setModeState(newMode);
    onSelectionChange?.({
      mode: newMode,
      date: newMode === 'single' ? selectedDate : undefined,
      range: newMode === 'range' ? selectedRange : undefined,
    });
  }, [selectedDate, selectedRange, onSelectionChange]);

  // Set selected date with callback
  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date);
    onSelectionChange?.({
      mode,
      date,
      range: mode === 'range' ? selectedRange : undefined,
    });
  }, [mode, selectedRange, onSelectionChange]);

  // Set selected range with callback
  const setSelectedRange = useCallback((range: DateRange) => {
    setSelectedRangeState(range);
    onSelectionChange?.({
      mode,
      date: mode === 'single' ? selectedDate : undefined,
      range,
    });
  }, [mode, selectedDate, onSelectionChange]);

  // Get formatted display text
  const getDisplayText = useCallback(() => {
    if (mode === 'single' && selectedDate) {
      try {
        return format(new Date(selectedDate), 'MMM dd, yyyy');
      } catch {
        return selectedDate;
      }
    } else if (mode === 'range' && selectedRange.from && selectedRange.to) {
      try {
        return `${format(new Date(selectedRange.from), 'MMM dd')} - ${format(new Date(selectedRange.to), 'MMM dd, yyyy')}`;
      } catch {
        return `${selectedRange.from} - ${selectedRange.to}`;
      }
    }
    return 'Select date';
  }, [mode, selectedDate, selectedRange]);

  // Get query parameters for URL updates
  const getQueryParams = useCallback(() => {
    const params: Record<string, string> = {};
    
    if (mode === 'single' && selectedDate) {
      params.date = selectedDate;
    } else if (mode === 'range' && selectedRange.from && selectedRange.to) {
      params.startDate = selectedRange.from;
      params.endDate = selectedRange.to;
    }
    
    params.mode = mode;
    return params;
  }, [mode, selectedDate, selectedRange]);

  // Check if there's a valid selection
  const hasValidSelection = useCallback(() => {
    if (mode === 'single') {
      return !!selectedDate && isValid(new Date(selectedDate));
    } else {
      return !!(selectedRange.from && selectedRange.to && 
                isValid(new Date(selectedRange.from)) && 
                isValid(new Date(selectedRange.to)));
    }
  }, [mode, selectedDate, selectedRange]);

  // Reset to default values
  const reset = useCallback(() => {
    setModeState(initialMode);
    setSelectedDateState(initialDate);
    setSelectedRangeState(initialRange || { from: null, to: null });
    onSelectionChange?.({
      mode: initialMode,
      date: initialDate,
      range: initialRange,
    });
  }, [initialMode, initialDate, initialRange, onSelectionChange]);

  // Get date limits
  const getDateLimits = useCallback(() => dateLimits, [dateLimits]);

  return {
    mode,
    selectedDate,
    selectedRange,
    setMode,
    setSelectedDate,
    setSelectedRange,
    getDisplayText,
    getQueryParams,
    hasValidSelection,
    reset,
    getDateLimits,
  };
}

export default useUnifiedDateSelector;
