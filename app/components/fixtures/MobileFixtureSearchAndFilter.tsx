'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, Calendar, Trophy, Users, Target, Zap, ChevronDown } from 'lucide-react';
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
  hasActiveFilters,
  getFilterSummary 
} from './fixture-search-utils';

export interface MobileFixtureSearchAndFilterProps {
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
 * Mobile-optimized search and filter component
 * Features:
 * - Touch-friendly interface
 * - Collapsible sections
 * - Swipe gestures support
 * - Optimized for small screens
 */
export const MobileFixtureSearchAndFilter = React.memo<MobileFixtureSearchAndFilterProps>(({
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
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['search']));

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

  // Clear specific filter
  const clearFilter = useCallback((key: keyof FixtureFilters) => {
    updateFilter(key, DEFAULT_FILTERS[key]);
  }, [updateFilter]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const activeFiltersCount = Object.values(filters).reduce((count: number, value) => {
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
    <div className={cn('space-y-3', className)}>
      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search fixtures..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      )}

      {/* Filter Button */}
      <div className="flex items-center justify-between">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="lg" 
              className="relative flex-1 h-12 text-base touch-manipulation"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-screen max-w-sm mx-4 p-0" align="start" sideOffset={8}>
            <MobileFilterContent
              filters={filters}
              availableLeagues={availableLeagues}
              availableTeams={availableTeams}
              updateFilter={updateFilter}
              updateArrayFilter={updateArrayFilter}
              clearFilter={clearFilter}
              clearAllFilters={clearAllFilters}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              showLeagueFilter={showLeagueFilter}
              showTeamFilter={showTeamFilter}
              showStatusFilter={showStatusFilter}
              showDateFilter={showDateFilter}
              showPredictionsFilter={showPredictionsFilter}
              showValueBetsFilter={showValueBetsFilter}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters(filters) && (
        <div className="flex flex-wrap gap-2">
          {getFilterSummary(filters).split(' • ').map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
              {filter}
              <button
                onClick={() => {
                  if (filter.includes('Search:')) clearFilter('searchQuery');
                }}
                className="ml-1 hover:text-red-500 touch-manipulation"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs px-2 py-1 h-auto touch-manipulation"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
});

interface MobileFilterContentProps {
  filters: FixtureFilters;
  availableLeagues: string[];
  availableTeams: string[];
  updateFilter: <K extends keyof FixtureFilters>(key: K, value: FixtureFilters[K]) => void;
  updateArrayFilter: <K extends 'leagues' | 'teams' | 'status'>(key: K, item: string, checked: boolean) => void;
  clearFilter: (key: keyof FixtureFilters) => void;
  clearAllFilters: () => void;
  expandedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  showLeagueFilter: boolean;
  showTeamFilter: boolean;
  showStatusFilter: boolean;
  showDateFilter: boolean;
  showPredictionsFilter: boolean;
  showValueBetsFilter: boolean;
}

function MobileFilterContent({
  filters,
  availableLeagues,
  availableTeams,
  updateFilter,
  updateArrayFilter,
  clearFilter,
  clearAllFilters,
  expandedSections,
  toggleSection,
  showLeagueFilter,
  showTeamFilter,
  showStatusFilter,
  showDateFilter,
  showPredictionsFilter,
  showValueBetsFilter,
}: MobileFilterContentProps) {
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* League Filter */}
        {showLeagueFilter && (
          <MobileFilterSection
            title="Leagues"
            icon={<Trophy className="h-4 w-4" />}
            sectionId="leagues"
            expanded={expandedSections.has('leagues')}
            onToggle={toggleSection}
            hasActive={filters.leagues.length > 0}
            onClear={() => clearFilter('leagues')}
          >
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {availableLeagues.map((league) => (
                <div key={league} className="flex items-center space-x-3">
                  <Checkbox
                    id={`mobile-league-${league}`}
                    checked={filters.leagues.includes(league)}
                    onCheckedChange={(checked: boolean) => 
                      updateArrayFilter('leagues', league, checked)
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`mobile-league-${league}`} className="text-sm flex-1">
                    {league}
                  </Label>
                </div>
              ))}
            </div>
          </MobileFilterSection>
        )}

        {/* Team Filter */}
        {showTeamFilter && (
          <MobileFilterSection
            title="Teams"
            icon={<Users className="h-4 w-4" />}
            sectionId="teams"
            expanded={expandedSections.has('teams')}
            onToggle={toggleSection}
            hasActive={filters.teams.length > 0}
            onClear={() => clearFilter('teams')}
          >
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {availableTeams.slice(0, 15).map((team) => (
                <div key={team} className="flex items-center space-x-3">
                  <Checkbox
                    id={`mobile-team-${team}`}
                    checked={filters.teams.includes(team)}
                    onCheckedChange={(checked: boolean) => 
                      updateArrayFilter('teams', team, checked)
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`mobile-team-${team}`} className="text-sm flex-1">
                    {team}
                  </Label>
                </div>
              ))}
              {availableTeams.length > 15 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  Showing first 15 teams
                </div>
              )}
            </div>
          </MobileFilterSection>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <MobileFilterSection
            title="Status"
            icon={<Calendar className="h-4 w-4" />}
            sectionId="status"
            expanded={expandedSections.has('status')}
            onToggle={toggleSection}
            hasActive={filters.status.length > 0}
            onClear={() => clearFilter('status')}
          >
            <div className="space-y-3">
              {[
                { value: 'live', label: 'Live', color: 'text-red-500' },
                { value: 'upcoming', label: 'Upcoming', color: 'text-blue-500' },
                { value: 'finished', label: 'Finished', color: 'text-gray-500' },
              ].map((status) => (
                <div key={status.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`mobile-status-${status.value}`}
                    checked={filters.status.includes(status.value as 'live' | 'upcoming' | 'finished')}
                    onCheckedChange={(checked: boolean) => 
                      updateArrayFilter('status', status.value, checked)
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`mobile-status-${status.value}`} className="text-sm flex-1">
                    <span className={status.color}>●</span> {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </MobileFilterSection>
        )}

        {/* Date Filter */}
        {showDateFilter && (
          <MobileFilterSection
            title="Date Range"
            icon={<Calendar className="h-4 w-4" />}
            sectionId="dateRange"
            expanded={expandedSections.has('dateRange')}
            onToggle={toggleSection}
            hasActive={!!(filters.dateRange.from || filters.dateRange.to)}
            onClear={() => clearFilter('dateRange')}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobile-date-from" className="text-sm font-medium">From</Label>
                <Input
                  id="mobile-date-from"
                  type="date"
                  value={filters.dateRange.from || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value || null
                  })}
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="mobile-date-to" className="text-sm font-medium">To</Label>
                <Input
                  id="mobile-date-to"
                  type="date"
                  value={filters.dateRange.to || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value || null
                  })}
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>
          </MobileFilterSection>
        )}

        {/* Predictions Filter */}
        {showPredictionsFilter && (
          <MobileFilterSection
            title="Predictions"
            icon={<Target className="h-4 w-4" />}
            sectionId="predictions"
            expanded={expandedSections.has('predictions')}
            onToggle={toggleSection}
            hasActive={filters.hasPredictions !== null}
            onClear={() => clearFilter('hasPredictions')}
          >
            <div className="space-y-3">
              {[
                { value: true, label: 'With Predictions' },
                { value: false, label: 'Without Predictions' },
              ].map((option) => (
                <div key={option.value.toString()} className="flex items-center space-x-3">
                  <Checkbox
                    id={`mobile-predictions-${option.value}`}
                    checked={filters.hasPredictions === option.value}
                    onCheckedChange={(checked: boolean) => 
                      updateFilter('hasPredictions', checked ? option.value : null)
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`mobile-predictions-${option.value}`} className="text-sm flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </MobileFilterSection>
        )}

        {/* Value Bets Filter */}
        {showValueBetsFilter && (
          <MobileFilterSection
            title="Value Bets"
            icon={<Zap className="h-4 w-4" />}
            sectionId="valueBets"
            expanded={expandedSections.has('valueBets')}
            onToggle={toggleSection}
            hasActive={filters.hasValueBets !== null}
            onClear={() => clearFilter('hasValueBets')}
          >
            <div className="space-y-3">
              {[
                { value: true, label: 'With Value Bets' },
                { value: false, label: 'Without Value Bets' },
              ].map((option) => (
                <div key={option.value.toString()} className="flex items-center space-x-3">
                  <Checkbox
                    id={`mobile-valuebets-${option.value}`}
                    checked={filters.hasValueBets === option.value}
                    onCheckedChange={(checked: boolean) => 
                      updateFilter('hasValueBets', checked ? option.value : null)
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor={`mobile-valuebets-${option.value}`} className="text-sm flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </MobileFilterSection>
        )}
      </div>
    </div>
  );
}

interface MobileFilterSectionProps {
  title: string;
  icon: React.ReactNode;
  sectionId: string;
  expanded: boolean;
  onToggle: (sectionId: string) => void;
  hasActive: boolean;
  onClear: () => void;
  children: React.ReactNode;
}

function MobileFilterSection({ 
  title, 
  icon, 
  sectionId, 
  expanded, 
  onToggle, 
  hasActive, 
  onClear, 
  children 
}: MobileFilterSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => onToggle(sectionId)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h4 className="font-medium text-base">{title}</h4>
          {hasActive && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded touch-manipulation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            expanded ? 'rotate-180' : 'rotate-0'
          )} />
        </div>
      </button>
      {expanded && (
        <div className="p-4 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
}

MobileFixtureSearchAndFilter.displayName = 'MobileFixtureSearchAndFilter';
