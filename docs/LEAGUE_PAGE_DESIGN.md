# League Page Design Documentation

## Overview

The league page provides comprehensive information about a specific football league, including fixtures, standings, teams, and statistics. This document outlines the design, functionality, and implementation details.

## URL Structure

```
/predictions/league/[leagueSlug]?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Examples
- `/predictions/league/premier-league`
- `/predictions/league/champions-league#standings`
- `/predictions/league/bundesliga?startDate=2024-12-20&endDate=2024-12-27`

## Page Layout

### Header Section
- **League Name**: Displayed prominently with country information
- **League Logo**: If available from API
- **Breadcrumb Navigation**: Country > League hierarchy

### Tab Navigation
Four main tabs with direct linking support:

#### 1. Fixtures & Predictions (`#fixtures`)
- **Date Range Selector**: Compact modal with quick selection options
- **Fixture List**: Grouped by date with league-specific filtering
- **Prediction Markets**: Displayed for each fixture
- **ValueBet Indicators**: Color-coded betting opportunities

#### 2. Standings (`#standings`)
- **Comprehensive Table**: Full standings with all standard columns
- **Visual Indicators**: Champions League spots and relegation zone
- **Recent Form**: Color-coded W/D/L indicators
- **Responsive Design**: Desktop table and mobile cards

#### 3. Teams (`#teams`)
- **Team List**: All teams participating in the league
- **Team Logos**: Displayed when available
- **Team Statistics**: Basic team information and performance

#### 4. Statistics (`#statistics`)
- **League Statistics**: Overall league performance metrics
- **Season Information**: Current season details and progress

## Standings Table Features

### Desktop Table
```
| Pos | Team | P | W | D | L | GF | GA | GD | Pts | Form |
|-----|------|---|---|---|---|----|----|----|-----|------|
|  1  | Team | 10| 8 | 1 | 1 | 25 | 8  | +17| 25  | WWWDW|
```

### Column Definitions
- **Pos**: Position in league table
- **Team**: Team name with logo
- **P**: Games played
- **W**: Wins
- **D**: Draws
- **L**: Losses
- **GF**: Goals for
- **GA**: Goals against
- **GD**: Goal difference
- **Pts**: Points
- **Form**: Last 5 matches (W/D/L)

### Visual Indicators
- **Champions League Spots**: Top 3 positions highlighted in green
- **Relegation Zone**: Bottom 3 positions highlighted in red
- **Goal Difference**: Green for positive, red for negative
- **Form**: Color-coded circles (W=green, D=gray, L=red)

### Mobile Cards
Responsive card layout for mobile devices with the same information organized vertically.

## Date Range Selection

### Quick Selection Options
- **±3 Days**: 3 days before and after today
- **±7 Days**: 7 days before and after today
- **±14 Days**: 14 days before and after today
- **±21 Days**: 21 days before and after today
- **Custom Range**: Full calendar picker

### Constraints
- **Past Dates**: Unlimited (no restrictions)
- **Future Dates**: Maximum 21 days from current date
- **Range Validation**: Ensures start date ≤ end date

### Modal Design
- **Maximum Width**: 640px
- **Calendar Height**: Maximum 500px
- **Compact Layout**: Reduced button sizes and spacing

## API Integration

### Fixtures Endpoint
```
GET /api/sportmonks/fixtures/date-range
```
**Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `leagueId`: League ID for filtering
- `include`: Comprehensive include parameters

### Standings Endpoint
```
GET /api/sportmonks/leagues/{leagueId}/standings
```
**Parameters:**
- `include`: `league;round;group;stage;form;details.type;rule.type:name;participant`
- `filters`: `{ standingLeagues: leagueId }`

### Data Structure
```typescript
interface Standing {
  id: number;
  participant: Team;
  position: number;
  points: number;
  details: Array<{
    type: { code: string };
    value: number;
  }>;
  form: Array<{
    form: 'W' | 'D' | 'L';
    sort_order: number;
  }>;
}
```

## Error Handling

### No Fixtures Found
**Enhanced Empty State:**
- Clear heading and description
- Suggested actions with bullet points
- Action buttons for quick navigation
- Date range information and tips

**Action Buttons:**
- "Try Next 7 Days": Navigate to next week
- "Try Last 7 Days": Navigate to previous week
- "Browse All Fixtures": Navigate to main predictions page

### API Failures
**Fallback Strategy:**
1. Try API filtering first
2. Fall back to client-side filtering
3. Show appropriate error messages
4. Provide alternative navigation options

## Performance Optimizations

### Component Memoization
- **FixtureCard**: Memoized to prevent unnecessary re-renders
- **StandingsTable**: Optimized with proper dependency arrays
- **DateRangePicker**: Memoized callbacks and state

### API Optimization
- **Pagination**: Limited to 50 items per page (API limit compliance)
- **Caching**: Proper cache headers and stale-while-revalidate
- **Error Boundaries**: Graceful error handling with fallbacks

## Accessibility Features

### Keyboard Navigation
- **Tab Navigation**: Full keyboard support for all interactive elements
- **Arrow Keys**: Calendar navigation support
- **Enter/Space**: Button activation

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Alt Text**: Descriptive text for all images and icons

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant color schemes
- **Focus Indicators**: Clear visual focus states
- **Responsive Design**: Works across all screen sizes

## Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px (card layout)
- **Tablet**: 768px - 1024px (hybrid layout)
- **Desktop**: > 1024px (full table layout)

### Mobile Optimizations
- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Natural touch interactions
- **Viewport Meta**: Proper mobile viewport configuration

## Direct Linking

### URL Anchors
- `#fixtures`: Direct link to fixtures tab
- `#standings`: Direct link to standings tab
- `#teams`: Direct link to teams tab
- `#statistics`: Direct link to statistics tab

### Usage Examples
```
/predictions/league/premier-league#standings
/predictions/league/champions-league#fixtures?startDate=2024-12-20
```

## Implementation Notes

### Server-Side Rendering
- **Initial Data**: Server-side data fetching for faster initial load
- **Hydration**: Client-side hydration for interactive features
- **SEO**: Proper meta tags and structured data

### Client-Side Features
- **Date Range Picker**: Interactive calendar component
- **Tab Switching**: Smooth transitions between tabs
- **Real-time Updates**: Live score updates when available

### State Management
- **URL State**: Date range and tab selection synced with URL
- **Local State**: UI state (loading, errors, selections)
- **Cache State**: API response caching and invalidation

## Testing Considerations

### Unit Tests
- **Component Rendering**: All components render correctly
- **User Interactions**: Button clicks and form submissions
- **Error States**: Proper error handling and display

### Integration Tests
- **API Integration**: End-to-end API call testing
- **Navigation**: Tab switching and URL updates
- **Date Selection**: Date range picker functionality

### Visual Regression Tests
- **Responsive Design**: Layout consistency across breakpoints
- **Dark Mode**: Proper theme switching
- **Loading States**: Skeleton and loading indicators

## Future Enhancements

### Planned Features
- **Team Statistics**: Detailed team performance metrics
- **Head-to-Head**: Team comparison functionality
- **Season History**: Historical league data
- **Export Options**: CSV/PDF export for standings

### Performance Improvements
- **Virtual Scrolling**: For large fixture lists
- **Progressive Loading**: Incremental data loading
- **Offline Support**: Service worker implementation

---

## Related Documentation
- [API Endpoints](./API_ENDPOINTS.md)
- [Component Architecture](./COMPONENT_ARCHITECTURE.md)
- [Performance Guidelines](./PERFORMANCE_GUIDELINES.md)
