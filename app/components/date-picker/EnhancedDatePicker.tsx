'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateButton } from './DateButton';
import { useDatePicker } from './DatePickerProvider';

interface EnhancedDatePickerProps {
  className?: string;
  onDateSelect?: (date: string) => void;
  showNavigation?: boolean;
  maxPastDays?: number;
  maxFutureDays?: number;
  showStats?: boolean;
  showQuickActions?: boolean;
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export function EnhancedDatePicker({ 
  onDateSelect, 
  className = '', 
  maxPastDays = 7, 
  maxFutureDays = 14,
  showNavigation = true,
  showStats = true,
  showQuickActions = true,
  compact = false,
  title = "Select Date",
  subtitle = "Choose a date to view fixtures and predictions"
}: EnhancedDatePickerProps) {
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

  // Quick action handlers
  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    handleDateSelect(today);
  }, [handleDateSelect]);

  const goToTomorrow = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleDateSelect(tomorrow.toISOString().split('T')[0]);
  }, [handleDateSelect]);

  const goToYesterday = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    handleDateSelect(yesterday.toISOString().split('T')[0]);
  }, [handleDateSelect]);

  // Auto-preload today and adjacent dates on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    preloadAdjacentDates(today);
  }, [preloadAdjacentDates]);

  const visibleDates = dateRange.slice(visibleRange.start, visibleRange.end);

  // Calculate stats
  const stats = useMemo(() => {
    const cachedCount = dateRange.filter(date => isDateCached(date)).length;
    const preloadedCount = dateRange.filter(date => isDatePreloaded(date)).length;
    const totalCount = dateRange.length;
    
    return { cachedCount, preloadedCount, totalCount };
  }, [dateRange, isDateCached, isDatePreloaded]);

  // Format selected date for display
  const formattedSelectedDate = useMemo(() => {
    if (!state.selectedDate) return '';
    
    const date = new Date(state.selectedDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [state.selectedDate]);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToYesterday}
              className="text-xs px-2"
            >
              Yesterday
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs px-2"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToTomorrow}
              className="text-xs px-2"
            >
              Tomorrow
            </Button>
          </div>
        )}

        {/* Date Picker */}
        <div className="flex items-center gap-2">
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

          <div className="flex gap-1 items-center">
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

        {/* Selected Date Display */}
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formattedSelectedDate}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                {stats.cachedCount} cached
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.preloadedCount} preloaded
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToYesterday}
              className="text-xs"
            >
              Yesterday
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToTomorrow}
              className="text-xs"
            >
              Tomorrow
            </Button>
          </div>
        )}

        {/* Date Picker */}
        <div className="flex items-center gap-2">
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

        {/* Selected Date Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Selected:</strong> {formattedSelectedDate}</p>
          <p className="text-xs">
            Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, dateRange.length)} of {dateRange.length} dates
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
