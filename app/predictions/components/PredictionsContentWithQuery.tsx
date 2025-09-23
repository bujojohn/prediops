'use client';

import type { Fixture } from '@/schemas/fixture.schema';
import { usePredictionsWithQuery } from '../hooks/usePredictionsWithQuery';
import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface PredictionsContentWithQueryProps {
  initialFixtures: Fixture[];
  initialDate: string;
}

function PredictionsContentWithQueryInner({ initialFixtures, initialDate }: PredictionsContentWithQueryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    fixtures,
    isLoadingDateFixtures,
    isLoadingMore,
    hasMore,
    error,
    loadFixturesForDate,
    loadNextPage,
  } = usePredictionsWithQuery({ 
    initialFixtures
  });

  // Handle date change with URL update
  const handleDateChange = useCallback((date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', date);
    router.push(`/predictions?${params.toString()}`);
    
    // Also trigger data loading
    loadFixturesForDate(date);
  }, [router, searchParams, loadFixturesForDate]);

  // Helper functions for empty state actions
  const handleTryNextWeek = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    handleDateChange(nextWeekStr);
  }, [handleDateChange]);

  const handleTryToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    handleDateChange(today);
  }, [handleDateChange]);

  const handleRefresh = useCallback(() => {
    const currentDate = searchParams.get('date') || initialDate;
    loadFixturesForDate(currentDate);
  }, [loadFixturesForDate, searchParams, initialDate]);

  // Get current selected date
  const selectedDate = searchParams.get('date') || initialDate;

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-red-600">Error Loading Predictions</h3>
            <p className="text-gray-600">
              {error || 'An unexpected error occurred while loading fixtures.'}
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReusableFixtureDisplay
      fixtures={fixtures}
      selectedDate={selectedDate}
      isLoading={isLoadingDateFixtures}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadNextPage}
      onRefresh={handleRefresh}
      onTryNextWeek={handleTryNextWeek}
      onTryToday={handleTryToday}
      onDateChange={handleDateChange}
      variant="predictions"
      showDateHeaders={true}
      showLeagueHeaders={true}
      showEmptyState={true}
      showSearchAndFilter={true}
      searchAndFilterOptions={{
        showSearch: true,
        showLeagueFilter: true,
        showTeamFilter: true,
        showStatusFilter: true,
        showDateFilter: true,
        showPredictionsFilter: true,
        showValueBetsFilter: true,
      }}
      emptyStateTitle="No Predictions Found"
      emptyStateMessage="No fixtures with predictions found for the selected criteria. Try adjusting your filters or date range."
    />
  );
}

/**
 * Main predictions content component using React Query
 */
export function PredictionsContentWithQuery({ initialFixtures, initialDate }: PredictionsContentWithQueryProps) {
  return (
    <PredictionsContentWithQueryInner 
      initialFixtures={initialFixtures} 
      initialDate={initialDate}
    />
  );
}
