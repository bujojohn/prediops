import { z } from 'zod';
import { type RefereeStatisticDetail, RefereeStatisticDetailSchema } from './referee-statistic-detail.schema';
import { type Season, SeasonSchema } from './season.schema';

// Forward declaration for RefereeSchema to handle circular dependency
const RefereeSchemaForwardRef = z.lazy(() => RefereeSchema);

export type RefereeStatistic = {
  id: number;
  referee_id?: number | null;
  season_id?: number | null;
  // Add common referee statistic fields if known (e.g., matches_officiated, cards_issued)
  matches_officiated?: number | null;
  yellow_cards?: number | null;
  red_cards?: number | null;
  // Relations
  details?: RefereeStatisticDetail[] | null;
  referee?: import('./referee.schema').Referee | null;
  season?: Season | null;
};

export const RefereeStatisticSchema: z.ZodType<RefereeStatistic> = z.object({
  id: z.number().int(),
  referee_id: z.number().int().nullable().optional(),
  season_id: z.number().int().nullable().optional(),
  matches_officiated: z.number().int().nullable().optional(),
  yellow_cards: z.number().int().nullable().optional(),
  red_cards: z.number().int().nullable().optional(),
  // Relations
  details: z.array(z.lazy(() => RefereeStatisticDetailSchema)).nullable().optional(),
  referee: RefereeSchemaForwardRef.nullable().optional(),
  season: z.lazy(() => SeasonSchema).nullable().optional(),
});

// Import actual RefereeSchema to resolve the forward reference
import { RefereeSchema } from './referee.schema';
