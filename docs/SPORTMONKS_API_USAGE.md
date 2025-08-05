# Sportmonks API Usage Guide

## 1. Overview
The Sportmonks API provides football data for fixtures, predictions, value bets, live scores, and more. This project uses a centralized API client (`/lib/sportmonks.ts`) to interact with Sportmonks, and all external API calls are routed through Next.js API endpoints in `/app/api/sportmonks/`.

## 2. Configurable API Options
All API methods now support configurable options for includes, select, and filters:

### ApiConfig Interface
```typescript
interface ApiConfig {
  includes?: string[];        // Related data to include (use colon syntax for field selection)
  select?: string[];         // Select specific fields on the base entity
  filters?: Record<string, string | number> | string | (Record<string, string | number> | string)[];  // Filter criteria (key-value, simple string, or combined)
  order?: 'asc' | 'desc';    // Basic ordering (ascending or descending)
  sortBy?: string;           // Custom sorting field (e.g., 'starting_at', 'name')
  page?: number;             // Page number for pagination (default: 1)
  per_page?: number;         // Results per page (range 1-50, default: 25)
  populate?: boolean;        // Use _filters=populate_ for higher pagination limit (max 1000)
}
```

### Usage Examples
```typescript
// Use default configuration
const predictions = await sportmonks.getPredictions();

// Custom configuration with key-value filters
const predictions = await sportmonks.getPredictions({
  includes: ['fixture', 'type', 'participants'],
  filters: { predictionTypes: 237, leagues: 1 }
});

// Custom configuration with string filters
const fixtures = await sportmonks.getUpcomingFixtures({
  includes: ['participants:name', 'scores', 'state'],
  filters: 'todayDate'
});

// Custom configuration with field selection
const fixturesWithSelect = await sportmonks.getUpcomingFixtures({
  select: ['name', 'starting_at', 'has_odds'],
  includes: ['participants:name']
});

// Custom configuration with combined filters
const fixtures = await sportmonks.getUpcomingFixtures({
  includes: ['participants:name', 'scores', 'state'],
  filters: ['todayDate', { eventTypes: [23, 34] }]
});

// Custom configuration with ordering and sorting
const sortedFixtures = await sportmonks.getUpcomingFixtures({
  includes: ['participants:name', 'scores', 'state'],
  sortBy: 'starting_at',
  order: 'desc'
});

// Combined configuration with filters, ordering, and sorting
const filteredAndSortedFixtures = await sportmonks.getUpcomingFixtures({
  includes: ['participants:name', 'scores', 'state'],
  filters: { leagues: [1, 2] },
  sortBy: 'name',
  order: 'asc'
});

// Override specific options
const liveFixtures = await sportmonks.getLiveFixtures({
  includes: ['participants:name', 'scores', 'state', 'league']
});

// Pagination examples
const page2Fixtures = await sportmonks.getUpcomingFixtures({
  page: 2,
  per_page: 50
});

const populateFixtures = await sportmonks.getUpcomingFixtures({
  populate: true, // Higher pagination limit (max 1000)
  per_page: 1000
});
```

## 3. Endpoints Used
| Endpoint                                      | Description                                 | Default Includes/Filters             | TypeScript Type(s) / Zod Schema(s)                |
|-----------------------------------------------|---------------------------------------------|--------------------------------------|---------------------------------------------------|
| `/predictions/probabilities`                  | Get predictions probabilities               | `includes: ['fixture', 'type']`, `filters: { predictionTypes: 237 }` | [`PredictionProbability`](../schemas/predictions.schema.ts), [`predictionsSchema`](../schemas/predictions.schema.ts) |
| `/predictions/value-bets`                     | Get value bets                              | `includes: ['fixture:name']`        | [`ValueBet`](../schemas/valuebet.schema.ts), [`valueBetSchema`](../schemas/valuebet.schema.ts) |
| `/livescores/inplay`                          | Get live fixtures                           | `includes: ['participants:name', 'scores', 'state']` | [`Fixture`](../schemas/fixture.schema.ts), [`fixtureSchema`](../schemas/fixture.schema.ts) |
| `/livescores/latest`                          | Get latest live scores                      | `includes: ['participants:name', 'scores', 'state']` | [`Fixture`](../schemas/fixture.schema.ts), [`fixtureSchema`](../schemas/fixture.schema.ts) |
| `/predictions/probabilities/fixtures/{id}`    | Get predictions for a specific fixture      | None                                 | [`PredictionProbability`](../schemas/predictions.schema.ts), [`predictionsSchema`](../schemas/predictions.schema.ts) |
| `/fixtures`                                   | Get upcoming fixtures                       | `includes: ['participants', 'scores', 'state']`, `filters: { fixtureTypes: 1 }` | [`Fixture`](../schemas/fixture.schema.ts), [`fixtureSchema`](../schemas/fixture.schema.ts) |
| `/standings/seasons/{seasonId}`               | Get league standings                        | None                                 | [`Standing`](../schemas/standing.schema.ts), [`standingSchema`](../schemas/standing.schema.ts) |
| `/teams/{teamId}`                             | Get team statistics                         | `includes: ['statistics']`           | [`TeamStatistics`](../schemas/team-statistics.schema.ts), [`teamStatisticsSchema`](../schemas/team-statistics.schema.ts) |

