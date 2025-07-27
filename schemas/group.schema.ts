import { z } from "zod";

// --- Main Group Schema based on SportMonks API Documentation and common patterns ---
export const GroupSchema = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    league_id: z.number().nullable().optional(), // Common linking ID
    season_id: z.number().nullable().optional(), // Common linking ID
    stage_id: z.number().nullable().optional(),  // Common linking ID
    // Add other fields if known from API responses or more detailed docs
    // For example, some group entities might have a specific order or tie-breaker rules.
  })
);

// --- Inferred TypeScript Type ---
export type Group = z.infer<typeof GroupSchema>;
