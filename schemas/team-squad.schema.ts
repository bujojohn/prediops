import { z } from "zod";
import { type Participant, ParticipantSchema } from "./participant.schema"; // Represents Team
import { type Player, PlayerSchema } from "./player.schema";
import { type Position, PositionSchema } from "./position.schema"; // Import actual Position schema and type
import { type DetailedPosition, DetailedPositionSchema } from "./detailed-position.schema"; // Import actual DetailedPosition schema and type
import { type Transfer, TransferSchema } from "./transfer.schema"; // Import actual Transfer schema and type
import { type Season, SeasonSchema } from "./season.schema"; // Import actual Season schema and type

// --- Forward declare the TeamSquad Type ---
export type TeamSquad = {
  id?: number | null;
  player_id?: number | null;
  team_id?: number | null;
  season_id?: number | null;
  position_id?: number | null;
  detailed_position_id?: number | null;
  start?: string | null;
  end?: string | null;
  jersey_number?: number | null;
  captain?: boolean | null;

  // Relations
  team?: Participant | null;
  player?: Player | null;
  position?: Position | null; // Use actual Position type
  detailedPosition?: DetailedPosition | null; // Use actual DetailedPosition type
  transfer?: Transfer | null; // Use actual Transfer type
  season?: Season | null; // Use actual Season type
};

// --- Main TeamSquad Schema ---
export const TeamSquadSchema: z.ZodType<TeamSquad> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    player_id: z.number().int().nullable().optional(),
    team_id: z.number().int().nullable().optional(), // This is participant_id
    season_id: z.number().int().nullable().optional(),
    position_id: z.number().int().nullable().optional(),
    detailed_position_id: z.number().int().nullable().optional(),
    start: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    end: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    jersey_number: z.number().int().nullable().optional(),
    captain: z.boolean().nullable().optional(),

    // Relations
    team: ParticipantSchema.nullable().optional(),
    player: PlayerSchema.nullable().optional(),
    position: z.lazy(() => PositionSchema).nullable().optional(),
    detailedPosition: z.lazy(() => DetailedPositionSchema).nullable().optional(),
    transfer: z.lazy(() => TransferSchema).nullable().optional(), // A squad entry might be linked to a transfer
    season: z.lazy(() => SeasonSchema).nullable().optional(),
  })
);
