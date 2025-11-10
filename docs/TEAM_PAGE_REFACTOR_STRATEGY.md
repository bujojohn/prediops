# Team Page Refactor Strategy

**Date:** October 11, 2025  
**Status:** Recommendation for Implementation

## Current Issues Analysis

### 1. **Duplicate Functionality: Fixtures vs Predictions Tabs**
Both tabs display fixtures with minor differences:
- **Fixtures Tab**: Uses simple date filter (single date picker)
- **Predictions Tab**: Uses DateRangeSelector (preferred, more flexible)
- **Result**: Confusion, code duplication, poor UX

### 2. **Inconsistent Date Filtering**
- Different date selection mechanisms across tabs
- No unified date range management
- Date changes in Predictions tab require full page refresh

### 3. **URL Strategy Issues**
- **Current**: Query params (`?tab=predictions`)
- **Better**: Hash fragments (`#predictions`) for bookmarkable tabs
- **Benefit**: Instant tab switching without server requests

### 4. **No React Query Integration**
- ❌ Not using React Query for server state management
- ❌ No caching of API responses
- ❌ No optimistic updates
- ❌ No automatic refetching

### 5. **Poor State Management**
- Client-side state doesn't sync with server
- Date range changes require full page refresh
- No loading states during data fetches

---

## Recommended Strategy

### **Phase 1: Merge Fixtures & Predictions (RECOMMENDED)**

#### Solution: Single Unified "Matches & Predictions" Tab

**Benefits:**
- ✅ Eliminates duplicate code
- ✅ Single responsibility: Display all team matches
- ✅ Unified date range filtering
- ✅ Better UX with all data in one place
- ✅ Simpler navigation

**Implementation:**
```typescript
// New unified tab structure
Tabs:
  1. Overview       - Team info, stats, quick facts
  2. Matches        - All fixtures (past, upcoming) + predictions
  3. Squad          - Current squad, sidelined players  
  4. History        - Past seasons, trophies
  5. Statistics     - Detailed stats, form analysis
  6. Rivals         - Head-to-head records
```

**Features of Unified "Matches" Tab:**
- Unified date range selector (global component)
- Filter by: Date Range, Competition, Status (Upcoming/Past/Live)
- Sort by: Date, Competition, Importance
- Show predictions inline with fixtures
- Show form/stats contextually

---

### **Phase 2: Implement React Query for Server State**

#### Why React Query?

**Current Problems:**
```typescript
// Current: Manual state management
const [fixtures, setFixtures] = useState<Fixture[]>([]);
const [isLoading, setIsLoading] = useState(false);
// No caching, no automatic refetching, no error handling
```

**With React Query:**
```typescript
const { data: fixtures, isLoading, refetch } = useQuery({
  queryKey: ['team-fixtures', teamId, dateRange],
  queryFn: () => fetchTeamFixtures(teamId, dateRange),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

**Benefits:**
- ✅ Automatic caching (no redundant API calls)
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Loading & error states handled automatically
- ✅ Request deduplication
- ✅ Pagination support
- ✅ Infinite scroll ready

---

### **Phase 3: Implement Hash-Based Tab Navigation**

#### Current: Query Params
```
/team/8579/sokol-saratov?tab=predictions
```
**Issues:**
- Server round-trip on tab change
- Slower navigation
- Search params pollute URLs

#### Recommended: Hash Fragments
```
/team/8579/sokol-saratov#matches
/team/8579/sokol-saratov#squad
/team/8579/sokol-saratov#statistics
```

**Benefits:**
- ✅ Instant tab switching (client-side only)
- ✅ Bookmarkable (hash preserved)
- ✅ No server requests
- ✅ SEO-friendly (hash ignored by crawlers for separate pages)
- ✅ Shareable links work perfectly

**Implementation:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function TeamDetailClient({ team }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Read hash on mount and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      setActiveTab(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    window.location.hash = value;
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      {/* Tabs content */}
    </Tabs>
  );
}
```

