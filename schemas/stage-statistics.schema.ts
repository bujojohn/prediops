import { z } from 'zod';

// Forward declaration for StageSchema to handle circular dependency
const StageSchemaForwardRef = z.lazy(() => StageSchema);

export type StageStatistics = {
  id?: number | null; // Or stage_id if it's a 1-to-1 extension of Stage
  stage_id?: number | null;
  // Example statistic fields - adjust based on actual API data
  num_fixtures?: number | null;
  num_goals?: number | null;
  avg_goals_per_match?: number | null;
  // Add other relevant aggregated statistics for a stage

  // Relations
  stage?: import('./stage.schema').Stage | null;
};

export const StageStatisticsSchema: z.ZodType<StageStatistics> = z.object({
  id: z.number().int().nullable().optional(),
  stage_id: z.number().int().nullable().optional(),
  num_fixtures: z.number().int().nullable().optional(),
  num_goals: z.number().int().nullable().optional(),
  avg_goals_per_match: z.number().nullable().optional(),
  // Relations
  stage: StageSchemaForwardRef.nullable().optional(),
});

// Import actual StageSchema to resolve the forward reference
import { StageSchema } from './stage.schema';
