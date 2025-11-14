# Country Page Refactoring Recommendations

## Current State Analysis

### Issues Identified:
1. **Limited Functionality**: Only displays basic fixtures grouped by league
2. **No Date Filtering**: Date picker is disabled (commented out)
3. **No Predictions**: Missing prediction markets and value bet indicators
4. **No Tab Navigation**: Single view instead of organized tabs
5. **Inconsistent with League Page**: Different structure from league page pattern
6. **No Statistics**: Missing country-level metrics and stats
7. **No React Query**: Uses basic state management instead of React Query
8. **Limited Data**: Only shows today's fixtures, no date range support
9. **No Search/Filter**: Missing the powerful search and filter capabilities
10. **Not Using Reusable Components**: Doesn't leverage `ReusableFixtureDisplay`

## Recommended Refactoring

### 1. **Adopt Tab-Based Navigation** (Like League Page)

**Structure:**
```
Country Page
├── Header (Country info, flag, stats cards)
├── Tabs
│   ├── Fixtures & Predictions (#fixtures)
│   ├── Leagues (#leagues)
│   └── Statistics (#statistics)
```

**Benefits:**
- Consistent UX with league pages
- Better organization of content
- Hash-based navigation for deep linking
- Improved mobile experience

### 2. **Use ReusableFixtureDisplay Component**

**Why:**
- Already proven in league and predictions pages
- Built-in search, filter, and date range capabilities
- Consistent UI/UX across the platform
- Supports predictions and value bets
- Handles empty states gracefully

**Implementation:**
```tsx
<ReusableFixtureDisplay
  fixtures={fixtures}
  variant="league"
  showDateHeaders={true}
  showLeagueHeaders={true}
  showSearchAndFilter={true}
  searchAndFilterOptions={{
    showSearch: true,
    showLeagueFilter: true,  // Filter by league within country
    showTeamFilter: true,
    showStatusFilter: true,
    showDateFilter: true,
    showPredictionsFilter: true,
    showValueBetsFilter: true,
  }}
/>
```

### 3. **Add Statistics Cards** (Like League Page)

**Metrics to Display:**
- Total Fixtures (in date range)
- Fixtures with Predictions
- Active Leagues
- Available Markets
- Top Value Bets Count
- Average Prediction Confidence

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Total Fixtures</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{fixtures.length}</div>
    </CardContent>
  </Card>
  {/* More stat cards */}
</div>
```

### 4. **Implement Date Range Support**

**Current:** Only shows today's fixtures
**Recommended:** Support date range (default: next 7 days)

**Implementation:**
- Use `UnifiedDateFilterRow` (already in ReusableFixtureDisplay)
- Fetch fixtures by date range from server
- Update URL params for shareability
- Support quick filters: Today, Tomorrow, This Week, Next Week

### 5. **Add Leagues Tab**

**Content:**
- List of all active leagues in the country
- League logos, names, and fixture counts
- Links to league pages
- Search/filter leagues
- Sort by: Name, Fixture Count, Popularity

**Example:**
```tsx
<TabsContent value="leagues">
  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
    {leagues.map((league) => (
      <Link href={generateLeagueUrl(league)}>
        <Card>
          {/* League info */}
        </Card>
      </Link>
    ))}
  </div>
</TabsContent>
```

### 6. **Add Statistics Tab**

**Content:**
- Country-level statistics
- Top performing leagues
- Most active teams
- Prediction accuracy metrics
- Value bet opportunities
- Historical data trends

### 7. **Use React Query for Data Management**

**Benefits:**
- Automatic caching
- Background refetching
- Loading states
- Error handling
- Optimistic updates

**Implementation:**
```tsx
const { data: fixtures, isLoading } = useQuery({
  queryKey: ['country-fixtures', countryId, dateRange],
  queryFn: () => fetchCountryFixtures(countryId, dateRange),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 8. **Server-Side Data Fetching**

**Current:** Only fetches today's fixtures
**Recommended:** Fetch date range, leagues, and statistics

**Implementation:**
```tsx
// In page.tsx
const fixtures = await sportmonks.getFixturesByDateRange(
  startDate,
  endDate,
  { include: 'participants;scores;state;predictions;predictions.type;league.country' }
);

const leagues = await sportmonks.getLeagues({
  filters: { countryId },
  include: 'country;sport;currentseason'
});
```

### 9. **Hash-Based Tab Navigation**

**Benefits:**
- Deep linking to specific tabs
- Browser back/forward support
- Shareable URLs
- Better UX

**Implementation:**
```tsx
const [activeTab, setActiveTab] = useState('fixtures');

useEffect(() => {
  const hash = window.location.hash.replace('#', '') || 'fixtures';
  setActiveTab(hash);
  window.addEventListener('hashchange', handleHashChange);
}, []);
```

### 10. **Consistent Header Design**

**Match League Page Pattern:**
- Country flag/icon
- Country name (large, bold)
- Country code and region info
- Quick stats summary
- Breadcrumb navigation

## Recommended File Structure

```
app/country/[countryId]/[slug]/
├── page.tsx                    # Server component (data fetching)
└── country-page-client.tsx     # Client component (tabs, interactions)
```

## Implementation Priority

### Phase 1 (High Priority):
1. ✅ Replace custom fixture display with `ReusableFixtureDisplay`
2. ✅ Add tab navigation (Fixtures, Leagues, Statistics)
3. ✅ Add date range support
4. ✅ Add statistics cards

### Phase 2 (Medium Priority):
5. Implement React Query for data fetching
6. Add leagues tab with league listings
7. Add hash-based navigation
8. Improve header design

### Phase 3 (Nice to Have):
9. Add statistics tab content
10. Add country-level analytics
11. Add comparison features
12. Add export/share functionality

## Code Example: Refactored Structure

```tsx
// country-page-client.tsx
export function CountryPageClient({ 
  country, 
  initialFixtures,
  leagues,
  initialStartDate,
  initialEndDate 
}: CountryPageClientProps) {
  const [activeTab, setActiveTab] = useState('fixtures');
  
  // Hash-based navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') || 'fixtures';
    setActiveTab(hash);
    window.addEventListener('hashchange', handleHashChange);
  }, []);

  // Statistics calculations
  const stats = useMemo(() => ({
    totalFixtures: initialFixtures.length,
    fixturesWithPredictions: initialFixtures.filter(f => f.predictions?.length > 0).length,
    activeLeagues: leagues.length,
    // ... more stats
  }), [initialFixtures, leagues]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CountryFlag country={country} />
            <div>
              <CardTitle className="text-2xl">{country.name}</CardTitle>
              <p className="text-muted-foreground">
                {leagues.length} active leagues
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat cards */}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="leagues">Leagues</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures">
          <ReusableFixtureDisplay
            fixtures={initialFixtures}
            variant="league"
            showSearchAndFilter={true}
            // ... full config
          />
        </TabsContent>

        <TabsContent value="leagues">
          {/* Leagues grid */}
        </TabsContent>

        <TabsContent value="statistics">
          {/* Statistics content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Benefits of Refactoring

1. **Consistency**: Matches league page pattern
2. **Functionality**: Full search, filter, and prediction support
3. **User Experience**: Better organized, more intuitive
4. **Maintainability**: Uses reusable components
5. **Performance**: React Query caching and optimization
6. **SEO**: Better structured content
7. **Scalability**: Easy to add new features

## Migration Path

1. Create new `country-page-client.tsx` with tab structure
2. Integrate `ReusableFixtureDisplay` for fixtures
3. Add leagues tab with league listings
4. Add statistics cards and tab
5. Update server component to fetch date ranges
6. Test and deploy
7. Remove old implementation

