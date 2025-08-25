'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateButton } from './DateButton';
import { useDatePicker } from './DatePickerProvider';

interface HorizontalDatePickerProps {
  className?: string;
  onDateSelect?: (date: string) => void;
  showNavigation?: boolean;
  maxPastDays?: number;
  maxFutureDays?: number;
}

export function HorizontalDatePicker({ 
  onDateSelect, 
  className = '', 
  maxPastDays = 10, 
  maxFutureDays = 14,
  showNavigation = true 
}: HorizontalDatePickerProps) {
  const { state, selectDate, isDateCached, isDatePreloaded, addPreloadedDate } = useDatePicker();
  
  // Center the visible range on today's date initially
  const todayIndex = maxPastDays;
  const [visibleRange, setVisibleRange] = useState({ 
    start: Math.max(0, todayIndex - 3), 
    end: Math.min(maxPastDays + maxFutureDays + 1, todayIndex + 4) 
  });

  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    
    // Add past dates
    for (let i = maxPastDays; i > 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Add today
    dates.push(today.toISOString().split('T')[0]);
    
    // Add future dates
    for (let i = 1; i <= maxFutureDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }, [maxPastDays, maxFutureDays]);

  const preloadAdjacentDates = useCallback(async (selectedDate: string) => {
    const selectedIndex = dateRange.indexOf(selectedDate);
    if (selectedIndex === -1) return;

    const adjacentDates = [
      dateRange[selectedIndex - 1],
      dateRange[selectedIndex + 1]
    ].filter(Boolean);

    for (const date of adjacentDates) {
      if (date && !isDatePreloaded(date)) {
        addPreloadedDate(date);
      }
    }
  }, [dateRange, isDatePreloaded, addPreloadedDate]);

  const handleDateSelect = useCallback(async (date: string) => {
    selectDate(date);
    await preloadAdjacentDates(date);
    onDateSelect?.(date);
  }, [selectDate, preloadAdjacentDates, onDateSelect]);

  const scrollLeft = useCallback(() => {
    setVisibleRange(prev => ({
      start: Math.max(0, prev.start - 3),
      end: Math.max(7, prev.end - 3)
    }));
  }, []);

  const scrollRight = useCallback(() => {
    setVisibleRange(prev => ({
      start: Math.min(dateRange.length - 7, prev.start + 3),
      end: Math.min(dateRange.length, prev.end + 3)
    }));
  }, [dateRange.length]);

  // Auto-preload today and adjacent dates on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    preloadAdjacentDates(today);
  }, [preloadAdjacentDates]);

  const visibleDates = dateRange.slice(visibleRange.start, visibleRange.end);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Left Navigation */}
        {showNavigation && visibleRange.start > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Date Buttons Container */}
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-2 items-center">
            {visibleDates.map((date) => (
              <DateButton
                key={date}
                date={date}
                isSelected={date === state.selectedDate}
                isCached={isDateCached(date)}
                isPreloaded={isDatePreloaded(date)}
                onClick={handleDateSelect}
              />
            ))}
          </div>
        </div>

        {/* Right Navigation */}
        {showNavigation && visibleRange.end < dateRange.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, dateRange.length)} of {dateRange.length} dates
      </div>
    </div>
  );
}

