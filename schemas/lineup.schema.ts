import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Player, PlayerSchema } from "./player.schema";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type
import { type Position, PositionSchema } from "./position.schema"; // Import actual Position schema and type
import { type DetailedPosition, DetailedPositionSchema } from "./detailed-position.schema"; // Import actual DetailedPosition schema and type
import { type LineupDetails, LineupDetailsSchema } from "./lineup-details.schema"; // Import actual LineupDetails schema and type

// --- Forward declare the Lineup Type ---
export type Lineup = {
  id?: number | null;
  sport_id?: number | null;
  fixture_id?: number | null;
  player_id?: number | null;
  team_id?: number | null;
  position_id?: number | null;
  detailed_position_id?: number | null;
  type_id?: number | null;
  formation_field?: string | null;
  formation_position?: number | null;
  player_name?: string | null;
  jersey_number?: number | null;

  // Relations
  fixture?: Fixture | null;
  player?: Player | null;
  participant?: Participant | null;
  type?: Type | null; // Use actual Type
  position?: Position | null; // Use actual Position
  detailedPosition?: DetailedPosition | null; // Use actual DetailedPosition
  details?: LineupDetails[] | null; // Use actual LineupDetails type
};

// --- Main Lineup Schema ---
export const LineupSchema: z.ZodType<Lineup> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    sport_id: z.number().int().nullable().optional(),
    fixture_id: z.number().int().nullable().optional(),
    player_id: z.number().int().nullable().optional(),
    team_id: z.number().int().nullable().optional(), // This is participant_id
    position_id: z.number().int().nullable().optional(),
    detailed_position_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    formation_field: z.string().nullable().optional(),
    formation_position: z.number().int().nullable().optional(),
    player_name: z.string().nullable().optional(),
    jersey_number: z.number().int().nullable().optional(),

    // Relations
    fixture: z.lazy(() => FixtureSchema).nullable().optional(),
    player: z.lazy(() => PlayerSchema).nullable().optional(),
    participant: z.lazy(() => ParticipantSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(),
    position: z.lazy(() => PositionSchema).nullable().optional(),
    detailedPosition: z.lazy(() => DetailedPositionSchema).nullable().optional(),
    details: z.array(z.lazy(() => LineupDetailsSchema)).nullable().optional(),
  })
);
