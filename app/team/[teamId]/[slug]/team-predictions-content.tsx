'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixturesListWithPredictions } from '@/app/components/fixtures/FixturesListWithPredictions';
import { DateRangeSelector } from '@/app/components/date-range-picker/DateRangeSelector';
import type { Fixture } from '@/schemas/fixture.schema';

interface TeamPredictionsContentProps {
  teamName: string;
  initialFixtures?: Fixture[];
}


export function TeamPredictionsContent({ teamName, initialFixtures = [] }: TeamPredictionsContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14); // Next 14 days
    return { start: today, end: endDate };
  });


  // Note: loadFixtures is removed since we can't make API calls from client-side
  // All fixtures data comes from server-side initial props


  // Note: No client-side loading since all data comes from server-side props


  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate });
    
    // Show message that page refresh is needed for new date range
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    setError(`To view fixtures for the selected ${days} day${days !== 1 ? 's' : ''}, please refresh the page. This will load fixtures from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}.`);
  };


  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Date Range Changed
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </div>
      </Card>
    );
  }

  if (initialFixtures.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No Upcoming Fixtures
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No fixtures found for {teamName} in the selected date range.
          </p>
          <div className="text-sm text-muted-foreground">
            Use the date range selector above to view fixtures for different periods.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Fixtures & Predictions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {initialFixtures.length} fixture{initialFixtures.length !== 1 ? 's' : ''} found for {teamName}
            </p>
          </CardHeader>
        </Card>
        
        <DateRangeSelector
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateRangeChange={handleDateRangeChange}
          maxDays={30}
        />
      </div>

      {/* Fixtures list with predictions */}
      <FixturesListWithPredictions
        fixtures={initialFixtures}
        title={teamName}
        compact={false}
      />
    </div>
  );
}
