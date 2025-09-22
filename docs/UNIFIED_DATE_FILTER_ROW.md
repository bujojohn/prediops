# 📅 Unified Date Filter Row

A refactored horizontal layout component that combines date selection and filtering functionality into a clean three-column interface, matching the predictions page design.

## 🚀 Features

### Three-Column Layout
- **Column 1**: Horizontal scrollable date picker (like predictions page)
- **Column 2**: Date range selector with popover/lightbox
- **Column 3**: Filter icon with popover interface

### Date Picker (Column 1)
- **Format**: "12 Sep", "1 Jan" style dates
- **Default**: Today highlighted and selected
- **Navigation**: Chevron left/right buttons for scrolling
- **Selection**: Click-to-select individual dates
- **Range**: Configurable past/future days

### Date Range Selector (Column 2)
- **Icon**: Calendar icon with "Range" label
- **Interface**: Popover with full date range selection
- **Modes**: Single date or date range selection
- **Visual**: Shows selected range in badge format
- **Limits**: 21-day future limit, unlimited past

### Filter Interface (Column 3)
- **Icon**: Filter icon with active count badge
- **Interface**: Popover with collapsible filter sections
- **Sections**: Leagues, Teams, Status, Predictions, Value Bets
- **Actions**: Clear all filters option
- **State**: Visual indicators for active filters

## 📦 Installation

The component is available in your project:

```typescript
import { UnifiedDateFilterRow } from '@/app/components/fixtures/UnifiedDateFilterRow';
```

## 🔧 Basic Usage

### 1. Simple Implementation

```tsx
import { UnifiedDateFilterRow } from '@/app/components/fixtures/UnifiedDateFilterRow';

function MyComponent({ fixtures }: { fixtures: Fixture[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  return (
    <UnifiedDateFilterRow
      fixtures={fixtures}
      filters={filters}
      onFiltersChange={setFilters}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
}
```

### 2. With Custom Configuration

```tsx
<UnifiedDateFilterRow
  fixtures={fixtures}
  filters={filters}
  onFiltersChange={setFilters}
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  maxPastDays={14}
  maxFutureDays={30}
  showSearch={true}
  showLeagueFilter={true}
  showTeamFilter={false}
  showStatusFilter={true}
  showDateFilter={true}
  showPredictionsFilter={true}
  showValueBetsFilter={true}
/>
```

## 📋 API Reference

### UnifiedDateFilterRow Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fixtures` | `Fixture[]` | - | Array of fixtures for filter options |
| `filters` | `FixtureFilters` | - | Current filter state |
| `onFiltersChange` | `(filters: FixtureFilters) => void` | - | Filter change callback |
| `selectedDate` | `string` | - | Currently selected date |
| `onDateChange` | `(date: string) => void` | - | Date change callback |
| `maxPastDays` | `number` | `7` | Maximum past days to show |
| `maxFutureDays` | `number` | `21` | Maximum future days to show |
| `showSearch` | `boolean` | `true` | Show search functionality |
| `showLeagueFilter` | `boolean` | `true` | Show league filter |
| `showTeamFilter` | `boolean` | `true` | Show team filter |
| `showStatusFilter` | `boolean` | `true` | Show status filter |
| `showDateFilter` | `boolean` | `true` | Show date range filter |
| `showPredictionsFilter` | `boolean` | `true` | Show predictions filter |
| `showValueBetsFilter` | `boolean` | `true` | Show value bets filter |
| `className` | `string` | - | Custom CSS class |

## 🎨 Layout Structure

