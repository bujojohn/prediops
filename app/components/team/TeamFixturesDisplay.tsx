'use client';

import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { useTeamFixtures } from '@/app/hooks/useTeamFixtures';
import type { Fixture } from '@/schemas/fixture.schema';
import type { FixtureFilters } from '@/app/components/fixtures/fixture-search-utils';

export interface TeamFixturesDisplayProps {
  teamId: string;
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
 * Team-specific fixture display component that uses the reusable architecture
 * Can be used in team detail pages, team overviews, etc.
 */
export function TeamFixturesDisplay({ 
  teamId, 
  initialFixtures = [],
  variant = 'overview',
  showSearchAndFilter = true,
  searchAndFilterVariant = 'compact',
  initialFilters,
  searchAndFilterOptions,
}: TeamFixturesDisplayProps) {
  const {
    fixtures,
    isLoading,
    isLoadingMore,
    hasMore,
    loadTeamFixtures,
    loadNextPage,
  } = useTeamFixtures({
    teamId,
    initialFixtures,
  });

  // Handle refresh
  const handleRefresh = () => {
    loadTeamFixtures();
  };

  // Handle try next week
  const handleTryNextWeek = () => {
    // Could implement date-based filtering for team fixtures
    loadTeamFixtures();
  };

  // Handle try today
  const handleTryToday = () => {
    loadTeamFixtures();
  };

  // Custom empty state for teams
  const customEmptyState = (
    <div className="text-center space-y-4">
      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
        No Team Fixtures Found
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        No fixtures found for this team. This could be due to off-season or data availability.
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
      variant="team"
      showDateHeaders={variant === 'detailed'}
      showLeagueHeaders={true}
      showEmptyState={true}
      compact={variant === 'compact'}
      emptyStateTitle="No Team Fixtures"
      emptyStateMessage="No fixtures found for this team."
      emptyStateActions={customEmptyState}
      showSearchAndFilter={showSearchAndFilter}
      searchAndFilterVariant={searchAndFilterVariant}
      initialFilters={initialFilters}
      searchAndFilterOptions={searchAndFilterOptions}
    />
  );
}
