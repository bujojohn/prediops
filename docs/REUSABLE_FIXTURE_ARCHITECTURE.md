# Reusable Fixture Architecture

This document outlines the reusable fixture display architecture that follows the Single Responsibility Principle and can be used across different contexts in the application.

## Overview

The architecture consists of several layers of reusable components and hooks that can be composed together to create fixture displays for different use cases:

- **Predictions Page** - Date-based fixture filtering with predictions
- **League Pages** - League-specific fixtures with season filtering
- **Team Pages** - Team-specific fixtures with upcoming/recent separation
- **Live Matches** - Real-time fixture updates
- **Any other fixture display needs**

## Architecture Layers

### 1. Core Utilities (`app/predictions/utils/grouping-utils.ts`)

Generic utility functions for fixture grouping:

```typescript
// Groups fixtures by date
export function groupByDate(fixtures: Fixture[]): FixtureGroup[]

// Groups fixtures by league
export function groupByLeague(fixtures: Fixture[]): FixtureGroup[]

// Determines initial collapsed state based on selected date
export function getInitialCollapsedDates(groups: FixtureGroup[], selectedDate: string): Set<string>
```

### 2. Generic Fixture Management Hook (`app/hooks/useFixtureManagement.ts`)

Base hook that provides generic fixture management functionality:

```typescript
interface UseFixtureManagementOptions {
  initialFixtures?: Fixture[];
  apiEndpoint?: string;
  enableInfiniteScroll?: boolean;
  enableDateFiltering?: boolean;
  pageSize?: number;
}

interface UseFixtureManagementReturn {
  fixtures: Fixture[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadFixtures: (params?: Record<string, any>) => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadFixturesForDate: (date: string) => Promise<void>;
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>;
  clearError: () => void;
}
```

### 3. Specialized Hooks

#### Predictions Hook (`app/predictions/hooks/usePredictionsWithQuery.ts`)
Extends the generic hook for predictions-specific functionality:
- Larger page sizes (100 fixtures)
- Enhanced error handling
- Predictions-specific API endpoints

#### Team Fixtures Hook (`app/hooks/useTeamFixtures.ts`)
Provides team-specific functionality:
- Upcoming vs recent fixture separation
- Team-specific API endpoints
- Fixture categorization

#### League Fixtures Hook (`app/hooks/useLeagueFixtures.ts`)
Provides league-specific functionality:
- Season filtering
- League-specific API endpoints
- Fixture categorization

### 4. Reusable Display Component (`app/components/fixtures/ReusableFixtureDisplay.tsx`)

The core reusable component that handles all fixture display logic:

```typescript
interface ReusableFixtureDisplayProps {
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
  
  // Custom empty state messages
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateActions?: React.ReactNode;
  
  // Custom grouping
  customGrouping?: (fixtures: Fixture[]) => FixtureGroup[];
  
  // Custom header renderer
  renderCustomHeader?: (args: { group: FixtureGroup; collapsed: boolean; toggle: () => void; count: number }) => React.ReactNode;
}
```

### 5. Specialized Display Components

#### Team Fixtures Display (`app/components/team/TeamFixturesDisplay.tsx`)
Team-specific wrapper around the reusable component:
- Custom empty states for teams
- Team-specific error handling
- Configurable display variants (overview, detailed, compact)

#### League Fixtures Display (`app/components/league/LeagueFixturesDisplay.tsx`)
League-specific wrapper around the reusable component:
- Custom empty states for leagues
- League-specific error handling
- Configurable display variants

## Usage Examples

### Predictions Page
```typescript
import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { usePredictionsWithQuery } from '@/app/predictions/hooks/usePredictionsWithQuery';

function PredictionsContent({ initialFixtures }) {
  const { fixtures, isLoadingDateFixtures, isLoadingMore, hasMore, loadFixturesForDate, loadNextPage } = usePredictionsWithQuery({ initialFixtures });

  return (
    <ReusableFixtureDisplay
      fixtures={fixtures}
      isLoading={isLoadingDateFixtures}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadNextPage}
      variant="predictions"
      showDateHeaders={true}
      showLeagueHeaders={true}
      showEmptyState={true}
      compact={false}
    />
  );
}
```

### Team Page
```typescript
import { TeamFixturesDisplay } from '@/app/components/team/TeamFixturesDisplay';

function TeamDetailPage({ teamId, initialFixtures }) {
  return (
    <TeamFixturesDisplay
      teamId={teamId}
      initialFixtures={initialFixtures}
      variant="detailed"
    />
  );
}
```

### League Page
```typescript
import { LeagueFixturesDisplay } from '@/app/components/league/LeagueFixturesDisplay';

function LeagueDetailPage({ leagueId, seasonId, initialFixtures }) {
  return (
    <LeagueFixturesDisplay
      leagueId={leagueId}
      seasonId={seasonId}
      initialFixtures={initialFixtures}
      variant="overview"
    />
  );
}
```

## Benefits

### 1. Single Responsibility Principle
- Each component has a single, well-defined responsibility
- Easy to test and maintain
- Clear separation of concerns

### 2. Maximum Reusability
- Core components can be used across different contexts
- Specialized hooks extend base functionality
- Customizable display options for different use cases

### 3. Consistent User Experience
- Same interaction patterns across all fixture displays
- Consistent loading states and error handling
- Unified empty state handling

### 4. Performance Optimization
- Shared optimization logic (memoization, virtualization)
- Efficient data fetching patterns
- Optimized re-rendering strategies

### 5. Easy Extension
- New variants can be added easily
- Custom grouping strategies supported
- Flexible header rendering

## Migration Guide

### From Old Predictions Components
1. Replace `FixturesDisplay` with `ReusableFixtureDisplay`
2. Update props to match new interface
3. Use `usePredictionsWithQuery` instead of `usePredictions`

### For New Implementations
1. Choose appropriate specialized hook (team, league, etc.)
2. Use corresponding specialized display component
3. Configure display options based on use case

## Future Enhancements

1. **Virtual Scrolling** - For large fixture lists
2. **Advanced Filtering** - League, team, date range filters
3. **Real-time Updates** - WebSocket integration for live matches
4. **Caching Strategies** - Improved data caching and invalidation
5. **Accessibility** - Enhanced ARIA support and keyboard navigation
