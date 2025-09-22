'use client';

import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { useLeagueFixtures } from '@/app/hooks/useLeagueFixtures';
import type { Fixture } from '@/schemas/fixture.schema';
import type { FixtureFilters } from '@/app/components/fixtures/fixture-search-utils';

export interface LeagueFixturesDisplayProps {
  leagueId: string;
  seasonId?: string;
  initialFixtures?: Fixture[];
  variant?: 'overview' | 'detailed' | 'compact';
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
}

/**
 * League-specific fixture display component that uses the reusable architecture
 * Can be used in league detail pages, league standings, etc.
 */
export function LeagueFixturesDisplay({ 
  leagueId, 
  seasonId,
  initialFixtures = [],
  variant = 'overview',
  showSearchAndFilter = true,
  searchAndFilterVariant = 'compact',
  initialFilters,
  searchAndFilterOptions,
}: LeagueFixturesDisplayProps) {
  const {
    fixtures,
    isLoading,
    isLoadingMore,
    hasMore,
    loadLeagueFixtures,
    loadNextPage,
  } = useLeagueFixtures({
    leagueId,
    seasonId,
    initialFixtures,
  });

  // Handle refresh
  const handleRefresh = () => {
    loadLeagueFixtures();
  };

  // Handle try next week
  const handleTryNextWeek = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    loadLeagueFixtures({ date_from: nextWeekStr });
  };

  // Handle try today
  const handleTryToday = () => {
    const today = new Date().toISOString().split('T')[0];
    loadLeagueFixtures({ date_from: today });
  };

  // Custom empty state for leagues
  const customEmptyState = (
    <div className="text-center space-y-4">
      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
        No League Fixtures Found
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        No fixtures found for this league. This could be due to off-season or data availability.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Refresh Data
        </button>
        <button
          onClick={handleTryNextWeek}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Check Next Week
        </button>
      </div>
    </div>
  );

  return (
    <ReusableFixtureDisplay
      fixtures={fixtures}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadNextPage}
      onRefresh={handleRefresh}
      onTryNextWeek={handleTryNextWeek}
      onTryToday={handleTryToday}
      variant="league"
      showDateHeaders={variant === 'detailed'}
      showLeagueHeaders={false} // League pages don't need league headers
      showEmptyState={true}
      compact={variant === 'compact'}
      emptyStateTitle="No League Fixtures"
      emptyStateMessage="No fixtures found for this league."
      emptyStateActions={customEmptyState}
      showSearchAndFilter={showSearchAndFilter}
      searchAndFilterVariant={searchAndFilterVariant}
      initialFilters={initialFilters}
      searchAndFilterOptions={searchAndFilterOptions}
    />
  );
}
