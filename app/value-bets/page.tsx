import { Suspense } from 'react';
import { Metadata } from 'next';
import { sportmonks } from '@/lib/sportmonks';
import { ValueBetsClient } from './value-bets-client';
import { PredictionsSkeleton } from '../predictions/components/PredictionsSkeleton';

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
  let initialFixtures = [];
  try {
    const fixturesResponse = await sportmonks.getFixturesByDate(dateToLoad, {
      include: 'participants',
      per_page: 50,
      page: 1,
    });
    initialFixtures = fixturesResponse?.data || [];
  } catch (error) {
    console.error('Error loading initial fixtures for value bets:', error);
    // Continue without initial fixtures - client will handle loading
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <span className="text-3xl">💰</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Value Bets
            </h1>
            
            <p className="text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered betting opportunities with real-time odds comparison and expected value analysis
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <Suspense fallback={<PredictionsSkeleton />}>
            <ValueBetsClient 
              initialFixtures={initialFixtures}
              initialDate={dateToLoad}
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
} 