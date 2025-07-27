import { z } from 'zod';
import { type Position, PositionSchema } from './position.schema'; // A detailed position might relate to a general position

// Based on the generic SportMonks Type entity structure
export const DetailedPositionSchema = z.object({
  id: z.number().int(),
  position_id: z.number().int().nullable().optional(), // Foreign key to Position
  name: z.string(), // Conforming to Type structure
  code: z.string(), // Conforming to Type structure
  developer_name: z.string().nullable().optional(),
  model_type: z.string().nullable().optional(),
  // stat_group: z.string().nullable().optional(), // Unlikely for DetailedPosition

  // Relations
  position: z.lazy(() => PositionSchema).nullable().optional(), // Retain relation to general Position
});

export type DetailedPosition = z.infer<typeof DetailedPositionSchema>;