### Horizontal Row Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [←] [12 Sep] [13 Sep] [14 Sep] [15 Sep] [→] │ [📅 Range] │ [🔍 Filters] │
│     ↑ Today     ↑ Selected                    │ ↑ Badge     │ ↑ Count      │
│     Column 1: Horizontal Date Picker          │ Column 2    │ Column 3     │
└─────────────────────────────────────────────────────────────────┘
```

### Column Details

#### Column 1: Date Picker
- **Navigation**: Chevron left/right buttons
- **Dates**: Horizontal scrollable list
- **Format**: "dd MMM" (e.g., "12 Sep", "1 Jan")
- **Selection**: Highlighted selected date
- **Today**: Special styling for current date

#### Column 2: Date Range
- **Trigger**: Calendar icon + "Range" text
- **Badge**: Shows selected range if active
- **Popover**: Unified date selector interface
- **Modes**: Single date or date range selection

#### Column 3: Filters
- **Trigger**: Filter icon + "Filters" text
- **Badge**: Shows active filter count
- **Popover**: Collapsible filter sections
- **Sections**: Expandable filter categories

## 🎭 User Experience

### Date Selection Flow
1. **Default State**: Today is highlighted and selected
2. **Navigation**: Use chevron buttons to scroll dates
3. **Selection**: Click any visible date to select
4. **Visual Feedback**: Selected date is highlighted

### Date Range Flow
1. **Open**: Click "Range" button to open popover
2. **Select**: Choose single date or date range
3. **Apply**: Click "Apply" to confirm selection
4. **Visual**: Range appears in badge on trigger button

### Filter Flow
1. **Open**: Click "Filters" button to open popover
2. **Configure**: Expand sections and set filters
3. **Visual**: Active count appears in badge
4. **Clear**: Use "Clear All Filters" button

## 📱 Mobile Optimization

### Responsive Design
- **Touch Targets**: Minimum 44px for all interactive elements
- **Scrollable**: Horizontal date picker scrolls on mobile
- **Popovers**: Full-screen popovers on small screens
- **Layout**: Adapts to screen width

### Touch Interactions
- **Swipe**: Horizontal swipe for date navigation
- **Tap**: Tap to select dates and open popovers
- **Gestures**: Native mobile gesture support

## 🔄 Integration

### With Existing Components
The UnifiedDateFilterRow is integrated into:
- **ReusableFixtureDisplay**: Replaces CompactSearchAndFilter
- **OptimizedReusableFixtureDisplay**: Updated to use new layout
- **All fixture display components**: Inherit new interface

### Backward Compatibility
- **API**: Maintains existing filter interface
- **State**: Compatible with existing filter state
- **Props**: All existing props supported

## 🎯 Benefits

### Design Consistency
- **Predictions Page**: Matches existing horizontal date picker
- **Unified Interface**: Same experience across all pages
- **Visual Hierarchy**: Clear separation of functionality

### User Experience
- **Familiar**: Users already know the predictions page interface
- **Efficient**: All controls in one horizontal row
- **Intuitive**: Icon-based interface with clear labels

### Development
- **Maintainable**: Single component for all date/filter needs
- **Flexible**: Configurable filter options
- **Reusable**: Works across different page contexts

## 🧪 Testing

Test the component with the demo page:

```
http://localhost:3000/demo/unified-date-filter-row
```

## 🚀 Performance

### Optimizations
- **Memoized**: Date range calculations are memoized
- **Efficient**: Only renders visible dates
- **Lazy**: Popovers only render when opened
- **Responsive**: Adapts to screen size changes

### Memory Management
- **Limited Range**: Only generates dates within specified range
- **Cleanup**: Proper cleanup of event listeners
- **State**: Efficient state management

## 🔧 Customization

### Styling
```tsx
<UnifiedDateFilterRow
  className="border-2 border-blue-500 rounded-xl"
  // ... other props
/>
```

### Date Range
```tsx
<UnifiedDateFilterRow
  maxPastDays={14}    // Show 2 weeks of past dates
  maxFutureDays={30}  // Show 1 month of future dates
  // ... other props
/>
```

### Filter Options
```tsx
<UnifiedDateFilterRow
  showLeagueFilter={true}
  showTeamFilter={false}  // Hide team filter
  showStatusFilter={true}
  // ... other props
/>
```

## 🐛 Troubleshooting

### Common Issues

1. **Dates not showing**: Check `maxPastDays` and `maxFutureDays` props
2. **Filters not working**: Ensure `onFiltersChange` callback is provided
3. **Date selection not updating**: Verify `onDateChange` callback
4. **Mobile issues**: Check touch target sizes and responsive classes

### Debug Mode

Enable console logging:
```tsx
<UnifiedDateFilterRow
  onDateChange={(date) => console.log('Date changed:', date)}
  onFiltersChange={(filters) => console.log('Filters changed:', filters)}
  // ... other props
/>
```

## 📈 Future Enhancements

- [ ] Preset date ranges (Today, This Week, This Month)
- [ ] Keyboard navigation for date picker
- [ ] Custom date formatting options
- [ ] Advanced filter combinations
- [ ] Filter presets and favorites
- [ ] Export/import filter configurations

## 🤝 Contributing

When extending the UnifiedDateFilterRow:

1. Maintain the three-column layout structure
2. Keep mobile responsiveness in mind
3. Follow existing naming conventions
4. Add proper TypeScript types
5. Include comprehensive tests
6. Update documentation

---

The UnifiedDateFilterRow provides a clean, consistent interface for date selection and filtering across all fixture display pages, combining the best of the predictions page design with modern filtering capabilities.
