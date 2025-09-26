'use client';

import React, { memo } from 'react';
import { useResponsiveDesign } from '@/app/hooks/useResponsiveDesign';
import { OptimizedReusableFixtureDisplay } from './OptimizedReusableFixtureDisplay';
import type { Fixture } from '@/schemas/fixture.schema';
import type { FixtureFilters } from './fixture-search-utils';

export interface ResponsiveFixtureDisplayProps {
  fixtures: Fixture[];
  selectedDate?: string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onTryNextWeek?: () => void;
  onTryToday?: () => void;
  
  // Display options
  variant?: 'predictions' | 'league' | 'team' | 'live';
  showDateHeaders?: boolean;
  showLeagueHeaders?: boolean;
  showEmptyState?: boolean;
  compact?: boolean;
  useVirtualScrolling?: boolean;
  virtualScrollingThreshold?: number;
  
  // Search and filter options
  showSearchAndFilter?: boolean;
  searchAndFilterVariant?: 'compact' | 'full' | 'auto';
  initialFilters?: Partial<FixtureFilters>;
  searchAndFilterOptions?: {
    showSearch?: boolean;
    showLeagueFilter?: boolean;
    showTeamFilter?: boolean;
    showStatusFilter?: boolean;
    showDateFilter?: boolean;
    showPredictionsFilter?: boolean;
    showValueBetsFilter?: boolean;
  };
  
  // Custom empty state messages
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateActions?: React.ReactNode;
  
  // Event handlers
  onPredictionClick?: (fixture: Fixture) => void;
  onValueBetClick?: (fixture: Fixture) => void;
}

/**
 * Responsive fixture display that automatically switches between:
 * - Desktop: OptimizedReusableFixtureDisplay with virtual scrolling
 * - Mobile: Mobile-optimized version with touch-friendly interactions
 * - Tablet: Hybrid approach with some mobile optimizations
 */
export const ResponsiveFixtureDisplay = memo<ResponsiveFixtureDisplayProps>(({
  fixtures,
  selectedDate,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onTryNextWeek,
  onTryToday,
  variant = 'predictions',
  showDateHeaders = true,
  showLeagueHeaders = true,
  showEmptyState = true,
  compact = false,
  useVirtualScrolling = true,
  virtualScrollingThreshold = 50,
  showSearchAndFilter = true,
  searchAndFilterVariant = 'auto',
  initialFilters,
  searchAndFilterOptions,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateActions,
  onPredictionClick,
  onValueBetClick,
}) => {
  const { isMobile, isTablet } = useResponsiveDesign();

  // Determine the best variant based on screen size
  const effectiveSearchAndFilterVariant = React.useMemo(() => {
    if (searchAndFilterVariant === 'auto') {
      return isMobile ? 'compact' : isTablet ? 'compact' : 'full';
    }
    return searchAndFilterVariant;
  }, [searchAndFilterVariant, isMobile, isTablet]);

  // Adjust virtual scrolling threshold based on device
  const effectiveVirtualScrollingThreshold = React.useMemo(() => {
    if (isMobile) {
      return Math.min(virtualScrollingThreshold, 30); // Lower threshold for mobile
    }
    if (isTablet) {
      return Math.min(virtualScrollingThreshold, 40); // Medium threshold for tablet
    }
    return virtualScrollingThreshold; // Full threshold for desktop
  }, [isMobile, isTablet, virtualScrollingThreshold]);

  // Determine if we should use virtual scrolling
  const shouldUseVirtualScrolling = React.useMemo(() => {
    return useVirtualScrolling && fixtures.length > effectiveVirtualScrollingThreshold;
  }, [useVirtualScrolling, fixtures.length, effectiveVirtualScrollingThreshold]);

  // Adjust compact mode based on device
  const effectiveCompact = React.useMemo(() => {
    if (isMobile) {
      return true; // Always compact on mobile
    }
    if (isTablet) {
      return compact; // Use provided compact setting on tablet
    }
    return compact; // Use provided compact setting on desktop
  }, [isMobile, isTablet, compact]);


  // Use OptimizedReusableFixtureDisplay for all devices
  // It handles responsive behavior internally
  return (
    <OptimizedReusableFixtureDisplay
      fixtures={fixtures}
      selectedDate={selectedDate}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      onTryNextWeek={onTryNextWeek}
      onTryToday={onTryToday}
      variant={variant}
      showDateHeaders={showDateHeaders}
      showLeagueHeaders={showLeagueHeaders}
      showEmptyState={showEmptyState}
      compact={effectiveCompact}
      useVirtualScrolling={shouldUseVirtualScrolling}
      virtualScrollingThreshold={effectiveVirtualScrollingThreshold}
      showSearchAndFilter={showSearchAndFilter}
      searchAndFilterVariant={effectiveSearchAndFilterVariant}
      initialFilters={initialFilters}
      searchAndFilterOptions={searchAndFilterOptions}
      emptyStateTitle={emptyStateTitle}
      emptyStateMessage={emptyStateMessage}
      emptyStateActions={emptyStateActions}
      onPredictionClick={onPredictionClick}
      onValueBetClick={onValueBetClick}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  return (
    prevProps.fixtures.length === nextProps.fixtures.length &&
    prevProps.fixtures[0]?.id === nextProps.fixtures[0]?.id &&
    prevProps.selectedDate === nextProps.selectedDate &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isLoadingMore === nextProps.isLoadingMore &&
    prevProps.hasMore === nextProps.hasMore &&
    prevProps.compact === nextProps.compact &&
    prevProps.showSearchAndFilter === nextProps.showSearchAndFilter &&
    prevProps.searchAndFilterVariant === nextProps.searchAndFilterVariant
  );
});

ResponsiveFixtureDisplay.displayName = 'ResponsiveFixtureDisplay';
