# Performance & Mobile Integration Guide

This guide demonstrates how to integrate the new performance-optimized and mobile-responsive fixture display components into your application.

## 🚀 Quick Start

### 1. Basic Usage with ResponsiveFixtureDisplay

The `ResponsiveFixtureDisplay` automatically handles device detection and switches between desktop and mobile optimizations:

```tsx
import { ResponsiveFixtureDisplay } from '@/app/components/fixtures/ResponsiveFixtureDisplay';
import type { Fixture } from '@/schemas/fixture.schema';

interface MyPageProps {
  fixtures: Fixture[];
}

export function MyPage({ fixtures }: MyPageProps) {
  return (
    <ResponsiveFixtureDisplay
      fixtures={fixtures}
      variant="predictions"
      showDateHeaders={true}
      showLeagueHeaders={true}
      showSearchAndFilter={true}
      searchAndFilterVariant="auto" // Automatically adapts to device
      onPredictionClick={(fixture) => {
        // Handle prediction click
        console.log('Prediction clicked:', fixture);
      }}
      onValueBetClick={(fixture) => {
        // Handle value bet click
        console.log('Value bet clicked:', fixture);
      }}
    />
  );
}
```

### 2. Performance-Optimized Display

For maximum performance with large datasets:

```tsx
import { OptimizedReusableFixtureDisplay } from '@/app/components/fixtures/OptimizedReusableFixtureDisplay';

export function HighPerformancePage({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <OptimizedReusableFixtureDisplay
      fixtures={fixtures}
      useVirtualScrolling={true}
      virtualScrollingThreshold={50} // Enable virtual scrolling for 50+ items
      compact={false}
      showSearchAndFilter={true}
      searchAndFilterOptions={{
        showSearch: true,
        showLeagueFilter: true,
        showTeamFilter: true,
        showStatusFilter: true,
        showDateFilter: true,
        showPredictionsFilter: true,
        showValueBetsFilter: true,
      }}
    />
  );
}
```

## 📱 Mobile-Specific Implementations

### 1. Mobile-First Fixture Cards

```tsx
import { MobileFixtureCard } from '@/app/components/fixtures/MobileFixtureCard';

export function MobileFixtureList({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => (
        <MobileFixtureCard
          key={fixture.id}
          fixture={fixture}
          showPredictions={true}
          showValueBets={true}
          onPredictionClick={(fixture) => {
            // Navigate to prediction details
            router.push(`/predictions/${fixture.id}`);
          }}
          onValueBetClick={(fixture) => {
            // Show value bet details
            showValueBetModal(fixture);
          }}
        />
      ))}
    </div>
  );
}
```

### 2. Mobile Search & Filter

```tsx
import { MobileFixtureSearchAndFilter } from '@/app/components/fixtures/MobileFixtureSearchAndFilter';
import { useFixtureSearchAndFilter } from '@/app/hooks/useFixtureSearchAndFilter';

export function MobileSearchableFixtureList({ fixtures }: { fixtures: Fixture[] }) {
  const {
    filters,
    filteredFixtures,
    updateFilters,
    clearFilters,
  } = useFixtureSearchAndFilter(fixtures);

  return (
    <div className="space-y-4">
      <MobileFixtureSearchAndFilter
        fixtures={fixtures}
        filters={filters}
        onFiltersChange={updateFilters}
        showSearch={true}
        showLeagueFilter={true}
        showTeamFilter={true}
        showStatusFilter={true}
        showDateFilter={true}
        showPredictionsFilter={true}
        showValueBetsFilter={true}
      />
      
      <div className="space-y-3">
        {filteredFixtures.map((fixture) => (
          <MobileFixtureCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </div>
  );
}
```

## 🎯 Context-Specific Implementations

### 1. Predictions Page Integration

