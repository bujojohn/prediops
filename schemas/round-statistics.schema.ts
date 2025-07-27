import { z } from 'zod';

// Forward declaration for RoundSchema to handle circular dependency
const RoundSchemaForwardRef = z.lazy(() => RoundSchema);

export type RoundStatistics = {
  id?: number | null; // Or round_id if it's a 1-to-1 extension of Round
  round_id?: number | null;
  // Example aggregated statistic fields - adjust based on actual API data
  num_fixtures?: number | null;
  num_goals?: number | null;
  avg_goals_per_match?: number | null;
  // Add other relevant aggregated statistics for a round

  // Relations
  round?: import('./round.schema').Round | null;
};

export const RoundStatisticsSchema: z.ZodType<RoundStatistics> = z.object({
  id: z.number().int().nullable().optional(),
  round_id: z.number().int().nullable().optional(),
  num_fixtures: z.number().int().nullable().optional(),
  num_goals: z.number().int().nullable().optional(),
  avg_goals_per_match: z.number().nullable().optional(),
  // Relations
  round: RoundSchemaForwardRef.nullable().optional(),
});

// Import actual RoundSchema to resolve the forward reference
import { RoundSchema } from './round.schema';
