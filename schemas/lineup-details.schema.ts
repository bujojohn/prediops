import { z } from "zod"; // Removed unused nullable import

// Zod schema for LineupDetails
export const LineupDetailsSchema = z.lazy(() =>
  z.object({
    id: z.number().nullable().optional(),
    player_id: z.number().nullable().optional(),
    team_id: z.number().nullable().optional(),
    fixture_id: z.number().nullable().optional(),
    type_id: z.number().nullable().optional(),
    data: z
      .object({
        // Assuming value can be a number, boolean, or null. Making it optional too.
        value: z.union([z.number(), z.boolean()]).nullable().optional(),
      })
      .nullable()
      .optional(), // data object itself can be nullable or optional
  })
);

// TypeScript type for LineupDetails based on the Zod schema
export type LineupDetails = z.infer<typeof LineupDetailsSchema>;
