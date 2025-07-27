import { z } from 'zod';

// Forward declaration for SeasonSchema to handle circular dependency
const SeasonSchemaForwardRef = z.lazy(() => SeasonSchema);

export type SeasonStatistics = {
  id?: number | null; // Or season_id if it's a 1-to-1 extension of Season
  season_id?: number | null;
  // Example aggregated statistic fields - adjust based on actual API data
  num_teams?: number | null;
  num_fixtures?: number | null;
  num_goals?: number | null;
  avg_goals_per_match?: number | null;
  avg_cards_per_match?: number | null;
  // Add other relevant aggregated statistics for a season

  // Relations
  season?: import('./season.schema').Season | null;
};

export const SeasonStatisticsSchema: z.ZodType<SeasonStatistics> = z.object({
  id: z.number().int().nullable().optional(),
  season_id: z.number().int().nullable().optional(),
  num_teams: z.number().int().nullable().optional(),
  num_fixtures: z.number().int().nullable().optional(),
  num_goals: z.number().int().nullable().optional(),
  avg_goals_per_match: z.number().nullable().optional(),
  avg_cards_per_match: z.number().nullable().optional(),
  // Relations
  season: SeasonSchemaForwardRef.nullable().optional(),
});

// Import actual SeasonSchema to resolve the forward reference
import { SeasonSchema } from './season.schema';
