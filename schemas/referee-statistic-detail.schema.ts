import { z } from 'zod';
import { type Type, TypeSchema } from './type.schema';
import { type RefereeStatistic, RefereeStatisticSchema } from './referee-statistic.schema'; // Import at the top

export type RefereeStatisticDetail = {
  id: number;
  referee_statistic_id?: number | null;
  type_id?: number | null;
  value?: number | string | boolean | null;
  // Relations
  type?: Type | null;
  statistic?: RefereeStatistic | null; // Use imported type
};

export const RefereeStatisticDetailSchema: z.ZodType<RefereeStatisticDetail> = z.lazy(() => z.object({ // Wrap entire schema in z.lazy if it's part of a deeper cycle
  id: z.number().int(),
  referee_statistic_id: z.number().int().nullable().optional(),
  type_id: z.number().int().nullable().optional(),
  value: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  // Relations
  type: z.lazy(() => TypeSchema).nullable().optional(),
  statistic: z.lazy(() => RefereeStatisticSchema).nullable().optional(), // Use z.lazy directly
}));
