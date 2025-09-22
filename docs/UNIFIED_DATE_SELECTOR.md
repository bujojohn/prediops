# 📅 Unified Date Selector

A comprehensive date selection component that combines single date and date range selection capabilities with a modern, mobile-friendly interface.

## 🚀 Features

### Core Functionality
- **Single Date Selection**: Like the predictions page date picker
- **Date Range Selection**: Like the league predictions date range selector
- **Lightbox/Modal Interface**: Clean, focused selection experience
- **Mode Switching**: Toggle between single date and date range modes
- **Mobile-Friendly**: Touch-optimized with responsive design

### Date Constraints
- **Future Dates**: Limited to 21 days from current day (configurable)
- **Past Dates**: Unlimited selection (configurable, default 1 year)
- **Smart Validation**: Automatic date validation and error handling

### User Experience
- **Collapsed by Default**: All sections start collapsed to save space
- **No Descriptions**: Users infer functionality from icons and context
- **Immediate Feedback**: Real-time selection updates
- **Query Parameter Generation**: URL-friendly parameter generation
- **Reset Functionality**: Clear reset button to clear all selections
- **Persistent Modal**: Stays open until explicitly closed or backdrop clicked

## 📦 Installation

The component is already available in your project:

```typescript
import { UnifiedDateSelector } from '@/app/components/date-picker/UnifiedDateSelector';
import { useUnifiedDateSelector } from '@/app/components/date-picker/useUnifiedDateSelector';
```

## 🔧 Basic Usage

### 1. Simple Date Selection

```tsx
import { UnifiedDateSelector } from '@/app/components/date-picker/UnifiedDateSelector';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <UnifiedDateSelector
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      maxFutureDays={21}
      placeholder="Select date"
    />
  );
}
```

### 2. Date Range Selection

```tsx
import { UnifiedDateSelector } from '@/app/components/date-picker/UnifiedDateSelector';

function MyComponent() {
  const [selectedRange, setSelectedRange] = useState({
    from: null,
    to: null
  });

  return (
    <UnifiedDateSelector
      mode="range"
      selectedRange={selectedRange}
      onRangeChange={setSelectedRange}
      maxFutureDays={21}
      showModeSwitcher={true}
    />
  );
}
```

### 3. Using the Hook

```tsx
import { useUnifiedDateSelector } from '@/app/components/date-picker/useUnifiedDateSelector';

function MyComponent() {
  const dateSelector = useUnifiedDateSelector({
    initialMode: 'single',
    maxFutureDays: 21,
    onSelectionChange: ({ mode, date, range }) => {
      console.log('Selection changed:', { mode, date, range });
    },
  });

  return (
    <div>
      <UnifiedDateSelector
        mode={dateSelector.mode}
        selectedDate={dateSelector.selectedDate}
        selectedRange={dateSelector.selectedRange}
        onDateChange={dateSelector.setSelectedDate}
        onRangeChange={dateSelector.setSelectedRange}
        onModeChange={dateSelector.setMode}
        maxFutureDays={21}
        showModeSwitcher={true}
      />
      
      <div className="mt-4">
        <p>Current selection: {dateSelector.getDisplayText()}</p>
        <p>Query params: {JSON.stringify(dateSelector.getQueryParams())}</p>
      </div>
    </div>
  );
}
```

## 🎯 Integration with Search & Filters

The Unified Date Selector is integrated into the `CompactSearchAndFilter` component:

```tsx
// Automatically included in CompactSearchAndFilter
<CompactSearchAndFilter
  fixtures={fixtures}
  filters={filters}
  onFiltersChange={updateFilters}
  showDateFilter={true} // Enables the unified date selector
  // ... other props
/>
```

## 📋 API Reference

### UnifiedDateSelector Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedDate` | `string` | - | Current selected date (single mode) |
| `selectedRange` | `DateRange` | - | Current selected range (range mode) |
| `mode` | `'single' \| 'range'` | `'single'` | Current selection mode |
| `onDateChange` | `(date: string) => void` | - | Callback for date changes |
| `onRangeChange` | `(range: DateRange) => void` | - | Callback for range changes |
| `onModeChange` | `(mode: DateSelectionMode) => void` | - | Callback for mode changes |
| `maxFutureDays` | `number` | `21` | Maximum future days allowed |
| `maxPastDays` | `number` | `365` | Maximum past days allowed |
| `showModeSwitcher` | `boolean` | `true` | Show mode switcher buttons |
| `placeholder` | `string` | `"Select date"` | Placeholder text |
| `className` | `string` | - | Custom CSS class |
| `disabled` | `boolean` | `false` | Whether selector is disabled |

### useUnifiedDateSelector Hook

