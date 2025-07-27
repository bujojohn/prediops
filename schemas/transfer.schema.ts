import {z, nullable} from 'zod';

import {ParticipantSchema} from './participant.schema';
import {PlayerSchema} from './player.schema';
import {TypeSchema} from './type.schema'; // For transfer type
import {PositionSchema} from './position.schema';
import {DetailedPositionSchema} from './detailed-position.schema';
import {SeasonSchema} from './season.schema'; // Assuming a season_id might be relevant

// Zod schema for Transfer
export const TransferSchema = z.object({
  id: z.number().int(),
  sport_id: z.number().int().nullable().optional(),
  player_id: z.number().int().nullable().optional(),
  type_id: z.number().int().nullable().optional(),
  from_team_id: z.number().int().nullable().optional(), // This is a participant_id
  to_team_id: z.number().int().nullable().optional(),   // This is a participant_id
  position_id: z.number().int().nullable().optional(),
  detailed_position_id: z.number().int().nullable().optional(),
  season_id: z.number().int().nullable().optional(), // Added based on common patterns
  date: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
  career_ended: z.boolean().nullable().optional(),
  completed: z.boolean().nullable().optional(),
  amount: z.number().nullable().optional(),

  // Relations
  fromTeam: z.lazy(() => ParticipantSchema).nullable().optional(), // Renamed from 'fromteam' for consistency
  toTeam: z.lazy(() => ParticipantSchema).nullable().optional(),   // Renamed from 'toteam' for consistency
  player: z.lazy(() => PlayerSchema).nullable().optional(),
  type: z.lazy(() => TypeSchema).nullable().optional(),
  position: z.lazy(() => PositionSchema).nullable().optional(),
  detailedPosition: z.lazy(() => DetailedPositionSchema).nullable().optional(),
  season: z.lazy(() => SeasonSchema).nullable().optional(),
});
// TypeScript type for Transfer based on the Zod schema
export type Transfer = z.infer<typeof TransferSchema>;