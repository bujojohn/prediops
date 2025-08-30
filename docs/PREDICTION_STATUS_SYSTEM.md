# Prediction Status System

## Overview

The Prediction Status System provides real-time tracking of prediction success, succeeding, and failed states for sports fixtures. It allows users to visually understand the current status of their predictions and track their performance over time.

## Features

### 🎯 **Status Categories**
- **🟢 Success** - Prediction was correct
- **🟡 Succeeding** - Prediction is currently on track (e.g., team leading when predicted to win)
- **🔴 Failed** - Prediction was incorrect or is no longer achievable
- **⚪ Pending** - Match hasn't started yet
- **🔄 Live** - Match is in progress

### 📊 **Real-time Updates**
- Automatic status updates based on match progress
- Configurable update intervals (10s, 30s, 1min, 5min)
- Live confidence scoring for in-progress matches
- WebSocket-ready architecture for instant updates

### 🎨 **Visual Indicators**
- Color-coded status badges with icons
- Confidence percentage displays
- Current match state indicators
- Responsive design for all devices

## Architecture

### Core Components

#### 1. **Prediction Status Utility** (`lib/utils/prediction-status.ts`)
```typescript
export function calculatePredictionStatus(
  prediction: Prediction,
  fixture: Fixture
): PredictionStatusResult
```

**Features:**
- Analyzes fixture state (scheduled, live, finished)
- Calculates prediction success based on current match state
- Supports multiple prediction types (winner, over/under, BTTS)
- Provides confidence scoring for live matches

#### 2. **Status Badge Component** (`app/components/predictions/PredictionStatusBadge.tsx`)
```typescript
<PredictionStatusBadge status="success" />
<PredictionStatusWithConfidence 
  status="live" 
  confidence={75} 
  currentValue="2-1" 
/>
```

**Features:**
- Compact and full-size variants
- Icon and text display options
- Confidence and current value display
- Consistent styling with design system

#### 3. **Enhanced Prediction Card** (`app/components/predictions/EnhancedPredictionCard.tsx`)
```typescript
<EnhancedPredictionCard
  prediction={prediction}
  fixture={fixture}
/>
```

**Features:**
- Complete prediction information display
- Real-time score updates
- Status indicator in top-right corner
- Match metadata (time, status, teams)
- Prediction probabilities breakdown

#### 4. **Status Dashboard** (`app/components/predictions/PredictionStatusDashboard.tsx`)
```typescript
<PredictionStatusDashboard
  predictions={predictions}
  fixtures={fixtures}
/>
```

**Features:**
- Summary statistics by status
- Filtering by prediction status
- Grid layout of all predictions
- Real-time status updates

#### 5. **Real-time Hook** (`hooks/usePredictionStatus.ts`)
```typescript
const {
  predictionsWithStatus,
  isUpdating,
  refresh,
  getLivePredictions
} = usePredictionStatus(predictions, fixtures, {
  updateInterval: 30000,
  enableRealTime: true
});
```

**Features:**
- Automatic status updates
- Configurable update intervals
- Status change callbacks
- Performance-optimized updates

## Usage Examples

### Basic Status Badge
```tsx
import { PredictionStatusBadge } from '@/components/predictions/PredictionStatusBadge';

<PredictionStatusBadge status="success" />
<PredictionStatusBadge status="live" compact={true} />
```

### Enhanced Prediction Card
```tsx
import { EnhancedPredictionCard } from '@/components/predictions/EnhancedPredictionCard';

<EnhancedPredictionCard
  prediction={prediction}
  fixture={fixture}
  className="w-full"
/>
```

### Status Dashboard
```tsx
import { PredictionStatusDashboard } from '@/components/predictions/PredictionStatusDashboard';

<PredictionStatusDashboard
  predictions={predictions}
  fixtures={fixtures}
/>
```

### Real-time Hook
```tsx
import { usePredictionStatus } from '@/hooks/usePredictionStatus';

function MyComponent() {
  const {
    predictionsWithStatus,
    refresh,
    getLivePredictions
  } = usePredictionStatus(predictions, fixtures, {
    updateInterval: 15000, // 15 seconds
    enableRealTime: true
  });

  const livePredictions = getLivePredictions();
  
  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      {livePredictions.map(item => (
        <PredictionCard key={item.prediction.id} {...item} />
      ))}
    </div>
  );
}
```

## Prediction Types Supported

### 1. **Full Time Result** (`fulltime-result-probability`)
- Home win, draw, away win predictions
- Status based on final score comparison
- Live status during match progression

### 2. **Over/Under Goals** (`over-under-X_5-probability`)
- Over/under threshold predictions
- Real-time goal counting
- Status updates as goals are scored

