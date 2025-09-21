'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FixtureGroup } from '../utils/grouping-utils';
import { getInitialCollapsedDates } from '../utils/grouping-utils';

export interface UseCollapsedDatesOptions {
  groups: FixtureGroup[];
  selectedDate: string;
}

export interface UseCollapsedDatesReturn {
  collapsedDates: Set<string>;
  toggleDateCollapse: (dateId: string) => void;
}

/**
 * Hook for managing collapsed state of date groups
 * Uses the selected date to determine initial collapse state
 */
export function useCollapsedDates({ groups, selectedDate }: UseCollapsedDatesOptions): UseCollapsedDatesReturn {
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // Initialize collapsed dates based on selected date
  useEffect(() => {
    if (groups.length > 0) {
      const initialCollapsed = getInitialCollapsedDates(groups, selectedDate);
      setCollapsedDates(initialCollapsed);
    }
  }, [groups, selectedDate]);

  // Toggle collapse state for a specific date group
  const toggleDateCollapse = useCallback((dateId: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateId)) {
        newSet.delete(dateId);
      } else {
        newSet.add(dateId);
      }
      return newSet;
    });
  }, []);

  return {
    collapsedDates,
    toggleDateCollapse,
  };
}
