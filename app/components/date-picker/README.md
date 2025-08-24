# 📅 Horizontal Date Picker Component

A smart, horizontal date picker component that provides immediate fixture loading with intelligent caching and preloading.

## 🚀 Features

- **Horizontal scroll** with compact date buttons
- **Smart date formatting**: Yesterday, Today, Tomorrow, Fri 12 Aug
- **Immediate loading** of fixtures when date is selected
- **Intelligent preloading** of adjacent dates
- **Caching system** for previously loaded dates
- **Responsive design** for all screen sizes
- **Navigation controls** for date range browsing

## 📦 Installation

The component is already available in your project at `app/components/date-picker/`.

## 🔧 Basic Usage

### 1. Wrap your app with the DatePickerProvider

```tsx
// app/layout.tsx or your main layout
import { DatePickerProvider } from '@/app/components/date-picker';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DatePickerProvider>
          {children}
        </DatePickerProvider>
      </body>
    </html>
  );
}
```

### 2. Use the HorizontalDatePicker component

```tsx
import { HorizontalDatePicker } from '@/app/components/date-picker';

function MyPage() {
  const handleDateSelect = (date: string) => {
    console.log('Selected date:', date);
    // Your logic to load fixtures for this date
  };

  return (
    <div>
      <HorizontalDatePicker
        onDateSelect={handleDateSelect}
        maxPastDays={10}
        maxFutureDays={14}
        showNavigation={true}
      />
      
      {/* Your fixtures display */}
    </div>
  );
}
```

### 3. Use the hook for fixture integration

```tsx
import { useDatePickerWithFixtures } from '@/app/components/date-picker';

function FixturesPage() {
  const {
    selectedDate,
    selectDate,
    fixtures,
    isLoading,
    error,
    refreshFixtures
  } = useDatePickerWithFixtures();

  return (
    <div>
      <HorizontalDatePicker onDateSelect={selectDate} />
      
      {isLoading && <div>Loading fixtures...</div>}
      {error && <div>Error: {error}</div>}
      {fixtures.length > 0 && (
        <div>
          <h3>Fixtures for {selectedDate}</h3>
          {fixtures.map(fixture => (
            <div key={fixture.id}>{fixture.id}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🎯 Advanced Usage

### Custom Date Range

```tsx
<HorizontalDatePicker
  maxPastDays={30}      // Show 30 days in the past
  maxFutureDays={60}    // Show 60 days in the future
  showNavigation={false} // Hide navigation arrows
/>
```

### Custom Styling

```tsx
<HorizontalDatePicker
  className="my-custom-class"
  onDateSelect={handleDateSelect}
/>
```

### Integration with Existing State

```tsx
function CustomPage() {
  const [myFixtures, setMyFixtures] = useState([]);
  
  const handleDateSelect = async (date: string) => {
    // Load fixtures for the selected date
    const response = await fetch(`/api/fixtures/${date}`);
    const data = await response.json();
    setMyFixtures(data);
  };

  return (
    <HorizontalDatePicker onDateSelect={handleDateSelect} />
  );
}
```

## 🔄 State Management

The component uses React Context for global state management:

- **Selected Date**: Currently selected date
- **Cached Dates**: Dates with fixtures already loaded
- **Preloaded Dates**: Dates marked for preloading
- **Loading States**: Loading status for each operation

## 📱 Responsive Behavior

- **Desktop**: Shows 8 dates at once with navigation arrows
- **Tablet**: Shows 6 dates at once
- **Mobile**: Shows 4 dates at once with horizontal scroll

## 🎨 Customization

### Date Button Styling

The `DateButton` component can be customized with:

- Different color schemes
- Custom date formats
- Status indicators (cached, preloaded)
- Hover effects

### Status Indicators

- 🟢 **Green dot**: Data is cached (loaded)
- 🔵 **Blue dot**: Data is preloaded
- No dot: Data not yet loaded

## 🧪 Testing

Test the component at `/test` page under the "📅 Date Picker" tab.

## 🔗 API Integration

The component expects a fixtures API endpoint:

```
GET /api/sportmonks/fixtures/date/{YYYY-MM-DD}?limit=50
```

Response format:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "starting_at": "2024-01-15T15:00:00Z",
      // ... other fixture properties
    }
  ]
}
```

## 🚀 Performance Features

- **Smart Caching**: Prevents duplicate API calls
- **Preloading**: Loads adjacent dates for smooth navigation
- **Lazy Loading**: Only loads dates when needed
- **Memory Management**: Efficient state updates

## 🔧 Troubleshooting

### Common Issues

1. **Provider not found**: Ensure `DatePickerProvider` wraps your component
2. **Dates not loading**: Check API endpoint and response format
3. **Navigation not working**: Verify `showNavigation` prop is true

### Debug Mode

Enable debug logging in development:

```tsx
// Check browser console for detailed logs
console.log('Date picker state:', useDatePicker());
```

## 📝 License

This component is part of your Prediops project.
