'use client';

import { useCallback } from 'react';

export type FilterType = 'today' | 'tomorrow' | 'weekend' | 'top-bets';

interface QuickFilter {
  id: FilterType;
  label: string;
  href: string;
  getDateRange: () => { start: Date; end: Date };
}

export function useQuickFilters() {
  const getTodayRange = useCallback(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }, []);

  const getTomorrowRange = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }, []);

  const getWeekendRange = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    let start: Date;
    if (dayOfWeek === 0) { // Sunday
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else if (dayOfWeek === 6) { // Saturday
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else { // Monday-Friday
      const daysUntilSaturday = 6 - dayOfWeek;
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilSaturday);
    }
    
    const end = new Date(start);
    end.setDate(end.getDate() + 2); // Saturday + Sunday
    
    return { start, end };
  }, []);

  const filters: QuickFilter[] = [
    {
      id: 'today',
      label: 'Today',
      href: '/predictions?filter=today',
      getDateRange: getTodayRange
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      href: '/predictions?filter=tomorrow',
      getDateRange: getTomorrowRange
    },
    {
      id: 'weekend',
      label: 'Weekend',
      href: '/predictions?filter=weekend',
      getDateRange: getWeekendRange
    },
    {
      id: 'top-bets',
      label: 'Top Bets',
      href: '/value-bets?filter=top',
      getDateRange: () => ({ start: new Date(), end: new Date() }) // Not date-based
    }
  ];

  const getFilterByType = useCallback((type: FilterType) => {
    return filters.find(filter => filter.id === type);
  }, [filters]);

  const getFilterByUrl = useCallback((url: string) => {
    return filters.find(filter => filter.href === url);
  }, [filters]);

  const formatDateRange = useCallback((start: Date, end: Date) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, []);

  return {
    filters,
    getFilterByType,
    getFilterByUrl,
    formatDateRange,
    getTodayRange,
    getTomorrowRange,
    getWeekendRange
  };
}
