# Search and Filter Architecture

## Overview

The search and filter system provides comprehensive filtering capabilities for fixtures across the entire application. It's designed to be highly reusable and configurable, working seamlessly with our existing fixture display architecture.

## Core Components

### 1. Search and Filter Utilities (`fixture-search-utils.ts`)

**Purpose**: Core filtering logic and data processing utilities.

**Key Functions**:
- `filterFixtures()` - Main filtering function that applies all active filters
- `getFixtureStatus()` - Determines if a fixture is live, upcoming, or finished
- `extractLeagues()` / `extractTeams()` - Extract unique values for filter options
- `getFilterSummary()` - Generate human-readable filter descriptions
- `hasActiveFilters()` - Check if any filters are currently active

**Filter Types**:
```typescript
interface FixtureFilters {
  searchQuery: string;           // Text search across teams and leagues
  leagues: string[];            // Filter by specific leagues
  teams: string[];              // Filter by specific teams
  status: ('live' | 'upcoming' | 'finished')[];  // Filter by fixture status
  dateRange: {                  // Filter by date range
    from?: string;
    to?: string;
  };
  hasPredictions: boolean | null;  // Filter by prediction availability
  hasValueBets: boolean | null;    // Filter by value bet availability
}
```

### 2. Search and Filter Component (`FixtureSearchAndFilter.tsx`)

**Purpose**: Reusable UI component for search and filtering interface.

**Features**:
- **Compact Mode**: Minimal interface with search bar and filter button
- **Full Mode**: Complete interface with all filter options visible
- **Configurable**: Can show/hide specific filter types based on context
- **Responsive**: Mobile-friendly design with collapsible filters
- **Real-time**: Instant filtering as user types or selects options

**Props**:
```typescript
interface FixtureSearchAndFilterProps {
  fixtures: Fixture[];
  filters: FixtureFilters;
  onFiltersChange: (filters: FixtureFilters) => void;
  variant?: 'compact' | 'full';
  showSearch?: boolean;
  showLeagueFilter?: boolean;
  showTeamFilter?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showPredictionsFilter?: boolean;
  showValueBetsFilter?: boolean;
}
```

### 3. Search and Filter Hook (`useFixtureSearchAndFilter.ts`)

**Purpose**: React hook for managing search and filter state and logic.

**Features**:
- **State Management**: Manages filter state and updates
- **Filtered Results**: Provides memoized filtered fixtures
- **Statistics**: Provides filter statistics (total, filtered, leagues, teams)
- **Utility Functions**: Clear filters, update individual filters, etc.

**Return Value**:
```typescript
interface UseFixtureSearchAndFilterReturn {
  filters: FixtureFilters;
  filteredFixtures: Fixture[];
  hasActiveFilters: boolean;
  updateFilters: (filters: FixtureFilters) => void;
  updateFilter: <K extends keyof FixtureFilters>(key: K, value: FixtureFilters[K]) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof FixtureFilters) => void;
  filterStats: {
    total: number;
    filtered: number;
    leagues: number;
    teams: number;
  };
}
```

## Integration with ReusableFixtureDisplay

The search and filter system is seamlessly integrated into the `ReusableFixtureDisplay` component:

```typescript
// Enable search and filtering
<ReusableFixtureDisplay
  fixtures={fixtures}
  showSearchAndFilter={true}
  searchAndFilterVariant="compact"
  searchAndFilterOptions={{
    showSearch: true,
    showLeagueFilter: true,
    showTeamFilter: true,
    showStatusFilter: true,
    showDateFilter: false, // Disabled when date picker is used
    showPredictionsFilter: true,
    showValueBetsFilter: true,
  }}
  // ... other props
/>
```

## Usage Examples

### 1. Predictions Page
```typescript
// Compact mode with most filters enabled
<ReusableFixtureDisplay
  fixtures={fixtures}
  showSearchAndFilter={true}
  searchAndFilterVariant="compact"
  searchAndFilterOptions={{
    showSearch: true,
    showLeagueFilter: true,
    showTeamFilter: true,
    showStatusFilter: true,
    showDateFilter: false, // Date handled by date picker
    showPredictionsFilter: true,
    showValueBetsFilter: true,
  }}
/>
```

### 2. League Page
```typescript
// Full mode with limited filters (no league filter needed)
<ReusableFixtureDisplay
  fixtures={fixtures}
  showSearchAndFilter={true}
  searchAndFilterVariant="full"
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
```

### 3. Team Page
```typescript
// Compact mode with team-specific filters
<ReusableFixtureDisplay
  fixtures={fixtures}
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
```

## Filter Types and Logic

