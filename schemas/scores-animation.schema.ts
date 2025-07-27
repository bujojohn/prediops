
import { z, nullable } from "zod";
import { ScoresSchema } from "./scores.schema";

// Zod schema for ScoresAnimation
export const ScoresAnimationSchema = z.object({
  oldScores: nullable(z.array(ScoresSchema)),
  newScores: nullable(z.array(ScoresSchema)),
  animate: z.boolean(),
  flashLabel: z.boolean(),
  scorePulsate: z.boolean(),
  scoreReveal: z.boolean(),
});

// TypeScript type for ScoresAnimation based on the Zod schema
export type ScoresAnimation = z.infer<typeof ScoresAnimationSchema>;