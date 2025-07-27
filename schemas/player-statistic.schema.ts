import { z } from 'zod';
import { PlayerStatisticDetailSchema } from './player-statistic-detail.schema';
import { SeasonSchema } from './season.schema';
import { PositionSchema } from './position.schema';
import { PlayerSchema } from './player.schema';
import { ParticipantSchema } from './participant.schema';

// Forward declarations for circular dependencies
const PlayerSchemaForwardRef: z.ZodType<any> = z.lazy(() => PlayerSchema);
const ParticipantSchemaForwardRef: z.ZodType<any> = z.lazy(() => ParticipantSchema); // For Team

export const PlayerStatisticSchema: z.ZodType<any> = z.object({
  id: z.number().int(),
  player_id: z.number().int().nullable().optional(),
  team_id: z.number().int().nullable().optional(), // Assuming this is participant_id for the team
  season_id: z.number().int().nullable().optional(),
  position_id: z.number().int().nullable().optional(),
  details: z.array(PlayerStatisticDetailSchema).optional(),
  // Relations
  player: PlayerSchemaForwardRef.optional(),
  team: ParticipantSchemaForwardRef.optional(), // Team is a Participant
  season: z.lazy(() => SeasonSchema).optional(),
  position: z.lazy(() => PositionSchema).optional(),
});

export type PlayerStatistic = z.infer<typeof PlayerStatisticSchema>;