## 4. Includes & Filters
- **Includes**: Used to fetch related/nested data in a single request (e.g., fixture details, participant names, scores, statistics). Use colon syntax for field selection (e.g., `participants:name,image_path`).
- **Select**: Used to select specific fields on the base entity (e.g., `['name', 'id']`).
- **Filters**: Used to limit results by type, fixture, or other criteria. Supports three formats:
  - **String filters**: Simple filters like `'todayDate'`, `'upcoming'`
  - **Key-value filters**: Complex filters like `{ predictionTypes: 237, leagues: [1,2,3] }`
  - **Combined filters**: A combination of string and key-value filters, e.g., `['todayDate', { eventTypes: [23, 34] }]`

### Commonly Used Includes
- `fixture`, `type`, `fixture:name`, `participants:name`, `scores`, `state`, `statistics`, `league`, `season`

### Commonly Used Select Fields
- `name`, `id`, `starting_at`, `result_info`, `length`, `has_odds`

### Commonly Used Filters
- **String filters**: `'todayDate'`, `'upcoming'`, `'finished'`
- **Key-value filters**: `predictionTypes: 237`, `fixtureTypes: 1`, `leagues: [1,2,3]`, `seasons: [2024]`
- **Combined filters**: `['todayDate', { eventTypes: [23, 34] }]`, `['upcoming', { leagues: [1, 2] }]`

### Ordering & Sorting
- **Basic Ordering**: Use `order: 'asc'` or `order: 'desc'` for ascending/descending order
- **Custom Sorting**: Use `sortBy: 'field_name'` to sort by specific fields (e.g., `'starting_at'`, `'name'`)
- **Combined Usage**: Use both `sortBy` and `order` together for custom sorted results

#### Supported Sorting Fields
- **Fixtures**: `starting_at`, `name`
- **All Entities**: `name` (alphabetical sorting)
- **Note**: Unsupported fields will return a 400 Bad Request error

### Pagination
- **Page Navigation**: Use `page: 2` to navigate to specific pages (default: 1)
- **Results Per Page**: Use `per_page: 50` to control results per page (range 1-50, default: 25)
- **Initial Data Load**: Use `populate: true` for higher pagination limit (max 1000) - **Note**: Includes are disabled when using populate
- **Response Object**: Pagination responses include `count`, `per_page`, `current_page`, `next_page`, `has_more`

#### Pagination Response Structure
```json
{
  "data": [...],
  "pagination": {
    "count": 25,
    "per_page": 25,
    "current_page": 1,
    "next_page": "https://api.sportmonks.com/v3/football/fixtures?page=2",
    "has_more": true
  }
}
```

## 5. Example API Calls
```
```

**Resulting URL:** `/fixtures?include=participants:name;scores;state&filters=leagues:1,2&sortBy=name&order=asc`

### Example: Get Fixtures with Pagination
**Usage:**
```typescript
const page2Fixtures = await sportmonks.getUpcomingFixtures({
  page: 2,
  per_page: 50,
  includes: ['participants:name', 'scores']
});
```

**Resulting URL:** `/fixtures?page=2&per_page=50&include=participants:name;scores`

### Example: Get Fixtures with Populate Filter (Initial Data Load)
**Usage:**
```typescript
const populateFixtures = await sportmonks.getUpcomingFixtures({
  populate: true, // Higher pagination limit (max 1000)
  per_page: 1000,
  filters: { leagues: [1, 2] }
});
```

**Resulting URL:** `/fixtures?_filters=populate_&per_page=1000&filters=leagues:1,2`

**Note:** When using `populate: true`, includes are disabled to prevent service overload.