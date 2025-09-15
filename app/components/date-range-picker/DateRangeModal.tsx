'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, subDays, startOfDay, isSameDay, isBefore, isAfter } from 'date-fns';

interface DateRangeModalProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
  maxDays?: number;
  isOpen: boolean;
}

export function DateRangeModal({
  startDate,
  endDate,
  onDateRangeChange,
  onClose,
  maxDays = 21,
  isOpen
}: DateRangeModalProps) {
  const [selectedStart, setSelectedStart] = useState<Date>(startOfDay(startDate));
  const [selectedEnd, setSelectedEnd] = useState<Date>(startOfDay(endDate));

  // Update internal state when props change
  useEffect(() => {
    setSelectedStart(startOfDay(startDate));
    setSelectedEnd(startOfDay(endDate));
  }, [startDate, endDate]);


  const today = startOfDay(new Date());
  // Allow unlimited past dates, but limit future to maxDays from today
  const minDate = null; // No limit on past dates
  const maxDate = addDays(today, maxDays);

  const handleDateClick = (date: Date) => {
    const normalizedDate = startOfDay(date);
    
    // If no start date selected, or both dates are selected, start fresh
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(normalizedDate);
      setSelectedEnd(null); // Clear end date to allow range selection
      return;
    }

    // If start date is selected but no end date
    if (selectedStart && !selectedEnd) {
      if (isBefore(normalizedDate, selectedStart)) {
        // Clicked date is before start date, make it the new start
        setSelectedStart(normalizedDate);
        setSelectedEnd(selectedStart);
      } else {
        // Clicked date is after start date, make it the end
        setSelectedEnd(normalizedDate);
      }
      return;
    }

    // If we reach here, both dates are selected, so reset
    setSelectedStart(normalizedDate);
    setSelectedEnd(null);
  };

  const handleConfirmRange = () => {
    if (selectedStart && selectedEnd) {
      onDateRangeChange(selectedStart, selectedEnd);
      onClose();
    }
  };

  const handleQuickRange = (days: number) => {
    const newStart = addDays(today, -Math.abs(days));
    const newEnd = addDays(today, Math.abs(days));
    setSelectedStart(newStart);
    setSelectedEnd(newEnd);
  };

  const handleToday = () => {
    setSelectedStart(today);
    setSelectedEnd(today);
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false;
    return !isBefore(date, selectedStart) && !isAfter(date, selectedEnd);
  };

  const isDateSelected = (date: Date) => {
    return (selectedStart && isSameDay(date, selectedStart)) || 
           (selectedEnd && isSameDay(date, selectedEnd));
  };

  const isDateDisabled = (date: Date) => {
    // Only limit future dates, allow unlimited past dates
    return isAfter(date, maxDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Add days from previous month
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Select Date Range</span>
          <span className="text-sm text-muted-foreground font-normal">
            (Max {maxDays} days future)
          </span>
        </div>
      }
      maxWidth="lg"
      className="space-y-4"
    >
          {/* Quick Range Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-xs"
            >
              Today
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(3)}
                    className="text-xs"
                  >
                    ±3 Days
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>3 days before and after today</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(7)}
                    className="text-xs"
                  >
                    ±7 Days
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>7 days before and after today</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(14)}
                    className="text-xs"
                  >
                    ±14 Days
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>14 days before and after today</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(21)}
                    className="text-xs"
                  >
                    ±21 Days
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>21 days before and after today</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-dashed"
                  >
                    Custom Range
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click on calendar dates to select custom range</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Calendar */}
          <div className="border rounded-lg p-4">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="p-1">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium text-base">
                {format(today, 'MMMM yyyy')}
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isToday = isSameDay(date, today);
                const isSelected = isDateSelected(date);
                const isInRange = isDateInRange(date);
                const isDisabled = isDateDisabled(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && handleDateClick(date)}
                    disabled={isDisabled}
                    className={`
                      aspect-square text-sm rounded-md transition-colors font-medium
                      ${isToday ? 'bg-blue-100 text-blue-900 font-semibold' : ''}
                      ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                      ${isInRange && !isSelected ? 'bg-blue-50 text-blue-700' : ''}
                      ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                      ${!isToday && !isSelected && !isInRange && !isDisabled ? 'text-gray-700' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Range Display */}
          {selectedStart && selectedEnd && (
            <div className="text-sm text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">
                Selected Range
              </div>
              <div className="text-gray-600">
                {format(selectedStart, 'MMM dd, yyyy')} - {format(selectedEnd, 'MMM dd, yyyy')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.ceil((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRange}
              disabled={!selectedStart || !selectedEnd}
              className="flex-1"
            >
              Apply Date Range
            </Button>
          </div>
    </Modal>
  );
}