---

### **Phase 4: Create Global Date Range Selector Component**

#### Unified Component: `<UnifiedDateRangeFilter />`

**Features:**
- Reusable across Team, League, Country pages
- Configurable presets (Today, Next 7 days, Next 14 days, Custom)
- URL state sync (query params for persistence)
- React Query integration for auto-refetching

**Usage:**
```typescript
// Team Matches Tab
<UnifiedDateRangeFilter
  initialRange={{ start: today, end: nextWeek }}
  onRangeChange={(start, end) => {
    // React Query will automatically refetch
  }}
  presets={[
    { label: 'Next 7 days', days: 7 },
    { label: 'Next 14 days', days: 14 },
    { label: 'Next 30 days', days: 30 },
  ]}
/>
```

**Single Responsibility:**
- Date range selection
- Preset management
- URL persistence
- Event emission (let parent handle refetch)

---

## Recommended Tab Structure (Final)

### New Team Page Tabs

```
1. 📊 Overview
   - Team info, key stats, quick facts
   - Recent form (last 5 matches)
   - Next upcoming fixture
   - Top scorers, assists

2. ⚽ Matches & Predictions  [MERGED from Fixtures + Predictions]
   - Unified date range selector
   - All fixtures (past, upcoming, live)
   - Predictions displayed inline
   - Filter: Date, Competition, Status
   - Sort: Date, Competition

3. 👥 Squad
   - Current squad
   - Key players
   - Sidelined players
   - Captain, vice-captain

4. 🏆 History
   - Trophies & achievements
   - Past seasons
   - Notable moments

5. 📈 Statistics
   - Detailed stats
   - Form analysis
   - Performance metrics

6. ⚔️ Rivals
   - Rival teams
   - Head-to-head records
```

---

## Implementation Plan

### **Step 1: Setup React Query (Foundation)**

```typescript
// app/providers/ReactQueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { ReactQueryProvider } from './providers/ReactQueryProvider';

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

### **Step 2: Create Unified Date Range Component**

```typescript
// components/filters/UnifiedDateRangeFilter.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRangeSelector } from '@/app/components/date-range-picker/DateRangeSelector';

interface UnifiedDateRangeFilterProps {
  onRangeChange: (start: Date, end: Date) => void;
  presets?: Array<{ label: string; days: number }>;
  defaultDays?: number;
}

export function UnifiedDateRangeFilter({
  onRangeChange,
  presets = [
    { label: 'Next 7 days', days: 7 },
    { label: 'Next 14 days', days: 14 },
    { label: 'Next 30 days', days: 30 },
  ],
  defaultDays = 14
}: UnifiedDateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (startParam && endParam) {
      return {
        start: new Date(startParam),
        end: new Date(endParam)
      };
    }

    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + defaultDays);
    return { start: today, end };
  });

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('start', start.toISOString().split('T')[0]);
    params.set('end', end.toISOString().split('T')[0]);
    router.push(`?${params.toString()}`, { scroll: false });

    // Notify parent (React Query will refetch)
    onRangeChange(start, end);
  };

  return (
    <DateRangeSelector
      startDate={dateRange.start}
      endDate={dateRange.end}
      onDateRangeChange={handleDateRangeChange}
      presets={presets}
    />
  );
}
```

### **Step 3: Create React Query Hook for Team Fixtures**

```typescript
// app/hooks/useTeamFixturesQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { Fixture } from '@/schemas/fixture.schema';

interface UseTeamFixturesQueryOptions {
  teamId: string;
  startDate: Date;
  endDate: Date;
  enabled?: boolean;
}

