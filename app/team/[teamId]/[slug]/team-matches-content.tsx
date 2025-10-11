'use client';

import { useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixturesListWithPredictions } from '@/app/components/fixtures/FixturesListWithPredictions';
import { UnifiedDateRangeFilter } from '@/components/filters/UnifiedDateRangeFilter';
import { useTeamFixturesQuery } from '@/app/hooks/useTeamFixturesQuery';
import type { Fixture } from '@/schemas/fixture.schema';

interface TeamMatchesContentProps {
  teamId: string;
  teamName: string;
  initialFixtures?: Fixture[];
}

/**
 * Unified Matches & Predictions Component for Team Page
 * 
 * Replaces separate "Fixtures" and "Predictions" tabs with a single unified experience
 * 
 * Features:
 * - React Query for automatic caching and refetching
 * - Unified date range selector
 * - Shows both fixtures and predictions in one view
 * - Loading states and error handling
 * - Manual refresh capability
 */
export function TeamMatchesContent({ 
  teamId, 
  teamName, 
  initialFixtures = [] 
}: TeamMatchesContentProps) {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + 14); // Next 14 days
    return { start: today, end };
  });

  // Track if date range has been changed from initial state
  const [hasChangedDateRange, setHasChangedDateRange] = useState(false);
  
  // Track manual refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use React Query for automatic caching and refetching
  // Only enable query if date range has been changed (to avoid duplicate server fetch)
  const { 
    data: fixtures, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useTeamFixturesQuery({
    teamId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: hasChangedDateRange, // Only fetch when date range is changed
  });

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setHasChangedDateRange(true); // Enable React Query on date change
    // React Query will automatically refetch due to queryKey change
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (!hasChangedDateRange) {
        // If React Query hasn't been enabled yet, just reload the page
        // to get fresh server data
        window.location.reload();
        return;
      }
      
      // Otherwise, use React Query refetch
      setHasChangedDateRange(true); // Ensure React Query is enabled
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Use React Query data if available, fallback to initial fixtures
  // Only use fixtures if it's explicitly returned (not undefined)
  const displayFixtures = fixtures !== undefined ? fixtures : initialFixtures;

  // Error state
  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Error Loading Fixtures
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load fixtures'}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Loading state (only show on initial load, not on background refetch)
  if (isLoading && !displayFixtures.length) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
          </CardHeader>
        </Card>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!displayFixtures || displayFixtures.length === 0) {
    return (
      <div className="space-y-6">
        <UnifiedDateRangeFilter
          onRangeChange={handleDateRangeChange}
          syncWithURL={true}
        />
        
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Fixtures Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No fixtures found for {teamName} in the selected date range.
            </p>
            <div className="text-sm text-muted-foreground">
              Try adjusting the date range or check back later.
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with fixtures count and refresh */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Matches & Predictions
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {displayFixtures.length} fixture{displayFixtures.length !== 1 ? 's' : ''} found for {teamName}
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isFetching || isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(isFetching || isRefreshing) ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Date Range Filter */}
      <UnifiedDateRangeFilter
        onRangeChange={handleDateRangeChange}
        syncWithURL={true}
      />

      {/* Fixtures List with Predictions */}
      <FixturesListWithPredictions
        fixtures={displayFixtures}
        onRefresh={handleRefresh}
      />

      {/* Background refetch indicator */}
      {isFetching && !isLoading && displayFixtures.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Updating...</span>
        </div>
      )}
    </div>
  );
}

