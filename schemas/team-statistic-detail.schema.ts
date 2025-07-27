import { z } from 'zod';
import { type Type, TypeSchema } from './type.schema';
// Import the correct schema name from team-statistics.schema.ts
import { type TeamStatistics, TeamStatisticsSchema } from './team-statistics.schema';

// Forward declaration for TeamStatisticsSchema to handle circular dependency
const TeamStatisticsSchemaForwardRef = z.lazy(() => TeamStatisticsSchema);

export type TeamStatisticDetail = {
  id: number;
  team_statistic_id?: number | null; // Foreign key to the parent TeamStatistics record
  type_id?: number | null;
  value?: number | string | boolean | null;
  // Relations
  type?: Type | null;
  statistic?: TeamStatistics | null; // Use the imported TeamStatistics type
};

export const TeamStatisticDetailSchema: z.ZodType<TeamStatisticDetail> = z.object({
  id: z.number().int(),
  team_statistic_id: z.number().int().nullable().optional(),
  type_id: z.number().int().nullable().optional(),
  value: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  // Relations
  type: z.lazy(() => TypeSchema).nullable().optional(),
  statistic: TeamStatisticsSchemaForwardRef.nullable().optional(), // Use the corrected forward ref
});

// The explicit type TeamStatisticDetail is defined above.
// Ensure it stays in sync with the schema or prefer inferring it:
// export type TeamStatisticDetail = z.infer<typeof TeamStatisticDetailSchema>;
