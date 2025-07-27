import { z } from "zod";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type

// --- Main State Schema ---
export const StateSchema = z.lazy(() =>
  z.object({
    id: z.number().int(),
    state: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    short_name: z.string().nullable().optional(),
    developer_name: z.string().nullable().optional(),
    type_id: z.number().int().nullable().optional(),

    // Relations
    type: z.lazy(() => TypeSchema).nullable().optional(), // Use actual TypeSchema
  })
);

// --- Inferred TypeScript Type ---
export type State = z.infer<typeof StateSchema>;

// --- Explicit Type (Optional, if preferred over pure inference for clarity or complex scenarios) ---
// export type State = {
//   id: number;
//   state?: string | null;
//   name?: string | null;
//   short_name?: string | null;
//   developer_name?: string | null;
//   type_id?: number | null;
//   // Relations
//   type?: Type | null;
// };
