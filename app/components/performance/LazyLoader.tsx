'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { LoadingIndicator } from '@/app/components/ui/loading-indicator';

interface LazyLoaderProps {
  fallback?: React.ReactNode;
}

// Generic lazy loader component
export function createLazyLoader<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyLoader(props: React.ComponentProps<T> & LazyLoaderProps) {
    return (
      <Suspense fallback={fallback || <LoadingIndicator size="md" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy loaders for common components
export const LazyFixtureCard = createLazyLoader(
  () => import('@/app/components/fixtures/FixtureCard'),
  <div className="animate-pulse bg-gray-200 h-20 rounded" />
);

export const LazyPredictionMarkets = createLazyLoader(
  () => import('@/app/components/fixtures/PredictionMarkets'),
  <div className="animate-pulse bg-gray-200 h-12 rounded" />
);

export const LazySidebar = createLazyLoader(
  () => import('@/app/components/navigation/Sidebar'),
  <div className="animate-pulse bg-gray-200 h-full w-64" />
);