### 3. **Both Teams to Score** (`both-teams-to-score-probability`)
- Yes/No predictions for both teams scoring
- Live tracking of team goals
- Status updates throughout the match

### 4. **Custom Prediction Types**
- Extensible system for new prediction types
- Generic status calculation framework
- Easy integration of new sports or markets

## Status Calculation Logic

### Pending Status
- Fixture state: "Scheduled", "Not Started"
- Confidence: 0%
- No current value

### Live Status
- Fixture state: "Live", "In-play"
- Confidence: 25-90% (based on match progress)
- Current value: Live score or match state

### Succeeding Status
- Prediction is currently on track
- Example: Predicted home win, home team currently leading
- Confidence: Based on match time and current state

### Success Status
- Fixture state: "Finished", "Full-time"
- Prediction was correct
- Confidence: 100%
- Final result displayed

### Failed Status
- Fixture state: "Finished"
- Prediction was incorrect
- Confidence: 0%
- Final result displayed

## Configuration Options

### Update Intervals
```typescript
const options = {
  updateInterval: 30000, // 30 seconds
  enableRealTime: true,
  onStatusChange: (predictionId, status) => {
    // Custom status change handler
  }
};
```

### Status Display Customization
```typescript
// Custom colors and icons
export function getStatusDisplay(status: PredictionStatus) {
  switch (status) {
    case 'success':
      return {
        label: 'Correct!',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        icon: '🎯'
      };
    // ... other statuses
  }
}
```

## Performance Considerations

### Optimization Strategies
- **Memoized Calculations**: Status calculations are memoized to prevent unnecessary re-computations
- **Batch Updates**: Multiple predictions are updated in batches
- **Conditional Rendering**: Components only re-render when their specific data changes
- **Efficient Filtering**: Status-based filtering uses optimized data structures

### Memory Management
- **Cleanup Intervals**: Automatic cleanup of update intervals
- **Reference Stability**: Stable references for callback functions
- **Garbage Collection**: Proper cleanup of event listeners and timers

## Integration Guide

### 1. **Install Dependencies**
```bash
npm install lucide-react
```

### 2. **Import Components**
```typescript
import { PredictionStatusBadge } from '@/components/predictions/PredictionStatusBadge';
import { EnhancedPredictionCard } from '@/components/predictions/EnhancedPredictionCard';
import { PredictionStatusDashboard } from '@/components/predictions/PredictionStatusDashboard';
```

### 3. **Set Up Data**
```typescript
// Ensure your data matches the expected schemas
const predictions: Prediction[] = [...];
const fixtures: Fixture[] = [...];
```

### 4. **Implement Real-time Updates**
```typescript
const { predictionsWithStatus } = usePredictionStatus(
  predictions, 
  fixtures, 
  { updateInterval: 30000 }
);
```

### 5. **Display Components**
```tsx
// Individual status badges
<PredictionStatusBadge status="success" />

// Full prediction cards
<EnhancedPredictionCard prediction={pred} fixture={fix} />

// Complete dashboard
<PredictionStatusDashboard predictions={preds} fixtures={fixs} />
```

## Demo Page

Visit `/prediction-status-demo` to see the system in action with:
- Interactive controls for real-time updates
- Sample data demonstrating all status types
- Live status calculations
- Performance metrics
- Component showcase

## Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time updates from live data feeds
- **Historical Tracking**: Prediction performance over time
- **Advanced Analytics**: Success rate trends and insights
- **Mobile Notifications**: Push notifications for status changes
- **Custom Status Types**: User-defined prediction categories

### Extension Points
- **Custom Status Logic**: Plugin system for new prediction types
- **Third-party Integrations**: External data source connectors
- **Advanced UI Components**: Charts, graphs, and visualizations
- **Multi-language Support**: Internationalization for status labels

## Troubleshooting

### Common Issues

#### Status Not Updating
- Check if `enableRealTime` is set to `true`
- Verify `updateInterval` is not set to 0
- Ensure fixture data includes current state information

#### Performance Issues
- Reduce `updateInterval` for better performance
- Implement virtual scrolling for large prediction lists
- Use `React.memo` for expensive components

#### Type Errors
- Ensure all data matches the expected schemas
- Check import paths for components and utilities
- Verify TypeScript configuration

### Debug Mode
```typescript
// Enable debug logging
const { predictionsWithStatus } = usePredictionStatus(
  predictions, 
  fixtures, 
  { 
    onStatusChange: (id, status) => {
      console.log(`Prediction ${id}:`, status);
    }
  }
);
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Visit demo page: `/prediction-status-demo`

### Code Standards
- Follow TypeScript best practices
- Use consistent naming conventions
- Implement proper error handling
- Add comprehensive tests
- Document all public APIs

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- --testPathPattern=prediction-status
```

## License

This prediction status system is part of the Prediops application and follows the same licensing terms.
