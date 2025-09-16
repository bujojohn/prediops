# Sportmonks API Usage Guide

## 1. Overview
The Sportmonks API provides football data for fixtures, predictions, value bets, live scores, and more. We use a centralized API client (`/lib/sportmonks.ts`) and a hybrid data fetching strategy:

- Server Components may call the `sportmonks` client directly on the server for initial data (server-first).
- Client Components should access data via Next.js API routes under `/app/api/sportmonks/` and use React Query for caching and revalidation.

This approach keeps secrets safe, enables streaming/SSR for initial loads, and leverages client caching and background refresh where needed.

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

// Countries examples
const allCountries = await sportmonks.getCountries({
  includes: ['continent', 'leagues', 'regions']
});

const specificCountry = await sportmonks.getCountry('1', {
  includes: ['continent', 'leagues']
});

const searchCountries = await sportmonks.getCountriesBySearch('England', {
  includes: ['continent']
});

const allContinents = await sportmonks.getContinents({
  includes: ['countries']
});
```

## 3. Endpoints Used
| Endpoint                                      | Description                                 | Default Includes/Filters             | TypeScript Type(s) / Zod Schema(s)                |
|-----------------------------------------------|---------------------------------------------|--------------------------------------|---------------------------------------------------|
| `/predictions/probabilities`                  | Get predictions probabilities               | None | [`PredictionProbability`](../schemas/predictions.schema.ts), [`PredictionSchema`](../schemas/predictions.schema.ts) |
| `/predictions/value-bets`                     | Get value bets                              | None | [`ValueBet`](../schemas/valuebet.schema.ts), [`ValueBetSchema`](../schemas/valuebet.schema.ts) |
| `/livescores/inplay`                          | Get live fixtures                           | None | [`Fixture`](../schemas/fixture.schema.ts), [`FixtureSchema`](../schemas/fixture.schema.ts) |
| `/livescores/latest`                          | Get latest live scores                      | None | [`Fixture`](../schemas/fixture.schema.ts), [`FixtureSchema`](../schemas/fixture.schema.ts) |
| `/fixtures` (with `filters=todayDate`)        | Upcoming fixtures for today (Predictions)   | None | [`Fixture`](../schemas/fixture.schema.ts), [`FixtureSchema`](../schemas/fixture.schema.ts) |
| `/predictions/probabilities/fixtures/{id}`    | Get predictions for a specific fixture      | None                                 | [`PredictionProbability`](../schemas/predictions.schema.ts), [`predictionsSchema`](../schemas/predictions.schema.ts) |
| `/fixtures`                                   | Get upcoming fixtures                       | None | [`Fixture`](../schemas/fixture.schema.ts), [`FixtureSchema`](../schemas/fixture.schema.ts) |
| `/standings/seasons/{seasonId}`               | Get league standings                        | `league;round;group;stage;form;details.type;rule.type:name;participant` | [`Standing`](../schemas/standing.schema.ts), [`standingSchema`](../schemas/standing.schema.ts) |
| `/teams/{teamId}`                             | Get team statistics                         | None | [`TeamStatistics`](../schemas/team-statistics.schema.ts), [`teamStatisticsSchema`](../schemas/team-statistics.schema.ts) |
| `/leagues/{leagueId}`                         | Get league information                      | `country;currentseason` | [`League`](../schemas/league.schema.ts), [`leagueSchema`](../schemas/league.schema.ts) |
| `/fixtures` (with date range filters)        | Get fixtures by date range                  | `participants;scores;state;predictions.type;league.country` | [`Fixture`](../schemas/fixture.schema.ts), [`FixtureSchema`](../schemas/fixture.schema.ts) |
| `/countries`                                   | Get all countries                          | None                                 | [`Country`](../schemas/country.schema.ts), [`countrySchema`](../schemas/country.schema.ts) |
| `/countries/{id}`                              | Get specific country                       | None                                 | [`Country`](../schemas/country.schema.ts), [`countrySchema`](../schemas/country.schema.ts) |
| `/countries/search/{query}`                    | Get countries by search                     | None                                 | [`Country`](../schemas/country.schema.ts), [`countrySchema`](../schemas/country.schema.ts) |
| `/continents`                                  | Get all continents                         | None                                 | [`Continent`](../schemas/continent.schema.ts), [`continentSchema`](../schemas/continent.schema.ts) |
| `/continents/{id}`                             | Get specific continent                      | None                                 | [`Continent`](../schemas/continent.schema.ts), [`continentSchema`](../schemas/continent.schema.ts) |

## 4. Includes & Filters
- **Includes**: Used to fetch related/nested data in a single request (e.g., fixture details, participant names, scores, statistics). Use colon syntax for field selection (e.g., `participants:name,image_path`).
- **Select**: Used to select specific fields on the base entity (e.g., `['name', 'id']`).
- **Filters**: Used to limit results by type, fixture, or other criteria. Supports three formats:
  - **String filters**: Simple filters like `'todayDate'`, `'upcoming'`
  - **Key-value filters**: Complex filters like `{ predictionTypes: 237, leagues: [1,2,3] }`
  - **Combined filters**: A combination of string and key-value filters, e.g., `['todayDate', { eventTypes: [23, 34] }]`

### Commonly Used Includes
- `fixture`, `type`, `fixture:name`, `participants:name`, `scores`, `state`, `statistics`, `league`, `season`
- `continent`, `leagues`, `regions` (for countries)
- `countries` (for continents)

**Note**: `venue` include parameter is not available in Prediops subscription and should not be used.

### Commonly Used Select Fields
- `name`, `id`, `starting_at`, `result_info`, `length`, `has_odds`
- `name`, `official_name`, `fifa_name`, `iso2`, `iso3`, `latitude`, `longitude`, `image_path` (for countries)
- `name`, `code` (for continents)

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

### Example: Get Countries with Includes
**Usage:**
```typescript
const countriesWithIncludes = await sportmonks.getCountries({
  includes: ['continent', 'leagues', 'regions'],
  select: ['name', 'iso2', 'iso3', 'image_path']
});
```

**Resulting URL:** `/countries?include=continent;leagues;regions&select=name,iso2,iso3,image_path`

### Example: Get Specific Country
**Usage:**
```typescript
const england = await sportmonks.getCountry('1', {
  includes: ['continent', 'leagues'],
  select: ['name', 'official_name', 'fifa_name', 'iso2', 'iso3']
});
```

**Resulting URL:** `/countries/1?include=continent;leagues&select=name,official_name,fifa_name,iso2,iso3`

### Example: Search Countries
**Usage:**
```typescript
const searchResults = await sportmonks.getCountriesBySearch('United', {
  includes: ['continent'],
  select: ['name', 'iso2', 'iso3']
});
```

**Resulting URL:** `/countries/search/United?include=continent&select=name,iso2,iso3`

## 6. League Page API Usage

### League Information
**Usage:**
```typescript
const league = await sportmonks.getLeagueById(leagueId, {
  includes: ['country', 'currentseason']
});
```

**Resulting URL:** `/leagues/{leagueId}?include=country;currentseason`

### League Standings
**Usage:**
```typescript
const standings = await sportmonks.getLeagueStandings(seasonId, {
  includes: ['league', 'round', 'group', 'stage', 'form', 'details.type', 'rule.type:name', 'participant'],
  filters: { standingLeagues: leagueId }
});
```

**Resulting URL:** `/standings/seasons/{seasonId}?include=league;round;group;stage;form;details.type;rule.type:name;participant&filters=standingLeagues:{leagueId}`

### League Fixtures by Date Range
**Usage:**
```typescript
const fixtures = await sportmonks.getFixturesByDateRange(startDate, endDate, {
  includes: ['participants', 'scores', 'state', 'predictions.type', 'league.country'],
  filters: { fixtureLeagues: leagueId },
  per_page: 50
});
```

**Resulting URL:** `/fixtures?include=participants;scores;state;predictions.type;league.country&filters=fixtureLeagues:{leagueId}&per_page=50&dateFrom={startDate}&dateTo={endDate}`

### Data Structure for Standings
The standings API returns data in this structure:
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

### Helper Functions for Standings Data
```typescript
// Extract specific statistics from details array
function getStandingStat(details: unknown[], statType: string): number | null {
  if (!Array.isArray(details)) return null;
  const stat = details.find((d: unknown) => {
    const detail = d as { type?: { code?: string }; value?: number };
    return detail.type?.code === statType;
  });
  return (stat as { value?: number })?.value ?? null;
}

// Convert form array to string
function getFormString(formArray: unknown[] | string | null | undefined): string {
  if (typeof formArray === 'string') return formArray;
  if (!Array.isArray(formArray)) return '';
  return formArray
    .sort((a: unknown, b: unknown) => {
      const aOrder = (a as { sort_order?: number }).sort_order || 0;
      const bOrder = (b as { sort_order?: number }).sort_order || 0;
      return aOrder - bOrder;
    })
    .map((f: unknown) => (f as { form?: string }).form || '')
    .join('');
}
```

### Common Stat Type Codes
- `overall-matches-played`: Games played
- `overall-won`: Wins
- `overall-draw`: Draws
- `overall-lost`: Losses
- `overall-goals-for`: Goals for
- `overall-goals-against`: Goals against
- `goal-difference`: Goal difference