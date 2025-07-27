import { z } from 'zod';
import { type Participant, ParticipantSchema } from './participant.schema';
import { type Player, PlayerSchema } from './player.schema';
import { type Type, TypeSchema } from './type.schema'; // For the type of topscorer (e.g., goals, assists)
import { type Season, SeasonSchema } from './season.schema'; // For the season this topscorer data pertains to

// --- Forward declare the Topscorer Type ---
export type Topscorer = {
  id: number;
  season_id?: number | null;
  player_id?: number | null;
  type_id?: number | null;
  participant_id?: number | null; // Team ID
  position?: number | null;
  total?: number | null;

  // Relations
  participant?: Participant | null; // Team
  player?: Player | null;
  type?: Type | null;
  season?: Season | null;
};

// --- Main Topscorer Schema ---
export const TopscorerSchema: z.ZodType<Topscorer> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    season_id: z.number().int().nullable().optional(),
    player_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    participant_id: z.number().int().nullable().optional(),
    position: z.number().int().nullable().optional(),
    total: z.number().int().nullable().optional(),

    // Relations
    participant: z.lazy(() => ParticipantSchema).nullable().optional(),
    player: z.lazy(() => PlayerSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(),
    season: z.lazy(() => SeasonSchema).nullable().optional(),
  })
);
