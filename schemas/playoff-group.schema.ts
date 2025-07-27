import { z } from "zod";

// Zod schema for playoffGroup
export const playoffGroupSchema = z.lazy(() =>
  z.object({
    group: z.number().nullable().optional(),
    position: z.number().nullable().optional(),
  })
);

// TypeScript type for playoffGroup
export type PlayoffGroup = z.infer<typeof playoffGroupSchema>;