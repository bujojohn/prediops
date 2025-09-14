# API Limitations and Recent Changes

## Overview
This document tracks API limitations specific to the Prediops subscription and recent changes made to address these limitations.

## Venue Endpoint Limitation

### Issue
The `venue` include parameter is not available in the Prediops subscription, causing data fetching errors when included in API requests.

### Resolution
All `venue` include parameters have been removed from the codebase to prevent API failures.

### Files Modified
- `app/api/search/route.ts` - Removed venue from fixture search includes
- `lib/sportmonks.ts` - Updated interface comments
- `lib/validation/api-config.ts` - Updated validation schema examples
- All prediction pages already had venue removed

### Before/After Examples

#### Search API
```typescript
// Before (causing errors)
include: 'participants;league;venue'

// After (working)
include: 'participants;league'
```

#### Fixture API Calls
```typescript
// Before (causing errors)
include: 'participants;scores;state;predictions.type;league.country;venue;stage;round'

// After (working)
include: 'participants;scores;state;predictions.type;league.country;stage;round'
```

## Invalid Include Parameters

### Issue
Previous versions used invalid include parameters that are not supported by the Sportmonks API:
- `predictions.market`
- `predictions.outcomes`

### Resolution
These have been replaced with the correct parameter:
- `predictions.type`

### Files Affected
All prediction-related API calls now use the correct `predictions.type` parameter.

## Current Valid Include Parameters

### Fixtures
- `participants` - Team/participant information
- `scores` - Match scores and results
- `state` - Match state (live, finished, etc.)
- `predictions.type` - Prediction type information
- `league.country` - League and country details
- `stage` - Match stage information
- `round` - Match round information

### Countries
- `continent` - Continent information
- `leagues` - Associated leagues
- `regions` - Regional information

### Teams
- `country` - Country information
- `league` - League information
- `statistics` - Team statistics

## Subscription Limitations

### Available Endpoints
- ✅ Predictions API (`/predictions/probabilities`)
- ✅ Value Bets API (`/predictions/value-bets`)
- ✅ Live Scores API (`/livescores/inplay`, `/livescores/latest`)
- ✅ Fixtures API (`/fixtures`, `/fixtures/date/{date}`)
- ✅ Countries API (`/countries`, `/countries/{id}`)
- ✅ Leagues API (`/leagues`, `/leagues/countries/{id}`)
- ✅ Standings API (`/standings/seasons/{seasonId}`)

### Unavailable Endpoints
- ❌ Venue API (`/venues`) - Not included in Prediops subscription
- ❌ Head-to-Head API (`/fixtures/head-to-head`) - Suspended due to subscription limitations

## Best Practices

### 1. Always Test Include Parameters
Before using any include parameter, verify it's available in the current subscription.

### 2. Use Valid Parameters Only
Refer to the Sportmonks API documentation and this file for valid include parameters.

### 3. Handle API Errors Gracefully
Implement proper error handling for API calls that might fail due to subscription limitations.

### 4. Document Changes
When making changes to API calls, update this documentation to reflect the current state.

## Migration Guide

If you encounter API errors related to venue or invalid include parameters:

1. **Check include parameters** - Remove any `venue` references
2. **Verify parameter validity** - Use only parameters listed in this document
3. **Test API calls** - Ensure all API calls work with current subscription
4. **Update documentation** - Keep this file current with any changes

## Related Documentation
- [Sportmonks API Usage Guide](./SPORTMONKS_API_USAGE.md)
- [Sportmonks API Analysis](./SPORTMONKS_API_ANALYSIS.md)
- [Fixtures List Design](./FIXTURES_LIST_DESIGN.md)