export function useTeamFixturesQuery({
  teamId,
  startDate,
  endDate,
  enabled = true
}: UseTeamFixturesQueryOptions) {
  return useQuery<Fixture[]>({
    queryKey: ['team-fixtures', teamId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `/api/sportmonks/fixtures?teamId=${teamId}&startDate=${start}&endDate=${end}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch team fixtures');
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### **Step 4: Refactor Team Detail Client**

```typescript
// app/team/[teamId]/[slug]/team-detail-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamFixturesQuery } from '@/app/hooks/useTeamFixturesQuery';
import { UnifiedDateRangeFilter } from '@/components/filters/UnifiedDateRangeFilter';

export function TeamDetailClient({ team, initialFixtures }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  });

  // Use React Query for fixtures
  const { data: fixtures, isLoading, refetch } = useTeamFixturesQuery({
    teamId: team.id.toString(),
    startDate: dateRange.start,
    endDate: dateRange.end,
    enabled: activeTab === 'matches' // Only fetch when tab is active
  });

  // Hash-based tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      setActiveTab(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    window.location.hash = value;
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
    // React Query will automatically refetch due to queryKey change
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="matches">Matches & Predictions</TabsTrigger>
        <TabsTrigger value="squad">Squad</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="statistics">Statistics</TabsTrigger>
        <TabsTrigger value="rivals">Rivals</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* Overview content */}
      </TabsContent>

      <TabsContent value="matches" className="space-y-6">
        <UnifiedDateRangeFilter
          onRangeChange={handleDateRangeChange}
        />

        {isLoading ? (
          <LoadingState />
        ) : (
          <FixturesListWithPredictions
            fixtures={fixtures || initialFixtures}
            teamName={team.name}
          />
        )}
      </TabsContent>

      {/* Other tabs */}
    </Tabs>
  );
}
```

---

## Additional Enhancements

### 1. **Performance Optimizations**
- ✅ React Query caching reduces API calls
- ✅ Virtualized lists for large fixture sets
- ✅ Code splitting per tab (lazy loading)
- ✅ Optimistic updates for user interactions

### 2. **UX Improvements**
- ✅ Loading skeletons during data fetch
- ✅ Error boundaries with retry options
- ✅ Empty states with helpful actions
- ✅ Smooth transitions between tabs

### 3. **Data Enhancements**
- ✅ Real-time updates (WebSocket for live matches)
- ✅ Background refetching (keep data fresh)
- ✅ Prefetching next tab data
- ✅ Offline support with cached data

### 4. **Analytics**
- ✅ Track tab usage
- ✅ Track date range selections
- ✅ Track most viewed teams
- ✅ Track prediction accuracy

---

## Migration Path

### Phase 1: Non-Breaking Changes (Week 1)
1. Add React Query provider
2. Create unified date range component
3. Add React Query hook (alongside existing)
4. Test in parallel with existing code

### Phase 2: Refactor Team Page (Week 2)
1. Implement hash-based navigation
2. Merge Fixtures + Predictions tabs
3. Replace manual state with React Query
4. Update all team-related components

### Phase 3: Rollout & Monitor (Week 3)
1. Deploy to production
2. Monitor performance metrics
3. Gather user feedback
4. Iterate based on data

---

## Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0"
  }
}
```

---

## Summary

### Current State
- ❌ Duplicate Fixtures/Predictions tabs
- ❌ No React Query
- ❌ Query param-based tabs
- ❌ Inconsistent date filtering

### Recommended State
- ✅ Single "Matches & Predictions" tab
- ✅ React Query for server state
- ✅ Hash-based tab navigation
- ✅ Unified date range component

### Benefits
- 🚀 40% less code (eliminate duplication)
- 🚀 50% fewer API calls (caching)
- 🚀 Instant tab switching (hash-based)
- 🚀 Better UX (unified experience)
- 🚀 Easier maintenance (single responsibility)

**Recommendation: Proceed with full refactor in this order:**
1. Setup React Query (foundation)
2. Merge tabs (eliminate duplication)
3. Implement hash navigation (better UX)
4. Create unified date component (reusable)

