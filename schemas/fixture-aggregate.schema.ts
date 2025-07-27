import { z } from "zod";
import { type Stage, StageSchema } from "./stage.schema";
import { type League, LeagueSchema } from "./league.schema";
import { type Season, SeasonSchema } from "./season.schema";
import { type Participant, ParticipantSchema } from "./participant.schema"; // Import actual Participant schema for Team

// --- Forward declare the FixtureAggregate Type ---
export type FixtureAggregate = {
  id: number;
  name?: string | null;
  detail?: string | null;
  result?: string | null;
  stage_id?: number | null;
  league_id?: number | null;
  season_id?: number | null;
  fixture_ids?: number[] | null;

  // Relations
  stage?: Stage | null;
  league?: League | null;
  season?: Season | null;
  winner?: Participant | null; // Use actual Participant type for the winner (team)
};

// --- Main FixtureAggregate Schema ---
export const FixtureAggregateSchema: z.ZodType<FixtureAggregate> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    detail: z.string().nullable().optional(),
    result: z.string().nullable().optional(),
    stage_id: z.number().int().nullable().optional(),
    league_id: z.number().int().nullable().optional(),
    season_id: z.number().int().nullable().optional(),
    fixture_ids: z.array(z.number().int()).nullable().optional(),

    // Relations
    stage: z.lazy(() => StageSchema).nullable().optional(),
    league: z.lazy(() => LeagueSchema).nullable().optional(),
    season: z.lazy(() => SeasonSchema).nullable().optional(),
    winner: z.lazy(() => ParticipantSchema).nullable().optional(), // Use actual ParticipantSchema for the winner
  })
);
