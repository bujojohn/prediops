import { Suspense } from 'react';
import { LatestFixturesClient } from './LatestFixturesClient';
import { sportmonks } from '@/lib/sportmonks';

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  // Get date from URL or default to today
  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams.date || new Date().toISOString().split('T')[0];
  
  // Validate date format
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
  const dateToLoad = isValidDate ? selectedDate : new Date().toISOString().split('T')[0];

  // SSR: Load fixtures for the selected date for SEO and initial page load
  let initialFixtures = [];
  try {
    const fixturesResponse = await sportmonks.getFixturesByDate(dateToLoad, {
      include: 'participants;scores;state;predictions.type;league.country;events',
      per_page: 50,
      page: 1,
    });
    initialFixtures = fixturesResponse?.data || [];
  } catch (error) {
    console.error('Error loading initial fixtures:', error);
    // Continue without initial fixtures - client will handle loading
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <Suspense fallback={<div>Loading predictions...</div>}>
        <LatestFixturesClient 
          initialFixtures={initialFixtures}
          initialDate={dateToLoad}
        />
      </Suspense>
    </div>
  );
} 