import { z } from "zod";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type

// Forward declaration for CoachStatisticSchema to handle circular dependency
const CoachStatisticSchemaForwardRef = z.lazy(() => CoachStatisticSchema);

// --- Forward declare the CoachStatisticDetail Type ---
export type CoachStatisticDetail = {
  id?: number | null; 
  statistic_id?: number | null; 
  type_id?: number | null; 
  value?: number | string | boolean | null; 

  // Relations
  statistic?: import("./coach-statistic.schema").CoachStatistic | null; // Use actual CoachStatistic type
  type?: Type | null; // Use actual Type
};

// --- Main CoachStatisticDetail Schema ---
export const CoachStatisticDetailSchema: z.ZodType<CoachStatisticDetail> = z.object({
  id: z.number().int().nullable().optional(),
  statistic_id: z.number().int().nullable().optional(), // Foreign key to CoachStatisticSchema
  type_id: z.number().int().nullable().optional(),      // Foreign key to TypeSchema
  value: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),

  // Relations
  statistic: CoachStatisticSchemaForwardRef.nullable().optional(),
  type: z.lazy(() => TypeSchema).nullable().optional(),
});

// Import actual CoachStatisticSchema to resolve the forward reference for CoachStatisticSchemaForwardRef
import { CoachStatisticSchema } from "./coach-statistic.schema";
