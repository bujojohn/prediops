import { z } from 'zod';
import { type Type, TypeSchema } from './type.schema'; // Import actual Type schema and type
import { type PlayerStatistic, PlayerStatisticSchema } from './player-statistic.schema'; // Import actual PlayerStatistic schema and type

// --- Forward declare the PlayerStatisticDetail Type ---
// (This is not strictly necessary if PlayerStatisticDetail is only inferred, 
// but can be useful for clarity or if the type is used before the schema definition in some complex scenarios)
export type PlayerStatisticDetail = {
  id: number;
  player_statistic_id?: number | null;
  type_id: number;
  value?: number | string | boolean | null;
  // Relations
  type?: Type | null;
  statistic?: PlayerStatistic | null; 
};

export const PlayerStatisticDetailSchema: z.ZodType<PlayerStatisticDetail> = z.object({
  id: z.number().int(),
  player_statistic_id: z.number().int().nullable().optional(),
  type_id: z.number().int(), // Assuming type_id is always present for a detail record
  value: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(), // Statistic value can be of various types
  // Relations
  type: z.lazy(() => TypeSchema).nullable().optional(),
  statistic: z.lazy(() => PlayerStatisticSchema).nullable().optional(), // Relation to the parent PlayerStatistic
});

// Inferring the type from the schema is often preferred as the single source of truth.
// export type PlayerStatisticDetail = z.infer<typeof PlayerStatisticDetailSchema>;
// If the explicit type above is kept, ensure it stays in sync with the schema.
