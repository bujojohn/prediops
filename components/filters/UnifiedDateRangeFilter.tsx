'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRangeSelector } from '@/app/components/date-range-picker/DateRangeSelector';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export interface DateRangePreset {
  label: string;
  days: number;
}

interface UnifiedDateRangeFilterProps {
  onRangeChange: (start: Date, end: Date) => void;
  presets?: DateRangePreset[];
  defaultDays?: number;
  syncWithURL?: boolean;
  className?: string;
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  { label: 'Next 7 days', days: 7 },
  { label: 'Next 14 days', days: 14 },
  { label: 'Next 30 days', days: 30 },
];

/**
 * Unified Date Range Filter Component
 * 
 * Single Responsibility: Provide consistent date range selection across the app
 * 
 * Features:
 * - Configurable presets
 * - URL state persistence (optional)
 * - Consistent UI/UX
 * - Reusable across Team, League, Country pages
 * 
 * @example
 * <UnifiedDateRangeFilter
 *   onRangeChange={(start, end) => {
 *     // React Query will automatically refetch
 *   }}
 *   syncWithURL={true}
 * />
 */
export function UnifiedDateRangeFilter({
  onRangeChange,
  presets = DEFAULT_PRESETS,
  defaultDays = 14,
  syncWithURL = false,
  className = '',
}: UnifiedDateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize date range from URL or default
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    if (syncWithURL) {
      const startParam = searchParams.get('start');
      const endParam = searchParams.get('end');

      if (startParam && endParam) {
        const start = new Date(startParam);
        const end = new Date(endParam);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          return { start, end };
        }
      }
    }

    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + defaultDays);
    return { start: today, end };
  });

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });

    // Update URL params if enabled
    if (syncWithURL) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('start', start.toISOString().split('T')[0]);
      params.set('end', end.toISOString().split('T')[0]);
      
      // Use hash to preserve tab navigation
      const hash = window.location.hash;
      router.push(`?${params.toString()}${hash}`, { scroll: false });
    }

    // Notify parent component
    onRangeChange(start, end);
  };

  const handlePresetClick = (days: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    handleDateRangeChange(start, end);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Date Range Selector */}
      <DateRangeSelector
        startDate={dateRange.start}
        endDate={dateRange.end}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Quick Presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Quick Select:
          </span>
          {presets.map((preset) => (
            <Button
              key={preset.days}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(preset.days)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

