'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfDay, isSameDay, differenceInDays } from 'date-fns';
import type { Fixture } from '@/schemas/fixture.schema';
import { 
  FixtureFilters, 
  DEFAULT_FILTERS, 
  extractLeagues, 
  extractTeams, 
  hasActiveFilters
} from './fixture-search-utils';
import { UnifiedDateSelector } from '../date-picker/UnifiedDateSelector';
import { useUnifiedDateSelector } from '../date-picker/useUnifiedDateSelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

/**
 * Generate semantic date label for display
 */
function getSemanticDateLabel(date: Date, today: Date): string {
  if (isSameDay(date, today)) {
    return 'Today';
  }
  
  const diffDays = differenceInDays(date, today);
  
  if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays === 2) {
    return 'Day After';
  } else if (diffDays === -2) {
    return 'Day Before';
  } else {
    // For all other dates, show the actual date in "MMM d" format (e.g., "Mar 15", "Sep 3")
    return format(date, 'MMM d');
  }
}

export interface UnifiedDateFilterRowProps {
  fixtures: Fixture[];
  filters: FixtureFilters;
  onFiltersChange: (filters: FixtureFilters) => void;
  
  // Date selection
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  
  // Horizontal date picker options
  maxPastDays?: number;
  maxFutureDays?: number;
  
  // Filter options
  showSearch?: boolean;
  showLeagueFilter?: boolean;
  showTeamFilter?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showPredictionsFilter?: boolean;
  showValueBetsFilter?: boolean;
  
  // Loading state
  isLoading?: boolean;
  
  className?: string;
}

/**
 * Unified Date Filter Row Component
 * 
 * Features:
 * - Column 1: Horizontal scrollable date picker (like predictions page)
 * - Column 2: Date range selector with popover
 * - Column 3: Filter icon with popover
 * - Mobile-friendly responsive design
 */
