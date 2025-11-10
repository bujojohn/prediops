import { z } from "zod";

export const RankingSchema = z.object({
  id: z.number(),
  position: z.number(),
  participant_id: z.number(),
  points: z.number(),
  sport_id: z.number(),
  type: z.string(),
});

export type Ranking = z.infer<typeof RankingSchema>;