```tsx
// app/predictions/page.tsx
import { ResponsiveFixtureDisplay } from '@/app/components/fixtures/ResponsiveFixtureDisplay';
import { usePredictionsWithQuery } from '../hooks/usePredictionsWithQuery';

export function PredictionsPage() {
  const {
    fixtures,
    isLoadingDateFixtures,
    isLoadingMore,
    hasMore,
    loadFixturesForDate,
    loadNextPage,
  } = usePredictionsWithQuery({ initialFixtures: [] });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Predictions</h1>
      
      <ResponsiveFixtureDisplay
        fixtures={fixtures}
        isLoading={isLoadingDateFixtures}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadNextPage}
        variant="predictions"
        showDateHeaders={true}
        showLeagueHeaders={true}
        showSearchAndFilter={true}
        searchAndFilterVariant="auto"
        searchAndFilterOptions={{
          showSearch: true,
          showLeagueFilter: true,
          showTeamFilter: true,
          showStatusFilter: true,
          showDateFilter: false, // Date handled by date picker
          showPredictionsFilter: true,
          showValueBetsFilter: true,
        }}
        onPredictionClick={(fixture) => {
          // Handle prediction interaction
          router.push(`/predictions/${fixture.id}`);
        }}
      />
    </div>
  );
}
```

### 2. League Page Integration

```tsx
// app/league/[id]/page.tsx
import { LeagueFixturesDisplay } from '@/app/components/league/LeagueFixturesDisplay';

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-6 py-8">
      <LeagueFixturesDisplay
        leagueId={id}
        variant="detailed"
        showSearchAndFilter={true}
        searchAndFilterVariant="compact"
        searchAndFilterOptions={{
          showSearch: true,
          showLeagueFilter: false, // Not needed on league page
          showTeamFilter: true,
          showStatusFilter: true,
          showDateFilter: true,
          showPredictionsFilter: true,
          showValueBetsFilter: true,
        }}
      />
    </div>
  );
}
```

### 3. Team Page Integration

```tsx
// app/team/[teamId]/[slug]/team-detail-client.tsx
import { TeamFixturesDisplay } from '@/app/components/team/TeamFixturesDisplay';

export function TeamDetailClient({ team, initialFixtures }: TeamDetailClientProps) {
  return (
    <div className="container mx-auto px-6 py-8">
      <TeamFixturesDisplay
        teamId={team.id.toString()}
        initialFixtures={initialFixtures}
        variant="detailed"
        showSearchAndFilter={true}
        searchAndFilterVariant="compact"
        searchAndFilterOptions={{
          showSearch: false, // Not needed on team page
          showLeagueFilter: true,
          showTeamFilter: false, // Not needed on team page
          showStatusFilter: true,
          showDateFilter: true,
          showPredictionsFilter: true,
          showValueBetsFilter: true,
        }}
      />
    </div>
  );
}
```

## 🔧 Advanced Customization

### 1. Custom Virtual Scrolling

```tsx
import { VirtualFixtureList } from '@/app/components/fixtures/VirtualFixtureList';

export function CustomVirtualList({ groups }: { groups: FixtureGroup[] }) {
  return (
    <VirtualFixtureList
      groups={groups}
      compact={false}
      showPredictions={true}
      showValueBets={true}
      onPredictionClick={(fixture) => {
        // Custom prediction handling
      }}
      onValueBetClick={(fixture) => {
        // Custom value bet handling
      }}
    />
  );
}
```

### 2. Responsive Design Hook

```tsx
import { useResponsiveDesign, useDeviceType } from '@/app/hooks/useResponsiveDesign';

export function MyResponsiveComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsiveDesign();
  const { deviceType, isTouch } = useDeviceType();
  
  return (
    <div>
      <p>Current device: {deviceType}</p>
      <p>Touch enabled: {isTouch ? 'Yes' : 'No'}</p>
      <p>Screen size: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</p>
    </div>
  );
}
```

### 3. Custom Search & Filter

```tsx
import { useFixtureSearchAndFilter } from '@/app/hooks/useFixtureSearchAndFilter';

export function CustomSearchImplementation({ fixtures }: { fixtures: Fixture[] }) {
  const {
    filters,
    filteredFixtures,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    filterStats,
  } = useFixtureSearchAndFilter(fixtures, {
    initialFilters: {
      search: '',
      leagues: ['Premier League'],
      status: ['upcoming'],
    }
  });

  const handleCustomFilter = () => {
    updateFilters({
      ...filters,
      hasPredictions: true,
      hasValueBets: true,
    });
  };

  return (
    <div>
      <button onClick={handleCustomFilter}>
        Show Only Value Bets with Predictions
      </button>
      
      <div className="mt-4">
        {hasActiveFilters && (
          <p className="text-sm text-gray-600">
            Showing {filterStats.filtered} of {filterStats.total} fixtures
          </p>
        )}
      </div>
    </div>
  );
}
```

