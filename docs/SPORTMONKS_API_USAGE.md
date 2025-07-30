# Sportmonks API Usage Guide

## 1. Overview
The Sportmonks API provides football data for fixtures, predictions, value bets, live scores, and more. This project uses a centralized API client (`/lib/sportmonks.ts`) to interact with Sportmonks, and all external API calls are routed through Next.js API endpoints in `/app/api/sportmonks/`.

## 2. Configurable API Options
All API methods now support configurable options for includes, select, and filters:

### ApiConfig Interface
```typescript
interface ApiConfig {
  includes?: string[];        // Related data to include
  select?: string[];         // Specific fields to select
  filters?: Record<string, string | number>;  // Filter criteria
}
```

### Usage Examples
```typescript
// Use default configuration
const predictions = await sportmonks.getPredictions();

// Custom configuration
const predictions = await sportmonks.getPredictions({
  includes: ['fixture', 'type', 'participants'],
  filters: { predictionTypes: 237, leagues: 1 }
});

// Override specific options
const liveFixtures = await sportmonks.getLiveFixtures({
  includes: ['participants:name', 'scores', 'state', 'league']
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
- **Includes**: Used to fetch related/nested data in a single request (e.g., fixture details, participant names, scores, statistics).
- **Select**: Used to specify which fields to include in the response.
- **Filters**: Used to limit results by type, fixture, or other criteria (e.g., prediction type, fixture type).

### Commonly Used Includes
- `fixture`, `type`, `fixture:name`, `participants:name`, `scores`, `state`, `statistics`, `league`, `season`

### Commonly Used Filters
- `predictionTypes: 237`, `fixtureTypes: 1`, `leagues: [1,2,3]`, `seasons: [2024]`

## 5. Example API Calls

### Example: Get Live Fixtures (Default Configuration)
**Endpoint:** `/livescores/inplay?include=participants:name;scores;state`

**TypeScript Type:** [`Fixture`](../schemas/fixture.schema.ts)
**Zod Schema:** [`fixtureSchema`](../schemas/fixture.schema.ts)

**Usage:**
```typescript
const liveFixtures = await sportmonks.getLiveFixtures();
```

**Sample Response:**
```json
{
  "data": [
    {
      "id": 123,
      "participants": [{ "name": "Team A" }, { "name": "Team B" }],
      "scores": { /* ... */ },
      "state": { /* ... */ }
    }
  ]
}
```

### Example: Get Live Fixtures (Custom Configuration)
**Usage:**
```typescript
const liveFixtures = await sportmonks.getLiveFixtures({
  includes: ['participants:name', 'scores', 'state', 'league'],
  filters: { leagues: 1 }
});
```

### Example: Get Latest Live Scores
**Endpoint:** `/livescores/latest?include=participants:name;scores;state`

**TypeScript Type:** [`Fixture`](../schemas/fixture.schema.ts)
**Zod Schema:** [`fixtureSchema`](../schemas/fixture.schema.ts)

**Usage:**
```typescript
const latestScores = await sportmonks.getLatestLiveScores();
```

**Sample Response:**
```json
{
  "data": [
    {
      "id": 124,
      "participants": [{ "name": "Team C" }, { "name": "Team D" }],
      "scores": { /* ... */ },
      "state": { /* ... */ }
    }
  ]
}
```

### Example: Get Predictions (Default Configuration)
**Endpoint:** `/predictions/probabilities?include=fixture;type&filters=predictionTypes:237`

**TypeScript Type:** [`PredictionProbability`](../schemas/predictions.schema.ts)
**Zod Schema:** [`predictionsSchema`](../schemas/predictions.schema.ts)

**Usage:**
```typescript
const predictions = await sportmonks.getPredictions();
```

**Sample Response:**
```json
{
  "data": [
    {
      "id": 456,
      "fixture": { "id": 789, "name": "Fixture Name" },
      "type": { "id": 237, "name": "1X2" },
      /* ... */
    }
  ]
}
```

### Example: Get Predictions (Custom Configuration)
**Usage:**
```typescript
const predictions = await sportmonks.getPredictions({
  includes: ['fixture', 'type', 'participants'],
  filters: { predictionTypes: 237, leagues: [1, 2] }
});
```

### Example: Get Value Bets
**Endpoint:** `/predictions/value-bets?include=fixture:name`

**TypeScript Type:** [`ValueBet`](../schemas/valuebet.schema.ts)
**Zod Schema:** [`valueBetSchema`](../schemas/valuebet.schema.ts)

**Usage:**
```typescript
const valueBets = await sportmonks.getValueBets();
```

**Sample Response:**
```json
{
  "data": [
    {
      "id": 789,
      "fixture": { "name": "Fixture Name" },
      /* ... */
    }
  ]
}
```

## 6. Best Practices
- Use the centralized client in `/lib/sportmonks.ts` for all API calls.
- Always use includes to minimize the number of requests and fetch related data efficiently.
- Use filters to limit data to only what is needed for the UI.
- Leverage the configurable options to optimize API calls for specific use cases.
- Add new endpoints to the client and document them here, including the relevant TypeScript types and Zod schemas.
- Handle errors gracefully and use mock data for development/testing when the API is not available.

## 7. References
- [Sportmonks Football API Documentation](https://docs.sportmonks.com/football/)
- [Project Schemas Directory](../schemas/) 