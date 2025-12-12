import { Suspense } from 'react';
import { Metadata } from 'next';
import { sportmonks } from '@/lib/sportmonks';
import { ValueBetsClient } from './value-bets-client';
import { PredictionsSkeleton } from '../predictions/components/PredictionsSkeleton';
import type { Fixture } from '@/schemas/fixture.schema';
import type { ValueBet } from '@/schemas/valuebet.schema';

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

  // SSR: Load fixtures for the selected date with limited include (only participants)
  let fixtures: Fixture[] = [];
  const valueBets: ValueBet[] = [];
  const valueBetFixturesMap: Map<string, Fixture> = new Map();

  try {
    // Fetch all pages of fixtures for the selected date
    // Maximum per_page is 50 without populate filter
    let currentPage = 1;
    let hasMore = true;
    const allFixtures: Fixture[] = [];
    const MAX_PAGES = 20; // Safety limit: 20 pages * 50 = 1000 fixtures max

    while (hasMore && currentPage <= MAX_PAGES) {
      try {
        const fixturesResponse = await sportmonks.getFixturesByDate(dateToLoad, {
          include: 'participants',
          per_page: 50,
          page: currentPage,
        });

        if (fixturesResponse?.data && Array.isArray(fixturesResponse.data)) {
          allFixtures.push(...fixturesResponse.data);
          
          // If we got less than per_page items, we've reached the end
          if (fixturesResponse.data.length < 50) {
            hasMore = false;
          } else {
            // Check if there are more pages according to pagination
            hasMore = fixturesResponse?.pagination?.has_more === true;
          }
        } else {
          hasMore = false; // No data means no more pages
        }

        currentPage++;
      } catch (pageError) {
        console.warn(`Error fetching fixtures page ${currentPage}:`, pageError);
        hasMore = false; // Stop pagination on error
      }
    }

    fixtures = allFixtures;

    // Fetch value bets for all fixtures in parallel using Promise.allSettled
    // This handles partial failures gracefully
    if (fixtures.length > 0) {
      const valueBetPromises = fixtures.map(async (fixture) => {
        try {
          const valueBetResponse = await sportmonks.getValueBetsByFixtureId(fixture.id.toString(), {
            include: 'fixture:name,starting_at',
          });
          
          // ApiListResponse structure: { data: ValueBet[], pagination: ... }
          if (valueBetResponse?.data && Array.isArray(valueBetResponse.data)) {
            return {
              fixture,
              valueBets: valueBetResponse.data,
            };
          }
          return null;
        } catch (error) {
          // Log but don't fail the entire page if one fixture's value bets fail
          console.warn(`Failed to fetch value bets for fixture ${fixture.id}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(valueBetPromises);
      
      // Aggregate all value bets and create fixture map
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { fixture, valueBets: fixtureValueBets } = result.value;
          fixtureValueBets.forEach((vb) => {
            valueBets.push(vb);
            valueBetFixturesMap.set(vb.fixture_id.toString(), fixture);
          });
        }
      });
    }
  } catch (error) {
    console.error('Error loading fixtures or value bets:', error);
    // Continue with empty data - client will show appropriate message
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <Suspense fallback={<PredictionsSkeleton />}>
        <ValueBetsClient 
          initialValueBets={valueBets}
          initialValueBetFixtures={Array.from(valueBetFixturesMap.entries()).map(([id, fixture]) => ({ id, fixture }))}
          initialDate={dateToLoad}
        />
      </Suspense>
    </div>
  );
} 