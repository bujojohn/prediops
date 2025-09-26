'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, Trophy, Users, Target, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export interface FixtureSearchAndFilterProps {
  fixtures: Fixture[];
  filters: FixtureFilters;
  onFiltersChange: (filters: FixtureFilters) => void;
  variant?: 'compact' | 'full';
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
 * Reusable search and filter component for fixtures
 * Can be configured to show different filter options based on context
 */
export function FixtureSearchAndFilter({
  fixtures,
  filters,
  onFiltersChange,
  variant = 'full',
  showSearch = true,
  showLeagueFilter = true,
  showTeamFilter = true,
  showStatusFilter = true,
  showDateFilter = true,
  showPredictionsFilter = true,
  showValueBetsFilter = true,
  className,
}: FixtureSearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract available options from fixtures
  const availableLeagues = useMemo(() => extractLeagues(fixtures), [fixtures]);
  const availableTeams = useMemo(() => extractTeams(fixtures), [fixtures]);

  // Handle filter updates
  const updateFilter = <K extends keyof FixtureFilters>(
    key: K, 
    value: FixtureFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Handle array filter updates (leagues, teams, status)
  const updateArrayFilter = <K extends 'leagues' | 'teams' | 'status'>(
    key: K,
    item: string,
    checked: boolean
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, item]
      : currentArray.filter(i => i !== item);
    
    updateFilter(key, newArray as FixtureFilters[K]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  // Clear specific filter
  const clearFilter = (key: keyof FixtureFilters) => {
    updateFilter(key, DEFAULT_FILTERS[key]);
  };

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

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {/* Search Input */}
        {showSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search fixtures..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <FilterContent
              filters={filters}
              availableLeagues={availableLeagues}
              availableTeams={availableTeams}
              updateFilter={updateFilter}
              updateArrayFilter={updateArrayFilter}
              clearFilter={clearFilter}
              clearAllFilters={clearAllFilters}
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
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filters</CardTitle>
          {hasActiveFilters(filters) && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by team name or league..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filter Summary */}
        {hasActiveFilters(filters) && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {getFilterSummary(filters).split(' • ').map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
                <button
                  onClick={() => {
                    // This is a simplified clear - in a real implementation you'd need more sophisticated logic
                    if (filter.includes('Search:')) clearFilter('searchQuery');
                    // Add more specific clear logic as needed
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <FilterContent
          filters={filters}
          availableLeagues={availableLeagues}
          availableTeams={availableTeams}
          updateFilter={updateFilter}
          updateArrayFilter={updateArrayFilter}
          clearFilter={clearFilter}
          clearAllFilters={clearAllFilters}
          showLeagueFilter={showLeagueFilter}
          showTeamFilter={showTeamFilter}
          showStatusFilter={showStatusFilter}
          showDateFilter={showDateFilter}
          showPredictionsFilter={showPredictionsFilter}
          showValueBetsFilter={showValueBetsFilter}
        />
      </CardContent>
    </Card>
  );
}

interface FilterContentProps {
  filters: FixtureFilters;
  availableLeagues: string[];
  availableTeams: string[];
  updateFilter: <K extends keyof FixtureFilters>(key: K, value: FixtureFilters[K]) => void;
  updateArrayFilter: <K extends 'leagues' | 'teams' | 'status'>(key: K, item: string, checked: boolean) => void;
  clearFilter: (key: keyof FixtureFilters) => void;
  clearAllFilters: () => void;
  showLeagueFilter: boolean;
  showTeamFilter: boolean;
  showStatusFilter: boolean;
  showDateFilter: boolean;
  showPredictionsFilter: boolean;
  showValueBetsFilter: boolean;
}

function FilterContent({
  filters,
  availableLeagues,
  availableTeams,
  updateFilter,
  updateArrayFilter,
  clearFilter,
  showLeagueFilter,
  showTeamFilter,
  showStatusFilter,
  showDateFilter,
  showPredictionsFilter,
  showValueBetsFilter,
}: FilterContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* League Filter */}
      {showLeagueFilter && (
        <FilterSection
          title="Leagues"
          icon={<Trophy className="h-4 w-4" />}
          onClear={() => clearFilter('leagues')}
          hasActive={filters.leagues.length > 0}
        >
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableLeagues.map((league) => (
              <div key={league} className="flex items-center space-x-2">
                <Checkbox
                  id={`league-${league}`}
                  checked={filters.leagues.includes(league)}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('leagues', league, checked)
                  }
                />
                <Label htmlFor={`league-${league}`} className="text-sm">
                  {league}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Team Filter */}
      {showTeamFilter && (
        <FilterSection
          title="Teams"
          icon={<Users className="h-4 w-4" />}
          onClear={() => clearFilter('teams')}
          hasActive={filters.teams.length > 0}
        >
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableTeams.slice(0, 20).map((team) => (
              <div key={team} className="flex items-center space-x-2">
                <Checkbox
                  id={`team-${team}`}
                  checked={filters.teams.includes(team)}
                  onCheckedChange={(checked: boolean) => 
                    updateArrayFilter('teams', team, checked)
                  }
                />
                <Label htmlFor={`team-${team}`} className="text-sm">
                  {team}
                </Label>
              </div>
            ))}
            {availableTeams.length > 20 && (
              <div className="text-xs text-gray-500 text-center">
                Showing first 20 teams
              </div>
            )}
          </div>
        </FilterSection>
      )}

      {/* Status Filter */}
      {showStatusFilter && (
        <FilterSection
          title="Status"
          icon={<Calendar className="h-4 w-4" />}
          onClear={() => clearFilter('status')}
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

      {/* Date Filter */}
      {showDateFilter && (
        <FilterSection
          title="Date Range"
          icon={<Calendar className="h-4 w-4" />}
          onClear={() => clearFilter('dateRange')}
          hasActive={!!(filters.dateRange.from || filters.dateRange.to)}
        >
          <div className="space-y-3">
            <div>
              <Label htmlFor="date-from" className="text-sm">From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateRange.from || ''}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  from: e.target.value || null
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-sm">To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateRange.to || ''}
                onChange={(e) => updateFilter('dateRange', {
                  ...filters.dateRange,
                  to: e.target.value || null
                })}
                className="mt-1"
              />
            </div>
          </div>
        </FilterSection>
      )}

      {/* Predictions Filter */}
      {showPredictionsFilter && (
        <FilterSection
          title="Predictions"
          icon={<Target className="h-4 w-4" />}
          onClear={() => clearFilter('hasPredictions')}
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
          title="Value Bets"
          icon={<Zap className="h-4 w-4" />}
          onClear={() => clearFilter('hasValueBets')}
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
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  onClear: () => void;
  hasActive: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, icon, onClear, hasActive, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
