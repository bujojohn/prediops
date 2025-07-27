import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Player, PlayerSchema } from "./player.schema";
import { type Season, SeasonSchema } from "./season.schema";
import { type Type, TypeSchema } from "./type.schema";

// --- Forward declare the Sidelined Type ---
export type Sidelined = {
  id?: number | null;
  player_id?: number | null;
  team_id?: number | null; // or participant_id
  fixture_id?: number | null;
  season_id?: number | null;
  type_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  category?: string | null;
  sideline_detail?: {
    player_id?: number | null;
    type_id?: number | null;
    category_name?: string | null;
    description?: string | null;
  } | null;

  // Relations
  fixture?: Fixture | null;
  participant?: Participant | null;
  player?: Player | null;
  season?: Season | null;
  type?: Type | null;
};

// --- Main Sidelined Schema ---
export const SidelinedSchema: z.ZodType<Sidelined> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    player_id: z.number().int().nullable().optional(),
    team_id: z.number().int().nullable().optional(), // This is participant_id
    fixture_id: z.number().int().nullable().optional(),
    season_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    start_date: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    end_date: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    description: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    sideline_detail: z.object({
        player_id: z.number().int().nullable().optional(),
        type_id: z.number().int().nullable().optional(),
        category_name: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
      }).nullable().optional(),

    // Relations
    fixture: z.lazy(() => FixtureSchema).nullable().optional(),
    participant: z.lazy(() => ParticipantSchema).nullable().optional(),
    player: z.lazy(() => PlayerSchema).nullable().optional(),
    season: z.lazy(() => SeasonSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(),
  })
);
