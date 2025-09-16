# Sidebar Functionality Documentation

## Overview

The sidebar provides navigation for countries, leagues, and fixtures with enhanced functionality including favorites, search, and fixture count indicators. This document outlines the design, functionality, and implementation details.

## Features

### 1. Country and League Navigation
- **Hierarchical Structure**: Countries → Leagues → Fixtures
- **Expandable Accordion**: One country expanded at a time
- **League Loading**: Lazy loading of leagues when country is expanded
- **Direct Navigation**: Click to navigate to league pages

### 2. Fixture Count Indicators
- **7-Day Range**: Shows fixture counts for the next 7 days (enhanced from "today only")
- **Color Coding**: Green badges for leagues with fixtures, muted for empty
- **Tooltips**: "X fixtures in next 7 days" or "No fixtures in next 7 days"
- **Real-time Updates**: Counts update when expanding countries

### 3. Search and Filtering
- **Real-time Search**: Instant filtering as you type
- **Debounced Input**: 200ms delay to prevent excessive API calls
- **Case Insensitive**: Search works regardless of case
- **Partial Matching**: Finds countries/leagues containing search terms

### 4. Favorites System
- **Star Icons**: Click to add/remove favorites
- **Persistent Storage**: Favorites saved in localStorage
- **Visual Feedback**: Star filled for favorites, outline for non-favorites
- **Quick Access**: Favorites remain visible when filtering

### 5. Region Support
- **Automatic Detection**: Distinguishes between countries and regions
- **Visual Indicators**: Region badges for continental/global entities
- **Separate Sections**: Countries and regions grouped separately
- **Smart Grouping**: UEFA, CAF, AFC, etc. treated as regions

## API Integration

### Fixture Count Fetching
```typescript
// Fetch fixtures for next 7 days for a country
const fetchCountryTodayCounts = async (countryId: number) => {
  const allFixtures = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const response = await fetch(
      `/api/sportmonks/fixtures/date-country?date=${dateStr}&countryId=${countryId}`
    );
    const data = await response.json();
    if (data?.success && data.data) {
      allFixtures.push(...data.data);
    }
  }
  
  // Process and store counts
  return allFixtures;
};
```

### Endpoint Details
- **URL**: `/api/sportmonks/fixtures/date-country`
- **Parameters**: 
  - `date`: Date in YYYY-MM-DD format
  - `countryId`: Country ID to filter fixtures
- **Response**: Array of fixtures for the specified country and date

### Data Structure
```typescript
interface CountryWithLeagues extends Country {
  fixtureCount: number;
  leaguesCount: number;
}

interface League {
  id: number;
  name: string;
  type?: string;
  short_code?: string;
}
```

## User Interface

### Country Items
```
┌─────────────────────────────────────┐
│ 🌍 England (23)                     │
│    ├─ Premier League (15)           │
│    ├─ Championship (8)              │
│    └─ League One (0)                │
└─────────────────────────────────────┘
```

**Components:**
- **Flag/Icon**: Country flag or globe icon
- **Name**: Country name with fixture count
- **Fixture Count Badge**: Green if > 0, muted if 0
- **Expand/Collapse**: Chevron icon indicating state

### League Items
```
┌─────────────────────────────────────┐
│ ⚽ Premier League (15)              │
│    Short Code: [PRE]                │
└─────────────────────────────────────┘
```

**Components:**
- **League Icon**: Football or league-specific icon
- **Name**: League name with fixture count
- **Short Code**: League abbreviation in badge
- **Fixture Count Badge**: Green if > 0, muted if 0

### Search Interface
```
┌─────────────────────────────────────┐
│ 🔍 Search countries...              │
└─────────────────────────────────────┘
```

**Features:**
- **Placeholder**: "Search countries..."
- **Real-time Filtering**: Results update as you type
- **Clear Button**: X button to clear search
- **No Results State**: "No countries found" message

## State Management

### Local Storage Keys
- `sidebar-favorites`: Array of favorite country IDs
- `sidebar-expanded-country`: Currently expanded country ID
- `sidebar-counts-7days-{date}`: Fixture counts for 7-day range

