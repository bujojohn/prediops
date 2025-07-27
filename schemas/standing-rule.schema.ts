import { z } from "zod";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type

// --- Forward declare the StandingRule Type ---
export type StandingRule = {
  id?: number | null;
  model_type?: string | null; // e.g., "league", "season", "stage" - the type of entity the rule applies to
  model_id?: number | null;   // ID of the entity instance (league_id, season_id, etc.)
  type_id?: number | null;    // ID of the rule type (e.g., head-to-head, goal_difference)
  position?: number | null; // The position this rule might dictate (e.g., for tie-breaking)

  // Relations
  type?: Type | null; // The type of standing rule
};

// --- Main StandingRule Schema based on provided fields ---
export const StandingRuleSchema: z.ZodType<StandingRule> = z.lazy(() => 
  z.object({
    id: z.number().nullable().optional(),
    model_type: z.string().nullable().optional(),
    model_id: z.number().nullable().optional(),
    type_id: z.number().nullable().optional(),
    position: z.number().int().nullable().optional(),

    // Relations (using actual schema)
    type: TypeSchema.nullable().optional(), // Use actual TypeSchema
  })
);

// The explicit StandingRule type is defined above.
// export type StandingRule = z.infer<typeof StandingRuleSchema>;
