import { z } from "zod";
import { type Sport, SportSchema } from "./sport.schema";
import { type League, LeagueSchema } from "./league.schema";
import { type Season, SeasonSchema } from "./season.schema";
import { type Stage, StageSchema } from "./stage.schema";
import { type Fixture, FixtureSchema } from "./fixture.schema"; // Import actual Fixture schema and type
import { type RoundStatistics, RoundStatisticsSchema } from "./round-statistics.schema"; // Import actual RoundStatistics schema and type

// --- Forward declare the Round Type ---
export type Round = {
  id: number;
  sport_id?: number | null;
  league_id?: number | null;
  season_id?: number | null;
  stage_id?: number | null;
  name?: string | null;
  finished?: boolean | null;
  is_current?: boolean | null;
  starting_at?: string | null;
  ending_at?: string | null;
  games_in_current_week?: boolean | null;

  // Relations
  sport?: Sport | null;
  league?: League | null;
  season?: Season | null;
  stage?: Stage | null;
  fixtures?: Fixture[] | null; // Use actual Fixture type
  statistics?: RoundStatistics[] | null; // Use actual RoundStatistics type
};

// --- Main Round Schema ---
export const RoundSchema: z.ZodType<Round> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    sport_id: z.number().int().nullable().optional(),
    league_id: z.number().int().nullable().optional(),
    season_id: z.number().int().nullable().optional(),
    stage_id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
    finished: z.boolean().nullable().optional(),
    is_current: z.boolean().nullable().optional(),
    starting_at: z.string().nullable().optional(),
    ending_at: z.string().nullable().optional(),
    games_in_current_week: z.boolean().nullable().optional(),

    // Relations
    sport: z.lazy(() => SportSchema).nullable().optional(),
    league: z.lazy(() => LeagueSchema).nullable().optional(),
    season: z.lazy(() => SeasonSchema).nullable().optional(),
    stage: z.lazy(() => StageSchema).nullable().optional(),
    fixtures: z.array(z.lazy(() => FixtureSchema)).nullable().optional(),
    statistics: z.array(z.lazy(() => RoundStatisticsSchema)).nullable().optional(),
  })
);