import { z } from "zod";
import { LeagueSchema } from "./league.schema";
import { SeasonSchema } from "./season.schema";
import { TrophySchema } from "./trophy.schema";


export const TrophiesSchema = z.lazy(() =>
  z.object({
    id: z.number().nullable().optional(),
    participant_id: z.number().nullable().optional(),
    team_id: z.number().nullable().optional(),
    league_id: z.number().nullable().optional(),
    season_id: z.number().nullable().optional(),
    trophy_id: z.number().nullable().optional(),
    league: LeagueSchema.nullable().optional(),
    season: SeasonSchema.nullable().optional(),
    trophy: TrophySchema.nullable().optional(),
  })
);
// TypeScript type for Trophies based on the Zod schema
export type Trophies = z.infer<typeof TrophiesSchema>;