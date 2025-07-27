import { z } from "zod";
import { type Sport, SportSchema } from "./sport.schema";
import { type League, LeagueSchema } from "./league.schema";
import { type Stage, StageSchema } from "./stage.schema";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Group, GroupSchema } from "./group.schema";
import { type Participant, ParticipantSchema } from "./participant.schema"; // For Teams
import { type SeasonStatistics, SeasonStatisticsSchema } from "./season-statistics.schema"; // For Season Statistics
import { type Topscorer, TopscorerSchema } from "./topscorer.schema"; // For Topscorers

// --- Forward declare the Season Type ---
export type Season = {
  id: number;
  sport_id?: number | null;
  league_id?: number | null;
  tie_breaker_rule_id?: number | null;
  name?: string | null;
  finished?: boolean | null;
  pending?: boolean | null;
  is_current?: boolean | null;
  starting_at?: string | null;
  ending_at?: string | null;
  standings_recalculated_at?: string | null;
  games_in_current_week?: boolean | null;

  // Relations
  sport?: Sport | null;
  league?: League | null;
  teams?: Participant[] | null; // Use actual Participant type for teams
  stages?: Stage[] | null;
  currentStage?: Stage | null;
  fixtures?: Fixture[] | null;
  groups?: Group[] | null;
  statistics?: SeasonStatistics[] | null; // Use actual SeasonStatistics type
  topscorers?: Topscorer[] | null; // Use actual Topscorer type
};

// --- Main Season Schema ---
export const SeasonSchema: z.ZodType<Season> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    sport_id: z.number().int().nullable().optional(),
    league_id: z.number().int().nullable().optional(),
    tie_breaker_rule_id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
    finished: z.boolean().nullable().optional(),
    pending: z.boolean().nullable().optional(),
    is_current: z.boolean().nullable().optional(),
    starting_at: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    ending_at: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    standings_recalculated_at: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    games_in_current_week: z.boolean().nullable().optional(),

    // Relations
    sport: z.lazy(() => SportSchema).nullable().optional(),
    league: z.lazy(() => LeagueSchema).nullable().optional(),
    teams: z.array(z.lazy(() => ParticipantSchema)).nullable().optional(), // Use actual ParticipantSchema
    stages: z.array(z.lazy(() => StageSchema)).nullable().optional(),
    currentStage: z.lazy(() => StageSchema).nullable().optional(),
    fixtures: z.array(z.lazy(() => FixtureSchema)).nullable().optional(),
    groups: z.array(z.lazy(() => GroupSchema)).nullable().optional(),
    statistics: z.array(z.lazy(() => SeasonStatisticsSchema)).nullable().optional(), // Use actual SeasonStatisticsSchema
    topscorers: z.array(z.lazy(() => TopscorerSchema)).nullable().optional(), // Use actual TopscorerSchema
  })
);