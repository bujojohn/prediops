'use client';

import type { Fixture } from '@/schemas/fixture.schema';
import { usePredictionsWithQuery } from '../hooks/usePredictionsWithQuery';
import { useDateSelection } from '../hooks/useDateSelection';
import { PredictionsHeader } from './PredictionsHeader';
import { FixturesDisplay } from './FixturesDisplay';
import { 
  DatePickerProvider, 
  useDatePickerWithFixtures 
} from '@/app/components/date-picker';

interface PredictionsContentWithQueryProps {
  initialFixtures: Fixture[];
  initialDate: string;
}

function PredictionsContentWithQueryInner({ initialFixtures }: PredictionsContentWithQueryProps) {
  const {
    selectedDate,
  } = useDatePickerWithFixtures();

  const {
    fixtures,
    isLoading,
    isError,
    error,
    refetch,
  } = usePredictionsWithQuery({ 
    initialFixtures, 
    selectedDate 
  });

  const { handleDateSelect } = useDateSelection({
    onDateLoad: async () => {
      // React Query will automatically refetch when the date changes
      // due to the query key dependency
    },
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
    refetch();
  };

  // Handle error state
  if (isError) {
    return (
      <div className="space-y-6">
        <PredictionsHeader 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        
        <div className="p-8 text-center">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-red-600">Error Loading Predictions</h3>
            <p className="text-gray-600">
              {error?.message || 'An unexpected error occurred while loading fixtures.'}
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
    <div className="space-y-6">
      <PredictionsHeader 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
      <FixturesDisplay
        fixtures={fixtures}
        selectedDate={selectedDate}
        isLoadingDateFixtures={isLoading}
        isLoadingMore={false} // React Query handles pagination differently
        hasMore={false} // For now, we'll use date-based loading
        onLoadMore={() => {}} // Not needed with React Query approach
        onRefresh={handleRefresh}
        onTryNextWeek={handleTryNextWeek}
        onTryToday={handleTryToday}
      />
    </div>
  );
}

/**
 * Main predictions content component using React Query
 */
export function PredictionsContentWithQuery({ initialFixtures, initialDate }: PredictionsContentWithQueryProps) {
  return (
    <DatePickerProvider initialDate={initialDate}>
      <PredictionsContentWithQueryInner 
        initialFixtures={initialFixtures} 
        initialDate={initialDate}
      />
    </DatePickerProvider>
  );
}
