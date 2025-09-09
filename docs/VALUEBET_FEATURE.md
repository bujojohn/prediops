# ValueBet Indicator Feature

## Overview

The ValueBet Indicator is a visual feature that displays the availability and status of value betting opportunities for each fixture. It provides users with quick visual feedback about profitable betting opportunities directly on fixture cards.

## Visual States

### 🟢 Value Bet Available
- **Icon**: TrendingUp (green with glow effect)
- **Meaning**: Favorable odds detected - profitable betting opportunity
- **Tooltip**: Shows count, best odds, fair odds, and bookmaker information
- **Example**: "🟢 Value Bet: Favorable odds detected - profitable betting opportunity\n\n📊 2 value bets available\n💰 Best odds: 2.4 (Fair: 2.1)\n🏦 Bookmaker: Unibet"

### ⚪ No Value Bet
- **Icon**: DollarSign (gray)
- **Meaning**: Data available but odds are not favorable for betting
- **Tooltip**: "⚪ No Value: Data available but odds are not favorable for betting"

### ⚫ No Data Available
- **Icon**: XCircle (gray)
- **Meaning**: Value bet analysis not available for this fixture
- **Tooltip**: "⚫ No Data: Value bet analysis not available for this fixture"

### 🔴 Error State
- **Icon**: AlertCircle (red)
- **Meaning**: Failed to load value bet data
- **Tooltip**: "🔴 Error: Failed to load value bet data"

### ⏳ Loading State
- **Icon**: DollarSign (gray with pulse animation)
- **Meaning**: Loading value bet analysis
- **Tooltip**: "⏳ Loading value bet analysis..."

## Technical Implementation

### API Integration
- **Endpoint**: `/api/sportmonks/value-bets/fixture/[fixtureId]`
- **Sportmonks Method**: `getValueBetsByFixtureId(fixtureId, config)`
- **Caching**: 5-minute stale time, 30-minute garbage collection
- **Retry Logic**: 2 retries with exponential backoff

### React Query Hook
```typescript
const { data, isLoading, error } = useValueBet({
  fixtureId: fixture.id,
  enabled: true,
});
```

### Component Usage
```tsx
<ValueBetIcon 
  state={valueBetState} 
  size="sm" 
  showGlow={valueBetState === "value"}
  showExplanations={settings.showValueBetExplanations}
  valueBetData={valueBetInfo}
/>
```

## User Settings

### Display Settings Integration
- **Setting**: `showValueBetExplanations` (boolean)
- **Default**: `true`
- **Purpose**: Controls whether detailed explanations are shown in tooltips
- **Location**: DisplaySettingsContext

### Tooltip Modes
- **Detailed Mode** (showExplanations: true): Full explanations with emojis and detailed information
- **Simple Mode** (showExplanations: false): Basic state information only

## Data Structure

### ValueBetData Interface
```typescript
interface ValueBetData {
  count: number;           // Number of value bets found
  bestOdd?: number;        // Highest odds available
  fairOdd?: number;        // Fair market odds
  bookmaker?: string;      // Bookmaker offering best odds
}
```

### API Response
```typescript
interface ValueBetResponse {
  success: boolean;
  data: {
    data: ValueBet[];      // Array of value bet objects
    pagination?: unknown;
  };
  message?: string;
}
```

## Visual Design

### Color Scheme
- **Value Bet**: Green (#22c55e) with glow effect
- **No Value**: Gray (#6b7280)
- **Unavailable**: Gray (#9ca3af)
- **Error**: Red (#ef4444)
- **Loading**: Gray with pulse animation

### Glow Effect
- **CSS**: `drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]`
- **Dark Mode**: `drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]`
- **Condition**: Only applied when `showGlow={true}` and state is "value"

### Icon Sizes
- **sm**: 12px (h-3 w-3)
- **md**: 16px (h-4 w-4)
- **lg**: 20px (h-5 w-5)

## Placement

### Desktop Layout
- **Position**: Next to "Odds" button below scores
- **Alignment**: Centered in column
- **Spacing**: 8px gap from odds button

### Mobile Layout
- **Position**: Next to score/time display in center
- **Alignment**: Inline with score information
- **Responsive**: Adapts to screen size

## Accessibility

### ARIA Support
- **aria-label**: Descriptive text for screen readers
- **title**: Tooltip text for mouse hover
- **Semantic**: Uses appropriate icon components

### Keyboard Navigation
- **Focusable**: Icons are focusable elements
- **Tooltip**: Shows on focus for keyboard users
- **Screen Reader**: Full state and data information announced

## Performance Considerations

### Caching Strategy
- **Stale Time**: 5 minutes (value bet data changes slowly)
- **Garbage Collection**: 30 minutes (prevents memory leaks)
- **Background Updates**: Automatic refresh when stale

### Error Handling
- **Retry Logic**: 2 attempts with exponential backoff
- **Fallback States**: Graceful degradation to unavailable state
- **User Feedback**: Clear error indicators

## Future Enhancements

### Planned Features
1. **Click to Expand**: Show detailed value bet information
2. **Filter Integration**: Filter fixtures by value bet status
3. **Notification System**: Alert users to new value bets
4. **Analytics**: Track value bet performance over time

### Configuration Options
1. **Custom Colors**: User-defined color schemes
2. **Icon Themes**: Alternative icon sets
3. **Tooltip Delay**: Configurable hover delay
4. **Data Refresh**: Manual refresh controls

## Troubleshooting

### Common Issues
1. **Icons not showing**: Check if `showValueBetExplanations` is properly set
2. **Tooltips not working**: Verify `title` attribute is being set
3. **Glow effect missing**: Ensure `showGlow={true}` and state is "value"
4. **Data not loading**: Check API endpoint and network connectivity

### Debug Information
- **Console Logs**: API errors are logged with fixture ID and status
- **Network Tab**: Check API response status and data
- **React DevTools**: Inspect component props and state

## Related Documentation
- [Sportmonks API Integration](./SPORTMONKS_API_USAGE.md)
- [Component Architecture](./TECHNICAL_GUIDELINES.md)
- [Display Settings](./STYLING_GUIDE.md)
