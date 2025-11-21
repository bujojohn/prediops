# Value Bet Page Refactoring Strategy

## Overview
This document outlines a comprehensive refactoring strategy for the Value Bet page to improve code organization, maintainability, performance, and user experience.

## Current Issues

### 1. **Code Duplication**
- Statistics calculation duplicated between `page.tsx` (server) and `value-bets-client.tsx` (client)
- Same logic repeated in multiple places

### 2. **Separation of Concerns**
- Business logic mixed with UI components
- Filtering/sorting logic embedded in component
- No clear separation between data transformation and presentation

### 3. **Missing Data Integration**
- `ValueBetCard` requires fixture data (name, starting_at, participants) but receives incomplete props
- No mechanism to fetch and attach fixture details to value bets

### 4. **No Custom Hooks**
- Filtering and sorting logic directly in component
- Could benefit from reusable `useValueBetFilters` hook similar to `useFixtureSearchAndFilter`

### 5. **State Management**
- Client-side state only (no URL state management)
- Filters/search not shareable via URL
- Browser back/forward doesn't work with filters

### 6. **Error Handling & Loading States**
- No loading states during data fetching
- Limited error handling
- No graceful degradation

### 7. **Performance**
- No memoization for expensive calculations
- Could benefit from virtualization for large lists
- No pagination or infinite scroll

### 8. **Component Structure**
- Large monolithic client component (270+ lines)
- Hero section should be separate component
- Stats section could be reusable component

## Refactoring Plan

### Phase 1: Extract Business Logic & Utilities

#### 1.1 Create Statistics Utility
**File**: `lib/utils/value-bet-utils.ts`
```typescript
export interface ValueBetStats {
  totalBets: number;
  valueBetsCount: number;
  highValueBets: number;
  averageValue: number;
}

export function calculateValueBetStats(valueBets: ValueBet[]): ValueBetStats {
  // Centralized statistics calculation. Stats not available 
}
```

#### 1.2 Create Filtering/Sorting Utilities
**File**: `lib/utils/value-bet-utils.ts`
```typescript
export type ValueBetFilter = 'all' | 'value' | 'high-value';
export type ValueBetSortBy = 'value' | 'odds' | 'stake';
export type SortOrder = 'asc' | 'desc';

export interface ValueBetFilters {
  searchQuery: string;
  filterValue: ValueBetFilter;
  sortBy: ValueBetSortBy;
  sortOrder: SortOrder;
}

export function filterValueBets(
  valueBets: ValueBet[],
  filters: ValueBetFilters
): ValueBet[]
```

### Phase 2: Create Custom Hooks

#### 2.1 Value Bet Filters Hook
**File**: `app/hooks/useValueBetFilters.ts`
```typescript
export function useValueBetFilters(
  valueBets: ValueBet[],
  options?: {
    enableUrlState?: boolean;
    defaultFilters?: Partial<ValueBetFilters>;
  }
): {
  filters: ValueBetFilters;
  filteredValueBets: ValueBet[];
  updateFilter: (key: keyof ValueBetFilters, value: unknown) => void;
  clearFilters: () => void;
  stats: ValueBetStats;
}
```

**Features:**
- URL state management using `useSearchParams`
- Debounced search
- Memoized filtering/sorting
- Filter statistics

#### 2.2 Value Bet Statistics Hook (Optional)
**File**: `app/hooks/useValueBetStats.ts`
```typescript
export function useValueBetStats(valueBets: ValueBet[]): ValueBetStats {
  // Memoized statistics calculation
}
```

### Phase 3: Component Extraction

#### 3.1 Hero Section Component
**File**: `app/value-bets/components/ValueBetHero.tsx`
```typescript
interface ValueBetHeroProps {
  stats: ValueBetStats;
}

export function ValueBetHero({ stats }: ValueBetHeroProps) {
  // Extracted hero section with stats
}
```

#### 3.2 Statistics Cards Component
**File**: `app/value-bets/components/ValueBetStatsCards.tsx`
```typescript
interface ValueBetStatsCardsProps {
  stats: ValueBetStats;
  variant?: 'hero' | 'summary';
}

export function ValueBetStatsCards({ stats, variant = 'hero' }: ValueBetStatsCardsProps) {
  // Reusable stats display component
}
```

#### 3.3 Filters Component
**File**: `app/value-bets/components/ValueBetFilters.tsx`
```typescript
interface ValueBetFiltersProps {
  filters: ValueBetFilters;
  onFilterChange: (key: keyof ValueBetFilters, value: unknown) => void;
  stats: ValueBetStats;
}

export function ValueBetFilters({ filters, onFilterChange, stats }: ValueBetFiltersProps) {
  // Extracted filters UI
}
```

#### 3.4 Empty State Component
**File**: `app/value-bets/components/ValueBetEmptyState.tsx`
```typescript
interface ValueBetEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ValueBetEmptyState({ hasActiveFilters, onClearFilters }: ValueBetEmptyStateProps) {
  // Extracted empty state
}
```

### Phase 4: Enhance ValueBetCard

#### 4.1 Fetch Fixture Data
**Update**: `app/value-bets/page.tsx`
```typescript
// Fetch fixtures for value bets that have fixture_id
const fixtureIds = valueBets.data.map(vb => vb.fixture_id);
const fixturesData = await Promise.allSettled(
  fixtureIds.map(id => sportmonks.getFixturesById(id.toString(), {
    include: 'participants;scores;state'
  }))
);

// Map fixtures to value bets
const valueBetsWithFixtures = valueBets.data.map(vb => ({
  ...vb,
  fixture: fixturesData.find(f => f.status === 'fulfilled' && f.value?.data?.id === vb.fixture_id)?.value?.data
}));
```

