import { z } from "zod";

// --- Forward declare the Type ---
export type Type = {
  id: number;
  name?: string | null;
  code?: string | null;
  developer_name?: string | null;
  model_type?: string | null; // Indicates which model this type is for (e.g., "StandingRule", "Statistic", "Event")
  stat_group?: string | null; // For statistic types, which group they belong to
};

// --- Main Type Schema based on SportMonks API Documentation ---
export const TypeSchema: z.ZodType<Type> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    code: z.string().nullable().optional(),
    developer_name: z.string().nullable().optional(),
    model_type: z.string().nullable().optional(),
    stat_group: z.string().nullable().optional(),
  })
);

// The explicit Type type is defined above.
// export type Type = z.infer<typeof TypeSchema>; // This is no longer needed