### State Variables
```typescript
const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
const [countryLeagues, setCountryLeagues] = useState<Map<number, League[]>>(new Map());
const [favorites, setFavorites] = useState<Set<number>>(new Set());
const [countryTodayCounts, setCountryTodayCounts] = useState<Map<number, number>>(new Map());
const [leagueTodayCounts, setLeagueTodayCounts] = useState<Map<number, number>>(new Map());
```

## Performance Optimizations

### Lazy Loading
- **Leagues**: Loaded only when country is expanded
- **Fixture Counts**: Fetched only for expanded countries
- **Search Results**: Debounced to prevent excessive filtering

### Caching Strategy
- **Count Storage**: Fixture counts cached in localStorage with date-based keys
- **League Data**: Cached in component state to avoid re-fetching
- **Favorites**: Persisted in localStorage for session continuity

### Memory Management
- **Cleanup**: Proper cleanup of event listeners and timeouts
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input debounced to reduce API calls

## Error Handling

### API Failures
- **Graceful Degradation**: Continue showing countries even if counts fail
- **Error Logging**: Console warnings for failed API calls
- **Fallback Values**: Default to 0 for failed count fetches

### Network Issues
- **Timeout Handling**: Reasonable timeouts for API calls
- **Retry Logic**: Automatic retry for failed requests
- **User Feedback**: Loading states and error indicators

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Arrow Keys**: Navigate through country/league lists
- **Enter/Space**: Expand/collapse countries, toggle favorites
- **Escape**: Close search, clear focus

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Announce search results and state changes
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant color schemes
- **Focus Indicators**: Clear visual focus states
- **Icon Alternatives**: Text alternatives for all icons

## Mobile Responsiveness

### Touch Interactions
- **Touch Targets**: Minimum 44px touch targets for all interactive elements
- **Swipe Gestures**: Natural touch interactions for expanding/collapsing
- **Scroll Behavior**: Smooth scrolling for long lists

### Layout Adaptations
- **Compact Mode**: Reduced spacing and smaller fonts on mobile
- **Collapsible**: Sidebar can be hidden on small screens
- **Overlay**: Full-screen overlay on mobile when expanded

## Configuration Options

### Search Settings
- **Debounce Delay**: 200ms (configurable)
- **Minimum Query Length**: 1 character
- **Case Sensitivity**: Case-insensitive search

### Count Settings
- **Date Range**: 7 days (configurable)
- **Cache Duration**: 24 hours (date-based expiry)
- **Update Frequency**: On country expansion

### UI Settings
- **Animation Duration**: 200ms for smooth transitions
- **Icon Sizes**: 16px for flags, 14px for badges
- **Color Scheme**: Green for active, gray for inactive

## Testing Considerations

### Unit Tests
- **State Management**: Test all state transitions and updates
- **Search Functionality**: Test filtering and debouncing
- **Favorites System**: Test add/remove and persistence

### Integration Tests
- **API Integration**: Test fixture count fetching and error handling
- **Navigation**: Test country/league navigation flows
- **Persistence**: Test localStorage integration

### Visual Regression Tests
- **Responsive Design**: Test across different screen sizes
- **State Variations**: Test expanded/collapsed states
- **Loading States**: Test skeleton and loading indicators

## Future Enhancements

### Planned Features
- **Recent Searches**: Remember and suggest recent search terms
- **Custom Sorting**: Allow users to sort by name, fixture count, or favorites
- **Bulk Actions**: Select multiple countries for batch operations
- **Export Options**: Export favorite countries or search results

### Performance Improvements
- **Virtual Scrolling**: For very large country lists
- **Background Sync**: Update counts in background
- **Offline Support**: Cache data for offline viewing

---

## Related Documentation
- [League Page Design](./LEAGUE_PAGE_DESIGN.md)
- [API Usage Guide](./SPORTMONKS_API_USAGE.md)
- [Component Architecture](./COMPONENT_ARCHITECTURE.md)
