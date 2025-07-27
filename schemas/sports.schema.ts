import { z } from "zod";

// Forward declare the Sport type
export type Sport = {
  id: number;
  name?: string | null;
  code?: string | null;
  developer_name?: string | null;
};

// Zod schema for Sport, typed with the explicit Sport interface
export const SportSchema: z.ZodType<Sport> = z.lazy(() => 
  z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    code: z.string().nullable().optional(),
    developer_name: z.string().nullable().optional(),
  })
);
