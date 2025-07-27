import { z } from "zod";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Season, SeasonSchema } from "./season.schema";
import { type TeamStatisticDetail, TeamStatisticDetailSchema } from "./team-statistic-detail.schema"; // Import actual detail schema and type

// --- Forward declare the TeamStatistics Type ---
export type TeamStatistics = {
  id?: number | null;
  team_id?: number | null; // participant_id
  season_id?: number | null;
  games_played?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals_for?: number | null;
  goals_against?: number | null;
  points?: number | null;
  goal_difference?: number | null;
  position?: number | null;

  // Relations
  team?: Participant | null;
  season?: Season | null;
  details?: TeamStatisticDetail[] | null; // Use actual TeamStatisticDetail type
};

// --- Main TeamStatistics Schema ---
export const TeamStatisticsSchema: z.ZodType<TeamStatistics> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    team_id: z.number().int().nullable().optional(), // This is participant_id
    season_id: z.number().int().nullable().optional(),
    games_played: z.number().int().nullable().optional(),
    wins: z.number().int().nullable().optional(),
    draws: z.number().int().nullable().optional(),
    losses: z.number().int().nullable().optional(),
    goals_for: z.number().int().nullable().optional(),
    goals_against: z.number().int().nullable().optional(),
    points: z.number().int().nullable().optional(),
    goal_difference: z.number().int().nullable().optional(),
    position: z.number().int().nullable().optional(),

    // Relations
    team: z.lazy(() => ParticipantSchema).nullable().optional(),
    season: z.lazy(() => SeasonSchema).nullable().optional(),
    details: z.array(z.lazy(() => TeamStatisticDetailSchema)).nullable().optional(), // Use actual detail schema
  })
);