## 📊 Performance Monitoring

### 1. Performance Metrics

```tsx
import { useResponsiveDesign } from '@/app/hooks/useResponsiveDesign';

export function PerformanceMonitor() {
  const { screenWidth, screenHeight, orientation } = useResponsiveDesign();
  
  // Log performance metrics
  React.useEffect(() => {
    console.log('Screen dimensions:', { screenWidth, screenHeight });
    console.log('Orientation:', orientation);
    
    // You can send these to your analytics service
    analytics.track('screen_resize', {
      width: screenWidth,
      height: screenHeight,
      orientation,
    });
  }, [screenWidth, screenHeight, orientation]);

  return null;
}
```

### 2. Virtual Scrolling Performance

```tsx
export function PerformanceOptimizedList({ fixtures }: { fixtures: Fixture[] }) {
  const [renderTime, setRenderTime] = useState(0);
  
  useEffect(() => {
    const start = performance.now();
    // Component renders
    const end = performance.now();
    setRenderTime(end - start);
  }, [fixtures]);

  return (
    <div>
      <p>Render time: {renderTime.toFixed(2)}ms</p>
      <ResponsiveFixtureDisplay
        fixtures={fixtures}
        useVirtualScrolling={fixtures.length > 100}
        virtualScrollingThreshold={100}
      />
    </div>
  );
}
```

## 🎨 Styling Customization

### 1. Custom Theme Integration

```tsx
// Custom CSS for mobile optimizations
const mobileStyles = `
  .mobile-fixture-card {
    @apply touch-manipulation;
    @apply active:scale-95;
    @apply transition-transform duration-150;
  }
  
  .mobile-search-filter {
    @apply touch-manipulation;
    @apply select-none;
  }
  
  .virtual-scroll-container {
    @apply scrollbar-thin;
    @apply scrollbar-thumb-gray-300;
    @apply dark:scrollbar-thumb-gray-600;
  }
`;

export function ThemedFixtureDisplay() {
  return (
    <>
      <style>{mobileStyles}</style>
      <ResponsiveFixtureDisplay
        fixtures={fixtures}
        className="mobile-fixture-card"
      />
    </>
  );
}
```

### 2. Dark Mode Support

All components automatically support dark mode through Tailwind's dark: prefix. No additional configuration needed!

## 🚀 Best Practices

### 1. Performance Tips

- Use `ResponsiveFixtureDisplay` for automatic optimization
- Enable virtual scrolling for lists with 50+ items
- Use memoized components for frequently re-rendered lists
- Implement proper loading states for better UX

### 2. Mobile Optimization

- Always test on actual devices, not just browser dev tools
- Use touch-friendly button sizes (minimum 44px)
- Implement proper touch feedback (active states)
- Consider thumb-friendly navigation zones

### 3. Accessibility

- All components include proper ARIA labels
- Keyboard navigation is fully supported
- Screen reader compatibility is built-in
- Focus management is handled automatically

## 🔍 Troubleshooting

### Common Issues

1. **Virtual scrolling not working**: Ensure you have enough items (threshold met)
2. **Mobile layout issues**: Check responsive breakpoints and touch targets
3. **Performance problems**: Verify memoization is working correctly
4. **TypeScript errors**: Ensure all imports are using correct paths

### Debug Mode

```tsx
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

export function DebugFixtureDisplay({ fixtures }: { fixtures: Fixture[] }) {
  if (DEBUG) {
    console.log('Fixture count:', fixtures.length);
    console.log('First fixture:', fixtures[0]);
  }
  
  return <ResponsiveFixtureDisplay fixtures={fixtures} />;
}
```

This guide provides comprehensive examples for integrating the new performance and mobile-optimized components into your application. All components are production-ready and fully tested!
