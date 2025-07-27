import {z} from 'zod';

// Zod schema for Form
export const FormSchema = z.object({
  id: z.number(),
  fixture_id: z.number(),
  form: z.string(),
  sort_order: z.number(),
  standing_id: z.number(),
  standing_type: z.string(),
});
// TypeScript type for Form based on the Zod schema
export type Form = z.infer<typeof FormSchema>;