### 1. Search Query
- **Scope**: Searches across team names and league names
- **Case Insensitive**: Automatically converts to lowercase for comparison
- **Real-time**: Updates as user types

### 2. League Filter
- **Multi-select**: Users can select multiple leagues
- **Dynamic Options**: Options are extracted from available fixtures
- **Alphabetical**: Options are sorted alphabetically

### 3. Team Filter
- **Multi-select**: Users can select multiple teams
- **Dynamic Options**: Options are extracted from all participants
- **Limited Display**: Shows first 20 teams to prevent UI overflow

### 4. Status Filter
- **Live**: Fixtures currently in progress or starting soon
- **Upcoming**: Fixtures scheduled for the future
- **Finished**: Fixtures that have completed

### 5. Date Range Filter
- **From/To**: Users can set start and end dates
- **ISO Format**: Uses YYYY-MM-DD format
- **Optional**: Either field can be left empty

### 6. Predictions Filter
- **With Predictions**: Shows only fixtures that have prediction data
- **Without Predictions**: Shows only fixtures without prediction data
- **Toggle**: Users can select either option or neither

### 7. Value Bets Filter
- **With Value Bets**: Shows only fixtures with value bet opportunities
- **Without Value Bets**: Shows only fixtures without value bets
- **Toggle**: Users can select either option or neither

## Performance Considerations

### 1. Memoization
- **Filtered Results**: Uses `useMemo` to prevent unnecessary recalculations
- **Filter Statistics**: Memoized to avoid expensive operations
- **Available Options**: League and team lists are memoized

### 2. Efficient Filtering
- **Early Returns**: Filters exit early when conditions aren't met
- **Optimized Comparisons**: Uses efficient string matching and array operations
- **Minimal Re-renders**: Only updates when necessary

### 3. UI Optimization
- **Debounced Search**: Search input can be debounced (configurable)
- **Lazy Loading**: Filter options are loaded on demand
- **Virtual Scrolling**: Can be integrated for large lists

## Mobile Optimization

### 1. Compact Mode
- **Minimal Interface**: Search bar + filter button
- **Popover Filters**: Filters open in a popover to save space
- **Touch Friendly**: Large touch targets and proper spacing

### 2. Responsive Design
- **Grid Layout**: Filters adapt to screen size
- **Scrollable Options**: Long lists are scrollable
- **Collapsible Sections**: Can be collapsed on small screens

## Accessibility

### 1. Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Keyboard Shortcuts**: Standard keyboard interactions
- **Focus Management**: Proper focus handling in popovers

### 2. Screen Reader Support
- **ARIA Labels**: Proper labeling for all interactive elements
- **Descriptive Text**: Clear descriptions for filter options
- **Status Updates**: Announcements when filters are applied/cleared

### 3. Visual Indicators
- **Active Filters**: Clear indication of applied filters
- **Filter Counts**: Shows number of active filters
- **Loading States**: Visual feedback during filtering operations

## Future Enhancements

### 1. Advanced Filters
- **Score Range**: Filter by expected score ranges
- **Weather Conditions**: Filter by weather (for outdoor sports)
- **Venue**: Filter by specific venues or stadiums
- **Referee**: Filter by specific referees

### 2. Saved Filters
- **Filter Presets**: Save and recall common filter combinations
- **User Preferences**: Remember user's preferred filter settings
- **Quick Filters**: One-click filters for common scenarios

### 3. Analytics Integration
- **Filter Usage**: Track which filters are most popular
- **Search Analytics**: Monitor search query patterns
- **Performance Metrics**: Track filtering performance

### 4. Advanced Search
- **Fuzzy Search**: More intelligent text matching
- **Search Suggestions**: Auto-complete for search queries
- **Search History**: Remember recent searches
- **Saved Searches**: Save and share search queries

## Testing Strategy

### 1. Unit Tests
- **Filter Logic**: Test all filtering functions
- **Utility Functions**: Test helper functions
- **Hook Logic**: Test the search and filter hook

### 2. Integration Tests
- **Component Integration**: Test with ReusableFixtureDisplay
- **Data Flow**: Test filter state management
- **Performance**: Test with large datasets

### 3. E2E Tests
- **User Workflows**: Test complete filtering workflows
- **Cross-browser**: Test on different browsers
- **Mobile**: Test mobile interactions

## Conclusion

The search and filter system provides a comprehensive, reusable solution for filtering fixtures across the application. It's designed with performance, accessibility, and user experience in mind, while maintaining the flexibility to adapt to different contexts and requirements.

The system integrates seamlessly with the existing fixture display architecture and provides a solid foundation for future enhancements and customizations.
