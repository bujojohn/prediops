'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export interface DatePickerState {
  selectedDate: string; // YYYY-MM-DD format
  cachedDates: Set<string>;
  isLoading: boolean;
  error: string | null;
  preloadedDates: Set<string>; // Dates that are preloaded
}

type DatePickerAction =
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CACHED_DATE'; payload: string }
  | { type: 'ADD_PRELOADED_DATE'; payload: string }
  | { type: 'CLEAR_CACHE' };

const initialState: DatePickerState = {
  selectedDate: new Date().toISOString().split('T')[0], // Today
  cachedDates: new Set(),
  isLoading: false,
  error: null,
  preloadedDates: new Set(),
};

function datePickerReducer(state: DatePickerState, action: DatePickerAction): DatePickerState {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_CACHED_DATE':
      const newCachedDates = new Set(state.cachedDates);
      newCachedDates.add(action.payload);
      return { ...state, cachedDates: newCachedDates };
    
    case 'ADD_PRELOADED_DATE':
      const newPreloadedDates = new Set(state.preloadedDates);
      newPreloadedDates.add(action.payload);
      return { ...state, preloadedDates: newPreloadedDates };
    
    case 'CLEAR_CACHE':
      return { ...state, cachedDates: new Set(), preloadedDates: new Set() };
    
    default:
      return state;
  }
}

interface DatePickerContextType {
  state: DatePickerState;
  selectDate: (date: string) => void;
  isDateCached: (date: string) => boolean;
  isDatePreloaded: (date: string) => boolean;
  addCachedDate: (date: string) => void;
  addPreloadedDate: (date: string) => void;
  clearCache: () => void;
}

const DatePickerContext = createContext<DatePickerContextType | undefined>(undefined);

export function DatePickerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(datePickerReducer, initialState);

  const selectDate = useCallback((date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  }, []);

  const isDateCached = useCallback((date: string) => {
    return state.cachedDates.has(date);
  }, [state.cachedDates]);

  const isDatePreloaded = useCallback((date: string) => {
    return state.preloadedDates.has(date);
  }, [state.preloadedDates]);

  const addCachedDate = useCallback((date: string) => {
    dispatch({ type: 'ADD_CACHED_DATE', payload: date });
  }, []);

  const addPreloadedDate = useCallback((date: string) => {
    dispatch({ type: 'ADD_PRELOADED_DATE', payload: date });
  }, []);

  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
  }, []);

  // Initialize with today's date as cached and preloaded
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    addCachedDate(today);
    addPreloadedDate(today);
  }, [addCachedDate, addPreloadedDate]);

  const value: DatePickerContextType = {
    state,
    selectDate,
    isDateCached,
    isDatePreloaded,
    addCachedDate,
    addPreloadedDate,
    clearCache,
  };

  return (
    <DatePickerContext.Provider value={value}>
      {children}
    </DatePickerContext.Provider>
  );
}

export function useDatePicker() {
  const context = useContext(DatePickerContext);
  if (context === undefined) {
    throw new Error('useDatePicker must be used within a DatePickerProvider');
  }
  return context;
}
