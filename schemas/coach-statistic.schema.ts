import { z } from "zod";
import { type Coach, CoachSchema } from "./coach.schema";
import { type Participant, ParticipantSchema } from "./participant.schema"; // Represents Team
import { type Season, SeasonSchema } from "./season.schema";
import { type CoachStatisticDetail, CoachStatisticDetailSchema } from "./coach-statistic-detail.schema"; // Import actual CoachStatisticDetail schema and type

// --- Forward declare the CoachStatistic Type ---
export type CoachStatistic = {
  id?: number | null; 
  coach_id?: number | null;
  team_id?: number | null; 
  season_id?: number | null;
  games_played?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals_for?: number | null;
  goals_against?: number | null;

  // Relations
  coach?: Coach | null; 
  team?: Participant | null; 
  season?: Season | null; 
  details?: CoachStatisticDetail[] | null; // Use explicit CoachStatisticDetail type
};

// --- Main CoachStatistic Schema based on SportMonks API Documentation ---
export const CoachStatisticSchema: z.ZodType<CoachStatistic> = z.lazy(() => 
  z.object({
    id: z.number().nullable().optional(),
    coach_id: z.number().nullable().optional(),
    team_id: z.number().nullable().optional(),
    season_id: z.number().nullable().optional(),
    games_played: z.number().int().nullable().optional(),
    wins: z.number().int().nullable().optional(),
    draws: z.number().int().nullable().optional(),
    losses: z.number().int().nullable().optional(),
    goals_for: z.number().int().nullable().optional(),
    goals_against: z.number().int().nullable().optional(),

    // Relations (using actual schemas where available, placeholders otherwise)
    coach: CoachSchema.nullable().optional(),
    team: ParticipantSchema.nullable().optional(), 
    season: SeasonSchema.nullable().optional(),
    details: z.array(CoachStatisticDetailSchema).nullable().optional(), // Use actual CoachStatisticDetailSchema
  })
);

// The explicit CoachStatistic type is defined above.
// export type CoachStatistic = z.infer<typeof CoachStatisticSchema>;
