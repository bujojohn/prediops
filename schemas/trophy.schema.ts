import { z } from "zod";

export const TrophySchema = z.lazy(() =>
  z.object({
    id: z.number().nullable().optional(),
    sport_id: z.number().nullable().optional(),
    position: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
  })
);

// TypeScript type for Trophy based on the Zod schema
export type Trophy = z.infer<typeof TrophySchema>;