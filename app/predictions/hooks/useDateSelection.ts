'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseDateSelectionOptions {
  onDateLoad: (date: string) => Promise<void>;
}

export interface UseDateSelectionReturn {
  handleDateSelect: (date: string) => Promise<void>;
}

/**
 * Hook for managing date selection with URL updates
 */
export function useDateSelection({ onDateLoad }: UseDateSelectionOptions): UseDateSelectionReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateSelect = useCallback(async (date: string) => {
    // Update URL to reflect selected date
    const params = new URLSearchParams(searchParams);
    params.set('date', date);
    router.push(`/predictions?${params.toString()}`);
    
    // Load fixtures for the selected date
    await onDateLoad(date);
  }, [onDateLoad, router, searchParams]);

  return {
    handleDateSelect,
  };
}