```typescript
interface UseUnifiedDateSelectorProps {
  initialMode?: DateSelectionMode;
  initialDate?: string;
  initialRange?: DateRange;
  maxFutureDays?: number;
  maxPastDays?: number;
  onSelectionChange?: (data: SelectionData) => void;
}

interface UseUnifiedDateSelectorReturn {
  mode: DateSelectionMode;
  selectedDate: string | undefined;
  selectedRange: DateRange;
  setMode: (mode: DateSelectionMode) => void;
  setSelectedDate: (date: string) => void;
  setSelectedRange: (range: DateRange) => void;
  getDisplayText: () => string;
  getQueryParams: () => Record<string, string>;
  hasValidSelection: () => boolean;
  reset: () => void;
  getDateLimits: () => DateLimits;
}
```

## 🎭 Modal Behavior

### Persistent Interface
The modal stays open until the user explicitly closes it:

- **Close Button**: Click "Close" button to dismiss modal
- **Backdrop Click**: Click outside the modal area to close
- **Reset Button**: Clear selections without closing modal
- **Apply Button**: Apply selections and close modal

### Reset Functionality
- **Reset Button**: Located in the footer, clears all temporary selections
- **Visual Feedback**: Reset button has a rotate icon for clear indication
- **Mode Reset**: Resets to single date mode when reset is clicked
- **Non-destructive**: Reset only affects temporary state, doesn't close modal

## 🎨 Styling

The component uses Tailwind CSS classes and follows the design system:

```tsx
// Custom styling example
<UnifiedDateSelector
  className="border-blue-500 focus:border-blue-600"
  // ... other props
/>
```

## 📱 Mobile Optimization

- **Touch Targets**: Minimum 44px touch targets
- **Responsive Layout**: Adapts to screen size
- **Modal Interface**: Full-screen modal on mobile
- **Gesture Support**: Swipe and tap interactions

## 🔄 State Management

The component manages its own internal state but can be controlled externally:

```tsx
// Controlled mode
<UnifiedDateSelector
  mode="range"
  selectedRange={controlledRange}
  onRangeChange={setControlledRange}
  // ... other props
/>

// Uncontrolled mode
<UnifiedDateSelector
  onRangeChange={(range) => {
    // Handle range changes
    console.log('New range:', range);
  }}
  // ... other props
/>
```

## 🌐 URL Integration

Generate query parameters for URL updates:

```tsx
const dateSelector = useUnifiedDateSelector();

// Get URL parameters
const queryParams = dateSelector.getQueryParams();
// Returns: { mode: 'single', date: '2024-01-15' }
// or: { mode: 'range', startDate: '2024-01-10', endDate: '2024-01-15' }

// Update URL
const url = new URL(window.location.href);
Object.entries(queryParams).forEach(([key, value]) => {
  url.searchParams.set(key, value);
});
window.history.pushState({}, '', url);
```

## 🧪 Testing

Test the component with the demo page:

```
http://localhost:3000/demo/unified-date-selector
```

## 🔧 Customization

### Custom Date Limits

```tsx
<UnifiedDateSelector
  maxFutureDays={30}  // Allow 30 days in future
  maxPastDays={90}    // Allow 90 days in past
  // ... other props
/>
```

### Custom Mode Switching

```tsx
<UnifiedDateSelector
  showModeSwitcher={false}  // Hide mode switcher
  mode="range"              // Force range mode
  // ... other props
/>
```

## 🚀 Performance

- **Memoized Components**: Prevents unnecessary re-renders
- **Efficient Date Calculations**: Optimized date range generation
- **Lazy Loading**: Calendar dates generated on demand
- **Debounced Updates**: Prevents excessive callback calls

## 🐛 Troubleshooting

### Common Issues

1. **Date not updating**: Ensure `onDateChange` or `onRangeChange` callbacks are provided
2. **Modal not opening**: Check if `disabled` prop is set to `true`
3. **Invalid dates**: Verify date format is `YYYY-MM-DD`

### Debug Mode

Enable debug logging:

```tsx
const dateSelector = useUnifiedDateSelector({
  onSelectionChange: ({ mode, date, range }) => {
    console.log('Date selector debug:', { mode, date, range });
  },
});
```

## 📈 Future Enhancements

- [ ] Time selection support
- [ ] Preset date ranges (Today, This Week, This Month)
- [ ] Keyboard navigation
- [ ] Accessibility improvements
- [ ] Multi-language support
- [ ] Custom date formatting

## 🤝 Contributing

When extending the Unified Date Selector:

1. Maintain backward compatibility
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Follow the existing code style

---

The Unified Date Selector provides a modern, flexible solution for all date selection needs in the application, combining the best of both single date and date range selection in a single, cohesive interface.
