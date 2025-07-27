import { z } from 'zod';

// Based on the generic SportMonks Type entity structure
export const PositionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: z.string(),
  developer_name: z.string().nullable().optional(),
  model_type: z.string().nullable().optional(),
  // stat_group: z.string().nullable().optional(), // Unlikely for Position
});

export type Position = z.infer<typeof PositionSchema>;
