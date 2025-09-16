'use client';

import { Suspense, lazy } from 'react';
import { LoadingIndicator } from '@/app/components/ui/loading-indicator';

// Pre-configured lazy loaders for common components
export const LazyFixtureCard = lazy(() => import('@/app/components/fixtures/FixtureCard').then(module => ({ default: module.FixtureCard })));

export const LazyPredictionMarkets = lazy(() => import('@/app/components/fixtures/PredictionMarkets').then(module => ({ default: module.PredictionMarkets })));

export const LazySidebar = lazy(() => import('@/app/components/navigation/Sidebar'));

// Wrapper components with Suspense
export function SuspenseWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <Suspense fallback={fallback || <LoadingIndicator size="md" />}>
      {children}
    </Suspense>
  );
}
