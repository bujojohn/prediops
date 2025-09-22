'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, RefreshCw } from 'lucide-react';
import type { Fixture } from '@/schemas/fixture.schema';
import { groupByDate, groupByLeague, type FixtureGroup } from '@/app/predictions/utils/grouping-utils';
import { useCollapsedDates } from '@/app/predictions/hooks/useCollapsedDates';
import { useFixtureSearchAndFilter } from '@/app/hooks/useFixtureSearchAndFilter';
import { FixtureFilters } from './fixture-search-utils';
import { UnifiedDateFilterRow } from './UnifiedDateFilterRow';
import { VirtualFixtureList } from './VirtualFixtureList';
import { OptimizedFixtureCard } from './OptimizedFixtureCard';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import { useInfiniteScroll } from '@/app/hooks/useInfiniteScroll';

export interface OptimizedReusableFixtureDisplayProps {
  fixtures: Fixture[];
  selectedDate?: string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onTryNextWeek?: () => void;
  onTryToday?: () => void;
  
  // Display options
  variant?: 'predictions' | 'league' | 'team' | 'live';
  showDateHeaders?: boolean;
  showLeagueHeaders?: boolean;
  showEmptyState?: boolean;
  compact?: boolean;
  useVirtualScrolling?: boolean;
  virtualScrollingThreshold?: number;
  
  // Search and filter options
  showSearchAndFilter?: boolean;
  searchAndFilterVariant?: 'compact' | 'full';
  initialFilters?: Partial<FixtureFilters>;
  searchAndFilterOptions?: {
    showSearch?: boolean;
    showLeagueFilter?: boolean;
    showTeamFilter?: boolean;
    showStatusFilter?: boolean;
    showDateFilter?: boolean;
    showPredictionsFilter?: boolean;
    showValueBetsFilter?: boolean;
  };
  
  // Custom empty state messages
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateActions?: React.ReactNode;
  
  // Custom grouping
  customGrouping?: (fixtures: Fixture[]) => FixtureGroup[];
  
  // Event handlers
  onPredictionClick?: (fixture: Fixture) => void;
  onValueBetClick?: (fixture: Fixture) => void;
}

/**
 * Optimized version of ReusableFixtureDisplay with performance enhancements:
 * - Memoized components to prevent unnecessary re-renders
 * - Virtual scrolling for large datasets
 * - Optimized fixture cards with custom comparison
 * - Efficient filtering and grouping
 */
