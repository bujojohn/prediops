import { Suspense } from 'react';
import { LatestFixturesClient } from './LatestFixturesClient';
import { sportmonks } from '@/lib/sportmonks';

export default async function PredictionsPage() {
  // SSR: Load today's fixtures for SEO and initial page load
  let initialFixtures = [];
  try {
    const today = new Date().toISOString().split('T')[0];
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
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
    <div className="container mx-auto p-6">
  
      <Suspense fallback={<div>Loading predictions...</div>}>
        <LatestFixturesClient initialFixtures={initialFixtures} />
      </Suspense>
    </div>
  );
} 