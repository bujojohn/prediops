'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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

export interface CompactSearchAndFilterProps {
  fixtures: Fixture[];
  filters: FixtureFilters;
  onFiltersChange: (filters: FixtureFilters) => void;
  showSearch?: boolean;
  showLeagueFilter?: boolean;
  showTeamFilter?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showPredictionsFilter?: boolean;
  showValueBetsFilter?: boolean;
  className?: string;
}

/**
 * Ultra-compact search and filter component
 * - Collapsed by default
 * - No descriptions - users infer functionality
 * - Mobile-friendly
 * - Minimal space usage
 */
export function CompactSearchAndFilter({
  fixtures,
  filters,
  onFiltersChange,
  showSearch = true,
  showLeagueFilter = true,
  showTeamFilter = true,
  showStatusFilter = true,
  showDateFilter = true,
  showPredictionsFilter = true,
  showValueBetsFilter = true,
  className,
}: CompactSearchAndFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize unified date selector
  const dateSelector = useUnifiedDateSelector({
    initialMode: 'single',
    initialDate: filters.dateRange.from || new Date().toISOString().split('T')[0],
    initialRange: filters.dateRange,
    maxFutureDays: 21,
    onSelectionChange: ({ mode, date, range }) => {
      if (mode === 'single' && date) {
        updateFilter('dateRange', { from: date, to: date });
      } else if (mode === 'range' && range) {
        updateFilter('dateRange', range);
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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Search Input - Always visible */}
      {showSearch && (
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      )}

      {/* Compact Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <Filter className="h-3 w-3" />
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <CompactFilterContent
            filters={filters}
            availableLeagues={availableLeagues}
            availableTeams={availableTeams}
            updateFilter={updateFilter}
            updateArrayFilter={updateArrayFilter}
            clearAllFilters={clearAllFilters}
            showLeagueFilter={showLeagueFilter}
            showTeamFilter={showTeamFilter}
            showStatusFilter={showStatusFilter}
            showDateFilter={showDateFilter}
            showPredictionsFilter={showPredictionsFilter}
            showValueBetsFilter={showValueBetsFilter}
            dateSelector={dateSelector}
          />
        </PopoverContent>
      </Popover>

      {/* Clear All Button - Only show if filters are active */}
      {hasActiveFilters(filters) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="h-8 px-2"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface CompactFilterContentProps {
  filters: FixtureFilters;
  availableLeagues: string[];
  availableTeams: string[];
  updateFilter: <K extends keyof FixtureFilters>(key: K, value: FixtureFilters[K]) => void;
  updateArrayFilter: <K extends 'leagues' | 'teams' | 'status'>(key: K, item: string, checked: boolean) => void;
  clearAllFilters: () => void;
  showLeagueFilter: boolean;
  showTeamFilter: boolean;
  showStatusFilter: boolean;
  showDateFilter: boolean;
  showPredictionsFilter: boolean;
  showValueBetsFilter: boolean;
  dateSelector: ReturnType<typeof useUnifiedDateSelector>;
}

function CompactFilterContent({
  filters,
  availableLeagues,
  availableTeams,
  updateFilter,
  updateArrayFilter,
  showLeagueFilter,
  showTeamFilter,
  showStatusFilter,
  showDateFilter,
  showPredictionsFilter,
  showValueBetsFilter,
  dateSelector,
}: CompactFilterContentProps) {
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
      <div className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full py-1 text-left hover:bg-gray-50 rounded px-1"
        >
          <span className={cn(
            "text-xs font-medium",
            hasActive ? "text-blue-600" : "text-gray-600"
          )}>
            {title}
            {hasActive && <span className="ml-1">●</span>}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronDown className="h-3 w-3 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1">
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
          <div className="max-h-20 overflow-y-auto space-y-1">
            {availableLeagues.slice(0, 8).map((league) => (
              <div key={league} className="flex items-center space-x-2">
                <Checkbox
                  id={`league-${league}`}
                  checked={filters.leagues.includes(league)}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('leagues', league, checked)
                  }
                  className="h-3 w-3"
                />
                <Label htmlFor={`league-${league}`} className="text-xs truncate">
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
          <div className="max-h-20 overflow-y-auto space-y-1">
            {availableTeams.slice(0, 6).map((team) => (
              <div key={team} className="flex items-center space-x-2">
                <Checkbox
                  id={`team-${team}`}
                  checked={filters.teams.includes(team)}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('teams', team, checked)
                  }
                  className="h-3 w-3"
                />
                <Label htmlFor={`team-${team}`} className="text-xs truncate">
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
          <div className="space-y-1">
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
                  className="h-3 w-3"
                />
                <Label htmlFor={`status-${status.value}`} className="text-xs">
                  <span className={status.color}>●</span> {status.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Date Filter */}
      {showDateFilter && (
        <FilterSection 
          id="date" 
          title="Date Range" 
          hasActive={!!(filters.dateRange.from || filters.dateRange.to)}
        >
          <div className="space-y-2">
            <UnifiedDateSelector
              mode={dateSelector.mode}
              selectedDate={dateSelector.selectedDate}
              selectedRange={dateSelector.selectedRange}
              onDateChange={(date) => {
                dateSelector.setSelectedDate(date);
                updateFilter('dateRange', { from: date, to: date });
              }}
              onRangeChange={(range) => {
                dateSelector.setSelectedRange(range);
                updateFilter('dateRange', range);
              }}
              onModeChange={(mode) => {
                dateSelector.setMode(mode);
              }}
              maxFutureDays={21}
              showModeSwitcher={true}
              placeholder="Select date"
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {dateSelector.mode === 'single' ? 'Single date selection' : 'Date range selection'}
            </div>
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
          <div className="space-y-1">
            {[
              { value: true, label: 'With' },
              { value: false, label: 'Without' },
            ].map((option) => (
              <div key={option.value.toString()} className="flex items-center space-x-2">
                <Checkbox
                  id={`predictions-${option.value}`}
                  checked={filters.hasPredictions === option.value}
                  onCheckedChange={(checked: boolean) => 
                    updateFilter('hasPredictions', checked ? option.value : null)
                  }
                  className="h-3 w-3"
                />
                <Label htmlFor={`predictions-${option.value}`} className="text-xs">
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
          <div className="space-y-1">
            {[
              { value: true, label: 'With' },
              { value: false, label: 'Without' },
            ].map((option) => (
              <div key={option.value.toString()} className="flex items-center space-x-2">
                <Checkbox
                  id={`valuebets-${option.value}`}
                  checked={filters.hasValueBets === option.value}
                  onCheckedChange={(checked: boolean) => 
                    updateFilter('hasValueBets', checked ? option.value : null)
                  }
                  className="h-3 w-3"
                />
                <Label htmlFor={`valuebets-${option.value}`} className="text-xs">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}
