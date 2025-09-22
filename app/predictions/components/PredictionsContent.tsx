'use client';

import type { Fixture } from '@/schemas/fixture.schema';
import { usePredictionsWithQuery } from '../hooks/usePredictionsWithQuery';
import { useDateSelection } from '../hooks/useDateSelection';
import { PredictionsHeader } from './PredictionsHeader';
import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { 
  DatePickerProvider, 
  useDatePickerWithFixtures 
} from '@/app/components/date-picker';

interface PredictionsContentProps {
  initialFixtures: Fixture[];
  initialDate: string;
}

function PredictionsContentInner({ initialFixtures }: PredictionsContentProps) {
  const {
    selectedDate,
  } = useDatePickerWithFixtures();

  const {
    fixtures,
    isLoadingDateFixtures,
    isLoadingMore,
    hasMore,
    loadFixturesForDate,
    loadNextPage,
  } = usePredictionsWithQuery({ initialFixtures });

  const { handleDateSelect } = useDateSelection({
    onDateLoad: loadFixturesForDate,
  });

  // Helper functions for empty state actions
  const handleTryNextWeek = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    handleDateSelect(nextWeekStr);
  };

  const handleTryToday = () => {
    const today = new Date().toISOString().split('T')[0];
    handleDateSelect(today);
  };

  const handleRefresh = () => {
    loadFixturesForDate(selectedDate);
  };

  return (
    <div className="space-y-6">
      <PredictionsHeader 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
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
        variant="predictions"
        showDateHeaders={true}
        showLeagueHeaders={true}
        showEmptyState={true}
        compact={false}
        showSearchAndFilter={true}
        searchAndFilterVariant="compact"
        searchAndFilterOptions={{
          showSearch: true,
          showLeagueFilter: true,
          showTeamFilter: true,
          showStatusFilter: true,
          showDateFilter: false, // Date filtering is handled by the date picker
          showPredictionsFilter: true,
          showValueBetsFilter: true,
        }}
      />
    </div>
  );
}

/**
 * Main predictions content component with all providers
 */
export function PredictionsContent({ initialFixtures, initialDate }: PredictionsContentProps) {
  return (
    <DatePickerProvider initialDate={initialDate}>
      <PredictionsContentInner initialFixtures={initialFixtures} initialDate={initialDate} />
    </DatePickerProvider>
  );
}