export const OptimizedReusableFixtureDisplay = memo<OptimizedReusableFixtureDisplayProps>(({
  fixtures,
  selectedDate,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onTryNextWeek,
  onTryToday,
  variant = 'predictions',
  showDateHeaders = true,
  showLeagueHeaders = true,
  showEmptyState = true,
  compact = false,
  useVirtualScrolling = true,
  virtualScrollingThreshold = 50,
  showSearchAndFilter = true,
  initialFilters,
  searchAndFilterOptions,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateActions,
  customGrouping,
  onPredictionClick,
  onValueBetClick,
}) => {
  // Search and filter functionality
  const {
    filters,
    filteredFixtures,
    hasActiveFilters: hasFilters,
    updateFilters,
    filterStats,
  } = useFixtureSearchAndFilter(fixtures, {
    initialFilters,
  });
  
  // Determine grouping strategy based on variant and options
  const fixturesToGroup = showSearchAndFilter ? filteredFixtures : fixtures;
  
  const groups = useMemo(() => {
    if (customGrouping) {
      return customGrouping(fixturesToGroup);
    }
    
    if (showDateHeaders) {
      return groupByDate(fixturesToGroup);
    }
    
    if (showLeagueHeaders) {
      return groupByLeague(fixturesToGroup);
    }
    
    // Single group if no headers needed
    return [{
      id: 'all-fixtures',
      title: 'Fixtures',
      fixtures: fixturesToGroup
    }];
  }, [fixturesToGroup, customGrouping, showDateHeaders, showLeagueHeaders]);

  const { collapsedDates, toggleDateCollapse } = useCollapsedDates({
    groups,
    selectedDate: selectedDate || '',
  });

  // Determine if we should use virtual scrolling
  const shouldUseVirtualScrolling = useMemo(() => {
    return useVirtualScrolling && filteredFixtures.length > virtualScrollingThreshold;
  }, [useVirtualScrolling, filteredFixtures.length, virtualScrollingThreshold]);

  // Memoized empty state
  const emptyState = useMemo(() => {
    if (!showEmptyState) return null;

    const title = emptyStateTitle || `${variant.charAt(0).toUpperCase() + variant.slice(1)} - No Fixtures Found`;
    const message = emptyStateMessage || 'No fixtures found for the selected criteria.';

    return (
      <Card>
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {message}
          </p>
          {emptyStateActions || (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              )}
              {onTryNextWeek && (
                <button
                  onClick={onTryNextWeek}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Try Next Week
                </button>
              )}
              {onTryToday && (
                <button
                  onClick={onTryToday}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Try Today
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }, [showEmptyState, emptyStateTitle, emptyStateMessage, emptyStateActions, variant, onRefresh, onTryNextWeek, onTryToday]);

  // Infinite scroll functionality
  const { sentinelRef } = useInfiniteScroll(
    onLoadMore || (() => {}),
    {
      enabled: !!onLoadMore && hasMore,
      threshold: 100,
    }
  );

  // Memoized event handlers
  const handlePredictionClick = useCallback((fixture: Fixture) => {
    if (onPredictionClick) {
      onPredictionClick(fixture);
    }
  }, [onPredictionClick]);

  const handleValueBetClick = useCallback((fixture: Fixture) => {
    if (onValueBetClick) {
      onValueBetClick(fixture);
    }
  }, [onValueBetClick]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredFixtures.length === 0) {
    return (
      <div className="space-y-4">
        {showSearchAndFilter && (
          <UnifiedDateFilterRow
            fixtures={fixtures}
            filters={filters}
            onFiltersChange={updateFilters}
            selectedDate={selectedDate}
            onDateChange={(date) => {
              // Update URL or state as needed
              console.log('Date changed to:', date);
            }}
            maxPastDays={7}
            maxFutureDays={21}
            {...searchAndFilterOptions}
          />
        )}
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      {showSearchAndFilter && (
        <UnifiedDateFilterRow
          fixtures={fixtures}
          filters={filters}
          onFiltersChange={updateFilters}
          selectedDate={selectedDate}
          onDateChange={(date) => {
            // Update URL or state as needed
            console.log('Date changed to:', date);
          }}
          maxPastDays={7}
          maxFutureDays={21}
          {...searchAndFilterOptions}
        />
      )}
      
      {/* Filter Stats */}
      {showSearchAndFilter && hasFilters && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filterStats.filtered} of {filterStats.total} fixtures
          {filterStats.leagues > 0 && ` across ${filterStats.leagues} leagues`}
        </div>
      )}

      {/* Fixture Display */}
      {shouldUseVirtualScrolling ? (
        <VirtualFixtureList
          groups={groups}
          height={600}
          itemHeight={compact ? 100 : 140}
          compact={compact}
          showPredictions={true}
          showValueBets={true}
          onPredictionClick={handlePredictionClick}
          onValueBetClick={handleValueBetClick}
          overscanCount={5}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const leagueGroups = showLeagueHeaders && showDateHeaders ? groupByLeague(group.fixtures) : [group];
            
            return (
              <div key={group.id} className="space-y-4">
                {leagueGroups.map((leagueGroup) => {
                  const isCollapsed = collapsedDates.has(leagueGroup.id);
                  
                  return (
                    <div key={leagueGroup.id} className="space-y-3">
                      {/* Group Header */}
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => toggleDateCollapse(leagueGroup.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isCollapsed ? 'bg-gray-400' : 'bg-blue-500'}`} />
                          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {leagueGroup.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {leagueGroup.fixtures.length} fixture{leagueGroup.fixtures.length !== 1 ? 's' : ''}
                          </span>
                          <div className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                            ▶
                          </div>
                        </div>
                      </div>
                      
                      {/* Fixtures */}
                      {!isCollapsed && (
                        <div className="grid gap-3">
                          {leagueGroup.fixtures.map((fixture) => (
                            <OptimizedFixtureCard
                              key={fixture.id}
                              fixture={fixture}
                              compact={compact}
                              showPredictions={true}
                              showValueBets={true}
                              onPredictionClick={handlePredictionClick}
                              onValueBetClick={handleValueBetClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {onLoadMore && (
        <InfiniteScrollTrigger
          isLoading={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          variant="auto"
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  return (
    prevProps.fixtures.length === nextProps.fixtures.length &&
    prevProps.fixtures[0]?.id === nextProps.fixtures[0]?.id &&
    prevProps.selectedDate === nextProps.selectedDate &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isLoadingMore === nextProps.isLoadingMore &&
    prevProps.hasMore === nextProps.hasMore &&
    prevProps.compact === nextProps.compact &&
    prevProps.showSearchAndFilter === nextProps.showSearchAndFilter &&
    prevProps.searchAndFilterVariant === nextProps.searchAndFilterVariant
  );
});

OptimizedReusableFixtureDisplay.displayName = 'OptimizedReusableFixtureDisplay';
