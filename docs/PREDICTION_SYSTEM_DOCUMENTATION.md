# Prediction System Documentation

## Overview

The Prediops prediction system provides real-time visual indicators for football prediction accuracy. It dynamically styles prediction buttons based on match status and prediction success, offering users immediate feedback on their predictions' performance.

## Architecture

### Core Components

1. **Prediction Status Engine** (`lib/utils/prediction-status.ts`)
   - Calculates prediction success/failure status
   - Extracts match data (scores, events, periods)
   - Provides styling classes for UI components

2. **Market Mapping System** (`app/components/fixtures/FixturePredictionMarkets.tsx`)
   - Dynamically maps SportMonks API prediction types
   - Handles all prediction structures (3-way, Yes/No, HT/FT, etc.)
   - Provides searchable market selection

3. **Visual Styling System**
   - Green: Successful/succeeding predictions
   - Red: Failed/failing predictions  
   - Blue: Pending predictions
   - Gray: Non-highest probability options

## Prediction Status States

| State | Description | Visual Style |
|-------|-------------|--------------|
| `pending` | Match not started | Blue (highest probability) |
| `live` | Match in progress, status unknown | Gray |
| `succeeding` | Match in progress, prediction correct | Green (highest probability) |
| `success` | Match finished, prediction correct | Green (highest probability) |
| `failed` | Match finished, prediction incorrect | Red (highest probability) |

## Supported Prediction Types

### Three-Way Predictions
- **Full Time Result (1X2)**: Home Win / Draw / Away Win
- **First Half Winner**: HT Home Win / HT Draw / HT Away Win
- **Team To Score First**: Home / Draw / Away

### Yes/No Predictions
- **Both Teams To Score (BTTS)**: Yes / No
- **Over/Under Markets**: Over / Under (any threshold)
- **Clean Sheet**: Yes / No
- **Win to Nil**: Yes / No

### Complex Predictions
- **Half Time/Full Time**: All 9 combinations (1/1, 1/X, 1/2, etc.)
- **Correct Score**: Various score combinations
- **Dynamic Markets**: Any other prediction type from SportMonks API

## Data Sources

### Required API Includes
```typescript
include: 'participants;scores;state;predictions.type;league.country;periods.type;events.period;events.type;metadata.type'
```

### Key Data Points
- **Match State**: `fixture.state` (live, finished, etc.)
- **Scores**: `fixture.scores` (current, half-time)
- **Events**: `fixture.events` (goals, cards, substitutions)
- **Periods**: `fixture.periods` (first half, second half, etc.)
- **Participants**: `fixture.participants` (home/away team info)

## API Integration

### SportMonks API Endpoints
- `/fixtures/date/{date}` - Fixtures by date
- `/fixtures/live` - Live fixtures
- `/fixtures/date-country` - Country-specific fixtures

### Data Flow
1. Fetch fixtures with prediction includes
2. Map predictions to standardized market format
3. Calculate prediction status based on match data
4. Apply appropriate styling classes
5. Render with real-time updates

## Usage Examples

### Basic Implementation
```tsx
import { FixturePredictionMarkets } from '@/app/components/fixtures/FixturePredictionMarkets';

<FixturePredictionMarkets
  predictions={fixture.predictions}
  variant="desktop"
  fixture={fixture}
/>
```

### Styling Integration
```tsx
const style = getPredictionButtonStyle(prediction, fixture, optionCode, optionValue);
const className = cn(
  'prediction-button',
  style?.backgroundColor,
  style?.textColor,
  style?.borderColor
);
```

## Performance Optimizations

### Caching
- Search results cached for 5 minutes
- Market mapping memoized
- Render performance monitoring

### Responsive Design
- Mobile variant with horizontal scrolling
- Desktop variant with flexible layout
- Adaptive popover positioning

## Error Handling

### Fallback Strategies
- HT scores: Fallback to full-time scores
- Missing data: Graceful degradation
- API failures: Error boundaries and logging

### Logging
- Performance warnings for slow renders
- API error logging
- Prediction calculation warnings

## Future Enhancements

### Planned Features
- Statistics-based predictions (corners, cards)
- More granular live updates
- Prediction confidence indicators
- Historical performance tracking

### Extensibility
- Plugin system for new prediction types
- Custom styling themes
- Advanced filtering options

## Troubleshooting

### Common Issues
1. **Missing Markets**: Check API includes and prediction structure
2. **Styling Issues**: Verify fixture data and prediction status
3. **Performance**: Monitor render times and cache hits

### Debug Tools
- Console logging for prediction calculations
- Performance monitoring in development
- API response validation

## Contributing

### Code Standards
- TypeScript strict mode
- Comprehensive JSDoc comments
- Performance-first approach
- Mobile-responsive design

### Testing
- Unit tests for prediction logic
- Integration tests for API calls
- Visual regression tests for styling

---

*Last updated: December 2024*
*Version: 1.0.0*