export function UnifiedDateFilterRow({
  fixtures,
  filters,
  onFiltersChange,
  selectedDate,
  onDateChange,
  maxPastDays = 7,
  maxFutureDays = 21,
  showLeagueFilter = true,
  showTeamFilter = true,
  showStatusFilter = true,
  isLoading = false,
  showPredictionsFilter = true,
  showValueBetsFilter = true,
  className,
}: UnifiedDateFilterRowProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  
  // Generate date range for horizontal picker
  const dateRange = useMemo(() => {
    const dates: Array<{
      date: Date;
      dateString: string;
      semanticLabel: string;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
      isSelectable: boolean;
    }> = [];
    
    const today = startOfDay(new Date());

    // Add past dates
    for (let i = maxPastDays; i > 0; i--) {
      const date = subDays(today, i);
      dates.push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        semanticLabel: getSemanticDateLabel(date, today),
        isToday: false,
        isPast: true,
        isFuture: false,
        isSelectable: true,
      });
    }
    
    // Add today
    dates.push({
      date: today,
      dateString: format(today, 'yyyy-MM-dd'),
      semanticLabel: 'Today',
      isToday: true,
      isPast: false,
      isFuture: false,
      isSelectable: true,
    });
    
    // Add future dates
    for (let i = 1; i <= maxFutureDays; i++) {
      const date = addDays(today, i);
      dates.push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        semanticLabel: getSemanticDateLabel(date, today),
        isToday: false,
        isPast: false,
        isFuture: true,
        isSelectable: true,
      });
    }
    
    return dates;
  }, [maxPastDays, maxFutureDays]);

  // Find today's index and center the visible range on it
  const todayIndex = useMemo(() => {
    return dateRange.findIndex(date => date.isToday);
  }, [dateRange]);

  // Initialize visible range centered on today
  const [visibleRange, setVisibleRange] = useState(() => {
    if (todayIndex >= 0) {
      const visibleCount = 5; // Show 5 dates by default
      const halfCount = Math.floor(visibleCount / 2);
      const start = Math.max(0, todayIndex - halfCount);
      const end = Math.min(dateRange.length - 1, start + visibleCount - 1);
      return { start, end };
    }
    return { start: 0, end: 5 };
  });

  // Initialize unified date selector for range selection
  const dateSelector = useUnifiedDateSelector({
    initialMode: 'range',
    initialRange: filters.dateRange,
    maxFutureDays,
    onSelectionChange: ({ range }) => {
      if (range) {
        onFiltersChange({
          ...filters,
          dateRange: range,
        });
      }
    },
  });

  // Extract available options from fixtures
  const availableLeagues = useMemo(() => extractLeagues(fixtures), [fixtures]);
  const availableTeams = useMemo(() => extractTeams(fixtures), [fixtures]);

  // Handle filter updates
  const updateFilter = useCallback(<K extends keyof FixtureFilters>(
    key: K, 
    value: FixtureFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }, [filters, onFiltersChange]);

  // Handle array filter updates
  const updateArrayFilter = useCallback(<K extends 'leagues' | 'teams' | 'status'>(
    key: K,
    item: string,
    checked: boolean
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, item]
      : currentArray.filter(i => i !== item);
    
    updateFilter(key, newArray as FixtureFilters[K]);
  }, [filters, updateFilter]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  // Navigation functions for horizontal date picker
  const scrollLeft = useCallback(() => {
    setVisibleRange(prev => ({
      start: Math.max(0, prev.start - 1),
      end: Math.min(dateRange.length - 1, prev.end - 1),
    }));
  }, [dateRange.length]);

  const scrollRight = useCallback(() => {
    setVisibleRange(prev => ({
      start: Math.max(0, prev.start + 1),
      end: Math.min(dateRange.length - 1, prev.end + 1),
    }));
  }, [dateRange.length]);

  // Count active filters
  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    if (typeof value === 'string') {
      return count + (value.length > 0 ? 1 : 0);
    }
    if (typeof value === 'object' && value !== null) {
      return count + (Object.values(value).some(v => v) ? 1 : 0);
    }
    return count + (value !== null ? 1 : 0);
  }, 0);

  // Get visible dates
  const visibleDates = dateRange.slice(visibleRange.start, visibleRange.end + 1);

  return (
    <div className={cn('flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border rounded-lg', className)}>
      {/* Column 1: Horizontal Date Picker */}
      <div className="flex items-center gap-2 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          disabled={visibleRange.start === 0}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1 overflow-hidden">
          {visibleDates.map(({ date, dateString, semanticLabel, isToday }) => {
            const isSelected = selectedDate === dateString;
            return (
              <Button
                key={dateString}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => !isLoading && onDateChange?.(dateString)}
                disabled={isLoading}
                className={cn(
                  "h-8 px-3 text-xs whitespace-nowrap",
                  isToday && !isSelected && "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                title={format(date, 'EEEE, MMMM d, yyyy')} // Full date tooltip
              >
                {isLoading && isSelected ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                {semanticLabel}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          disabled={visibleRange.end === dateRange.length - 1}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Column 2: Date Range Selector */}
      <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Calendar className="h-4 w-4 mr-2" />
            Range
            {filters.dateRange.from && filters.dateRange.to && (
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                {format(new Date(filters.dateRange.from), 'dd/MM')}-{format(new Date(filters.dateRange.to), 'dd/MM')}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <UnifiedDateSelector
            mode={dateSelector.mode}
            selectedDate={dateSelector.selectedDate}
            selectedRange={dateSelector.selectedRange}
            onDateChange={dateSelector.setSelectedDate}
            onRangeChange={dateSelector.setSelectedRange}
            onModeChange={dateSelector.setMode}
            maxFutureDays={maxFutureDays}
            showModeSwitcher={true}
            placeholder="Select date range"
            className="w-full"
          />
        </PopoverContent>
      </Popover>

      {/* Column 3: Filter Icon */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-3 relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <FilterContent
            filters={filters}
            availableLeagues={availableLeagues}
            availableTeams={availableTeams}
            updateFilter={updateFilter}
            updateArrayFilter={updateArrayFilter}
            clearAllFilters={clearAllFilters}
            showLeagueFilter={showLeagueFilter}
            showTeamFilter={showTeamFilter}
            showStatusFilter={showStatusFilter}
            showPredictionsFilter={showPredictionsFilter}
            showValueBetsFilter={showValueBetsFilter}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface FilterContentProps {
  filters: FixtureFilters;
  availableLeagues: string[];
  availableTeams: string[];
  updateFilter: <K extends keyof FixtureFilters>(key: K, value: FixtureFilters[K]) => void;
  updateArrayFilter: <K extends 'leagues' | 'teams' | 'status'>(key: K, item: string, checked: boolean) => void;
  clearAllFilters: () => void;
  showLeagueFilter: boolean;
  showTeamFilter: boolean;
  showStatusFilter: boolean;
  showPredictionsFilter: boolean;
  showValueBetsFilter: boolean;
}

function FilterContent({
  filters,
  availableLeagues,
  availableTeams,
  updateFilter,
  updateArrayFilter,
  clearAllFilters,
  showLeagueFilter,
  showTeamFilter,
  showStatusFilter,
  showPredictionsFilter,
  showValueBetsFilter,
}: FilterContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const FilterSection = ({ 
    id, 
    title, 
    children, 
    hasActive 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode; 
    hasActive: boolean;
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0 mb-3 last:mb-0">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full py-1 text-left hover:bg-gray-50 rounded px-1"
        >
          <span className={cn(
            "text-sm font-medium",
            hasActive ? "text-blue-600" : "text-gray-600"
          )}>
            {title}
            {hasActive && <span className="ml-1">●</span>}
          </span>
          <span className="text-gray-400">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* League Filter */}
      {showLeagueFilter && (
        <FilterSection 
          id="leagues" 
          title="Leagues" 
          hasActive={filters.leagues.length > 0}
        >
          <div className="max-h-32 overflow-y-auto space-y-2">
            {availableLeagues.slice(0, 8).map((league) => (
              <div key={league} className="flex items-center space-x-2">
                <Checkbox
                  id={`league-${league}`}
                  checked={filters.leagues.includes(league)}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('leagues', league, checked)
                  }
                />
                <Label htmlFor={`league-${league}`} className="text-sm truncate">
                  {league}
                </Label>
              </div>
            ))}
            {availableLeagues.length > 8 && (
              <div className="text-xs text-gray-400 text-center">
                +{availableLeagues.length - 8} more
              </div>
            )}
          </div>
        </FilterSection>
      )}

      {/* Team Filter */}
      {showTeamFilter && (
        <FilterSection 
          id="teams" 
          title="Teams" 
          hasActive={filters.teams.length > 0}
        >
          <div className="max-h-32 overflow-y-auto space-y-2">
            {availableTeams.slice(0, 6).map((team) => (
              <div key={team} className="flex items-center space-x-2">
                <Checkbox
                  id={`team-${team}`}
                  checked={filters.teams.includes(team)}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('teams', team, checked)
                  }
                />
                <Label htmlFor={`team-${team}`} className="text-sm truncate">
                  {team}
                </Label>
              </div>
            ))}
            {availableTeams.length > 6 && (
              <div className="text-xs text-gray-400 text-center">
                +{availableTeams.length - 6} more
              </div>
            )}
          </div>
        </FilterSection>
      )}

      {/* Status Filter */}
      {showStatusFilter && (
        <FilterSection 
          id="status" 
          title="Status" 
          hasActive={filters.status.length > 0}
        >
          <div className="space-y-2">
            {[
              { value: 'live', label: 'Live', color: 'text-red-500' },
              { value: 'upcoming', label: 'Upcoming', color: 'text-blue-500' },
              { value: 'finished', label: 'Finished', color: 'text-gray-500' },
            ].map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status.includes(status.value as 'live' | 'upcoming' | 'finished')}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('status', status.value, checked)
                  }
                />
                <Label htmlFor={`status-${status.value}`} className="text-sm">
                  <span className={status.color}>●</span> {status.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Predictions Filter */}
      {showPredictionsFilter && (
        <FilterSection 
          id="predictions" 
          title="Predictions" 
          hasActive={filters.hasPredictions !== null}
        >
          <div className="space-y-2">
            {[
              { value: true, label: 'With Predictions' },
              { value: false, label: 'Without Predictions' },
            ].map((option) => (
              <div key={option.value.toString()} className="flex items-center space-x-2">
                <Checkbox
                  id={`predictions-${option.value}`}
                  checked={filters.hasPredictions === option.value}
                  onCheckedChange={(checked: boolean) => 
                    updateFilter('hasPredictions', checked ? option.value : null)
                  }
                />
                <Label htmlFor={`predictions-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Value Bets Filter */}
      {showValueBetsFilter && (
        <FilterSection 
          id="valuebets" 
          title="Value Bets" 
          hasActive={filters.hasValueBets !== null}
        >
          <div className="space-y-2">
            {[
              { value: true, label: 'With Value Bets' },
              { value: false, label: 'Without Value Bets' },
            ].map((option) => (
              <div key={option.value.toString()} className="flex items-center space-x-2">
                <Checkbox
                  id={`valuebets-${option.value}`}
                  checked={filters.hasValueBets === option.value}
                  onCheckedChange={(checked: boolean) => 
                    updateFilter('hasValueBets', checked ? option.value : null)
                  }
                />
                <Label htmlFor={`valuebets-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Clear All Button */}
      {hasActiveFilters(filters) && (
        <div className="pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default UnifiedDateFilterRow;