#### 4.2 Update ValueBetCard Props
**Update**: `app/components/value-bets/ValueBetCard.tsx`
```typescript
interface ValueBetCardProps {
  valueBet: ValueBet & { fixture?: Fixture | null };
}
```

### Phase 5: Server Component Refactoring

#### 5.1 Separate Hero Section
**Update**: `app/value-bets/page.tsx`
```typescript
import { ValueBetHero } from './components/ValueBetHero';

export default async function ValueBetsPage() {
  const valueBets = await sportmonks.getValueBets();
  const stats = calculateValueBetStats(valueBets?.data || []);
  
  return (
    <>
      <ValueBetHero stats={stats} />
      <ValueBetsClient valueBets={valueBets?.data || []} />
    </>
  );
}
```

### Phase 6: Client Component Refactoring

#### 6.1 Simplify Client Component
**Update**: `app/value-bets/value-bets-client.tsx`
```typescript
export function ValueBetsClient({ valueBets }: ValueBetsClientProps) {
  const { filters, filteredValueBets, updateFilter, clearFilters, stats } = useValueBetFilters(
    valueBets,
    { enableUrlState: true }
  );

  return (
    <div className="space-y-8">
      <ValueBetFilters 
        filters={filters}
        onFilterChange={updateFilter}
        stats={stats}
      />
      {/* Results */}
      {filteredValueBets.length > 0 ? (
        <ValueBetGrid valueBets={filteredValueBets} />
      ) : (
        <ValueBetEmptyState 
          hasActiveFilters={hasActiveFilters(filters)}
          onClearFilters={clearFilters}
        />
      )}
      {filteredValueBets.length > 0 && (
        <ValueBetStatsCards stats={stats} variant="summary" />
      )}
    </div>
  );
}
```

### Phase 7: Performance Optimizations

#### 7.1 Memoization
- Memoize filtered/sorted results
- Memoize statistics calculations
- Memoize expensive filter operations

#### 7.2 Virtualization (Future)
**File**: `app/value-bets/components/ValueBetVirtualGrid.tsx`
- Use `react-window` or `@tanstack/react-virtual` for large lists
- Only render visible items

#### 7.3 Debounced Search
- Implement debounced search in `useValueBetFilters`
- Reduce re-renders during typing

### Phase 8: Error Handling & Loading States

#### 8.1 Add Loading State
**File**: `app/value-bets/loading.tsx`
```typescript
export default function ValueBetsLoading() {
  return <ValueBetSkeleton />;
}
```

#### 8.2 Add Error Handling
**Update**: `app/value-bets/page.tsx`
```typescript
export default async function ValueBetsPage() {
  try {
    const valueBets = await sportmonks.getValueBets();
    // ... rest of logic
  } catch (error) {
    // Handle error gracefully
    return <ValueBetError error={error} />;
  }
}
```

#### 8.3 Error Component
**File**: `app/value-bets/components/ValueBetError.tsx`
```typescript
export function ValueBetError({ error }: { error: Error }) {
  // User-friendly error display
}
```

### Phase 9: Type Safety Improvements

#### 9.1 Strict Types
- Ensure all props are properly typed
- Use TypeScript discriminated unions where appropriate
- Add runtime validation with Zod if needed

#### 9.2 API Response Types
- Create proper types for API responses
- Validate API responses with Zod schemas

## Implementation Order

1. **Phase 1**: Extract utilities (Foundation)
2. **Phase 2**: Create custom hooks (Reusable logic)
3. **Phase 3**: Extract components (UI organization)
4. **Phase 4**: Enhance ValueBetCard (Data integration)
5. **Phase 5**: Refactor server component (Structure)
6. **Phase 6**: Refactor client component (Integration)
7. **Phase 7**: Performance optimizations (Polish)
8. **Phase 8**: Error handling (Reliability)
9. **Phase 9**: Type safety (Quality)

## Benefits

### Code Quality
- ✅ Eliminated code duplication
- ✅ Clear separation of concerns
- ✅ Reusable components and hooks
- ✅ Better testability

### Performance
- ✅ Memoized calculations
- ✅ Debounced search
- ✅ Reduced re-renders
- ✅ Potential for virtualization

### User Experience
- ✅ URL state management (shareable links)
- ✅ Browser navigation support
- ✅ Better loading states
- ✅ Improved error handling

### Maintainability
- ✅ Easier to modify
- ✅ Easier to test
- ✅ Better documentation
- ✅ Consistent patterns with rest of codebase

## Testing Strategy

1. **Unit Tests**: Utilities and hooks
2. **Component Tests**: Individual components
3. **Integration Tests**: Full page flow
4. **E2E Tests**: User workflows

## Migration Notes

- Keep existing functionality intact
- Gradual migration possible (feature flags)
- Backward compatible changes
- Document breaking changes if any

## Future Enhancements

1. **Pagination/Infinite Scroll**: For large datasets
2. **Advanced Filters**: Date range, league, team filters
3. **Sorting Presets**: Save common sorting configurations
4. **Export Functionality**: Export filtered results
5. **Real-time Updates**: WebSocket integration for live odds
6. **Favorites**: Save favorite value bets
7. **Analytics**: Track value bet performance

