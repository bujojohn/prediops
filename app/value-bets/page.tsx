import { Suspense } from 'react';
import { Metadata } from 'next';
import { sportmonks } from '@/lib/sportmonks';
import { ValueBetsClient } from './value-bets-client';
import type { Fixture } from '@/schemas/fixture.schema';

export const metadata: Metadata = {
  title: 'Value Bets - Prediops | AI-Powered Betting Opportunities',
  description: 'Discover profitable betting opportunities with AI-powered value betting analysis. Get real-time odds comparison, expected value calculations, and risk assessment.',
  keywords: 'value betting, betting opportunities, odds comparison, expected value, betting analysis, profitable bets',
  openGraph: {
    title: 'Value Bets - Prediops',
    description: 'AI-powered value betting opportunities with real-time analysis',
    type: 'website',
  },
};

export default async function ValueBetsPage({
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

  // SSR: Load fixtures for the selected date using same API as predictions page
  // Value bet data will be determined client-side from fixture predictions/odds
  let initialFixtures: Fixture[] = [];
  try {
    const fixturesResponse = await sportmonks.getFixturesByDate(dateToLoad, {
      include: 'participants;scores;state;predictions.type;league.country;events',
      per_page: 100,
      page: 1,
    });
    initialFixtures = fixturesResponse?.data || [];
  } catch (error) {
    console.error('Error loading initial fixtures for value bets:', error);
    // Continue without initial fixtures - client will handle loading
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <Suspense fallback={
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <ValueBetsClient 
          initialFixtures={initialFixtures}
          initialDate={dateToLoad}
        />
      </Suspense>
    </div>
  );
} 