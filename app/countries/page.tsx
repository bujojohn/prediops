import { Suspense } from 'react';
import { CountriesClient } from './countries-client';
import { CountriesLoading } from './loading';
import { sportmonks } from '@/lib/sportmonks';

export default async function CountriesPage() {
  // SSR: Load today's fixtures for SEO and initial page load
  let initialFixtures = [];
  try {
    const today = new Date().toISOString().split('T')[0];
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
      include: 'participants;scores;state;league.country',
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🌍 Countries & Leagues
        </h1>
        <p className="text-lg text-gray-600">
          Browse football leagues by country and view fixtures for any date
        </p>
      </div>

      <Suspense fallback={<CountriesLoading />}>
        <CountriesClient initialFixtures={initialFixtures} />
      </Suspense>
    </div>
  );
}
