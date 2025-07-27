import { z } from "zod";
import { playoffGroupSchema } from "./playoff-group.schema";


// Zod schema for playoffStructure
export const playoffStructureSchema: z.ZodType<any> = z.object({
  id: z.number().nullable().optional(), // Keep .optional() if it can be undefined
  name: z.string().nullable().optional(),
  fixtures: z.array(z.lazy(() => playoffStructureSchema)).nullable().optional(),
  thirdPlace: z.lazy(() => playoffStructureSchema).nullable().optional(),
  topLevel: z.boolean().nullable().optional(),
  left: z.boolean().nullable().optional(),
  home: playoffGroupSchema.nullable().optional(), // Corrected usage
  away: playoffGroupSchema.nullable().optional(), // Corrected usage
});
// TypeScript type for playoffStructure
export type PlayoffStructure = z.infer<typeof playoffStructureSchema>;