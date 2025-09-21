import { z } from "zod";
import { type League, LeagueSchema } from "./league.schema";
import { type Season, SeasonSchema } from "./season.schema";
import { type Sport, SportSchema } from "./sport.schema";
import { type Round, RoundSchema } from "./round.schema";
import { type Group, GroupSchema } from "./group.schema";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type FixtureAggregate, FixtureAggregateSchema } from "./fixture-aggregate.schema";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type
import { type Topscorer, TopscorerSchema } from "./topscorer.schema"; // Import actual Topscorer schema and type
import { type StageStatistics, StageStatisticsSchema } from "./stage-statistics.schema"; // Import actual StageStatistics schema and type

// --- Forward declare the Stage Type ---
export type Stage = {
  id: number;
  sport_id?: number | null;
  league_id?: number | null;
  season_id?: number | null;
  type_id?: number | null;
  name?: string | null;
  sort_order?: number | null;
  finished?: boolean | null;
  is_current?: boolean | null;
  starting_at?: string | null;
  ending_at?: string | null;
  games_in_current_week?: boolean | null;

  // Relations
  league?: League | null;
  season?: Season | null;
  type?: Type | null; // Use actual Type
  sport?: Sport | null;
  rounds?: Round[] | null;
  currentRound?: Round | null;
  groups?: Group[] | null;
  fixtures?: Fixture[] | null;
  aggregates?: FixtureAggregate[] | null;
  topscorers?: Topscorer[] | null; // Use actual Topscorer type
  statistics?: StageStatistics[] | null; // Use actual StageStatistics type (or single object if appropriate)
};

// --- Main Stage Schema ---
export const StageSchema: z.ZodType<Stage> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    sport_id: z.number().int().nullable().optional(),
    league_id: z.number().int().nullable().optional(),
    season_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
    sort_order: z.number().int().nullable().optional(),
    finished: z.boolean().nullable().optional(),
    is_current: z.boolean().nullable().optional(),
    starting_at: z.string().nullable().optional(),
    ending_at: z.string().nullable().optional(),
    games_in_current_week: z.boolean().nullable().optional(),

    // Relations
    league: z.lazy(() => LeagueSchema).nullable().optional(),
    season: z.lazy(() => SeasonSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(),
    sport: z.lazy(() => SportSchema).nullable().optional(),
    rounds: z.array(z.lazy(() => RoundSchema)).nullable().optional(),
    currentRound: z.lazy(() => RoundSchema).nullable().optional(),
    groups: z.array(z.lazy(() => GroupSchema)).nullable().optional(),
    fixtures: z.array(z.lazy(() => FixtureSchema)).nullable().optional(),
    aggregates: z.array(z.lazy(() => FixtureAggregateSchema)).nullable().optional(),
    topscorers: z.array(z.lazy(() => TopscorerSchema)).nullable().optional(),
    statistics: z.array(z.lazy(() => StageStatisticsSchema)).nullable().optional(), // Or StageStatisticsSchema.nullable().optional() if single
  })
);