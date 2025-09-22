'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, ChevronDown, X, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfDay, endOfDay, isAfter, isBefore, isValid } from 'date-fns';

export type DateSelectionMode = 'single' | 'range';

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface UnifiedDateSelectorProps {
  /** Current selected date (for single mode) */
  selectedDate?: string;
  /** Current selected date range (for range mode) */
  selectedRange?: DateRange;
  /** Current selection mode */
  mode?: DateSelectionMode;
  /** Callback when date selection changes */
  onDateChange?: (date: string) => void;
  /** Callback when date range selection changes */
  onRangeChange?: (range: DateRange) => void;
  /** Callback when mode changes */
  onModeChange?: (mode: DateSelectionMode) => void;
  /** Maximum future days allowed (default: 21) */
  maxFutureDays?: number;
  /** Maximum past days allowed (default: unlimited) */
  maxPastDays?: number;
  /** Whether to show the mode switcher */
  showModeSwitcher?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom className */
  className?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Unified Date Selector Component
 * 
 * Features:
 * - Single date selection (like predictions page)
 * - Date range selection (like league predictions)
 * - Lightbox/modal interface
 * - Future dates limited to 21 days (configurable)
 * - Past dates unlimited (configurable)
 * - Mode switching between single and range
 * - Mobile-friendly design
 */
export function UnifiedDateSelector({
  selectedDate,
  selectedRange,
  mode = 'single',
  onDateChange,
  onRangeChange,
  onModeChange,
  maxFutureDays = 21,
  maxPastDays = 365, // Default to 1 year for past dates
  showModeSwitcher = true,
  placeholder = "Select date",
  className,
  disabled = false,
}: UnifiedDateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMode, setTempMode] = useState<DateSelectionMode>(mode);
  const [tempDate, setTempDate] = useState<string>(selectedDate || '');
  const [tempRange, setTempRange] = useState<DateRange>(
    selectedRange || { from: null, to: null }
  );

  // Calculate date limits
  const today = startOfDay(new Date());
  const maxFutureDate = addDays(today, maxFutureDays);
  const maxPastDate = maxPastDays ? subDays(today, maxPastDays) : null;

  // Generate calendar dates
  const calendarDates = useMemo(() => {
    const dates: Array<{
      date: Date;
      dateString: string;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
      isSelectable: boolean;
      isInRange?: boolean;
      isRangeStart?: boolean;
      isRangeEnd?: boolean;
    }> = [];

    // Start from maxPastDate or 6 months ago, whichever is more recent
    const startDate = maxPastDate || subDays(today, 180);
    const endDate = maxFutureDate;

    let current = startOfDay(startDate);
    while (isBefore(current, endDate) || current.getTime() === endDate.getTime()) {
      const dateString = format(current, 'yyyy-MM-dd');
      const isToday = current.getTime() === today.getTime();
      const isPast = isBefore(current, today);
      const isFuture = isAfter(current, today);
      const isSelectable = 
        (!maxPastDate || !isBefore(current, maxPastDate)) &&
        !isAfter(current, maxFutureDate);

      // Check if date is in range (for range mode)
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;

      if (tempMode === 'range' && tempRange.from && tempRange.to) {
        const fromDate = new Date(tempRange.from);
        const toDate = new Date(tempRange.to);
        isInRange = current >= fromDate && current <= toDate;
        isRangeStart = current.getTime() === fromDate.getTime();
        isRangeEnd = current.getTime() === toDate.getTime();
      }

      dates.push({
        date: current,
        dateString,
        isToday,
        isPast,
        isFuture,
        isSelectable,
        isInRange,
        isRangeStart,
        isRangeEnd,
      });

      current = addDays(current, 1);
    }

    return dates;
  }, [today, maxFutureDate, maxPastDate, tempMode, tempRange]);

  // Handle date selection
  const handleDateClick = useCallback((dateString: string) => {
    if (tempMode === 'single') {
      setTempDate(dateString);
    } else {
      // Range mode logic
      if (!tempRange.from || (tempRange.from && tempRange.to)) {
        // Start new range
        setTempRange({ from: dateString, to: null });
      } else if (tempRange.from && !tempRange.to) {
        // Complete range
        const fromDate = new Date(tempRange.from);
        const toDate = new Date(dateString);
        
        if (isBefore(toDate, fromDate)) {
          // If clicked date is before start date, swap them
          setTempRange({ from: dateString, to: tempRange.from });
        } else {
          setTempRange({ from: tempRange.from, to: dateString });
        }
      }
    }
  }, [tempMode, tempRange]);

  // Handle mode switch
  const handleModeSwitch = useCallback((newMode: DateSelectionMode) => {
    setTempMode(newMode);
    // Reset selections when switching modes
    if (newMode === 'single') {
      setTempDate('');
      setTempRange({ from: null, to: null });
    } else {
      setTempDate('');
      setTempRange({ from: null, to: null });
    }
  }, []);

  // Handle apply
  const handleApply = useCallback(() => {
    if (tempMode === 'single' && tempDate) {
      onDateChange?.(tempDate);
      onModeChange?.(tempMode);
    } else if (tempMode === 'range' && tempRange.from && tempRange.to) {
      onRangeChange?.(tempRange);
      onModeChange?.(tempMode);
    }
    setIsOpen(false);
  }, [tempMode, tempDate, tempRange, onDateChange, onRangeChange, onModeChange]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setTempDate(selectedDate || '');
    setTempRange(selectedRange || { from: null, to: null });
    setTempMode(mode);
    setIsOpen(false);
  }, [selectedDate, selectedRange, mode]);

  // Handle reset
  const handleReset = useCallback(() => {
    setTempDate('');
    setTempRange({ from: null, to: null });
    setTempMode('single');
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  // Get display text
  const getDisplayText = () => {
    if (mode === 'single' && selectedDate) {
      return format(new Date(selectedDate), 'MMM dd, yyyy');
    } else if (mode === 'range' && selectedRange?.from && selectedRange?.to) {
      return `${format(new Date(selectedRange.from), 'MMM dd')} - ${format(new Date(selectedRange.to), 'MMM dd, yyyy')}`;
    }
    return placeholder;
  };

  // Check if there's a valid selection
  const hasValidSelection = () => {
    if (tempMode === 'single') {
      return !!tempDate;
    } else {
      return !!(tempRange.from && tempRange.to);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "h-8 px-3 text-left justify-between min-w-[140px]",
          className
        )}
      >
        <span className="truncate text-sm">
          {getDisplayText()}
        </span>
        <ChevronDown className="h-3 w-3 ml-2 flex-shrink-0" />
      </Button>

      {/* Modal/Lightbox */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Select Date</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode Switcher */}
            {showModeSwitcher && (
              <div className="p-4 border-b">
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                  <button
                    onClick={() => handleModeSwitch('single')}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      tempMode === 'single'
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    Single Date
                  </button>
                  <button
                    onClick={() => handleModeSwitch('range')}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      tempMode === 'range'
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    Date Range
                  </button>
                </div>
              </div>
            )}

            {/* Calendar */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDates.map(({ date, dateString, isToday, isSelectable, isInRange, isRangeStart, isRangeEnd }) => (
                  <button
                    key={dateString}
                    onClick={() => isSelectable && handleDateClick(dateString)}
                    disabled={!isSelectable}
                    className={cn(
                      "h-8 w-8 text-xs rounded-md transition-colors flex items-center justify-center",
                      !isSelectable && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                      isSelectable && "hover:bg-gray-100 dark:hover:bg-gray-700",
                      isToday && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold",
                      tempMode === 'single' && tempDate === dateString && "bg-blue-600 text-white",
                      tempMode === 'range' && isRangeStart && "bg-blue-600 text-white rounded-l-md rounded-r-none",
                      tempMode === 'range' && isRangeEnd && "bg-blue-600 text-white rounded-r-md rounded-l-none",
                      tempMode === 'range' && isInRange && !isRangeStart && !isRangeEnd && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    )}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <div className="text-xs text-gray-500">
                  {tempMode === 'single' ? 'Select a single date' : 'Select start and end dates'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Close
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApply}
                  disabled={!hasValidSelection()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UnifiedDateSelector;
