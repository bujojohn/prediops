import { z } from "zod";
import { type Standing, StandingSchema } from "./standing.schema"; 
import { type Type, TypeSchema } from "./type.schema"; 

// --- Forward declare the StandingDetail Type ---
export type StandingDetail = {
  id?: number | null;
  standing_id?: number | null; 
  type_id?: number | null;     
  standing_type?: string | null; 
  value?: number | null; // Corrected to number (integer)

  // Relations
  standing?: Standing | null; 
  type?: Type | null; 
};

// --- Main StandingDetail Schema based on provided fields ---
export const StandingDetailSchema: z.ZodType<StandingDetail> = z.lazy(() => 
  z.object({
    id: z.number().nullable().optional(), // Assuming id can be optional
    standing_id: z.number().nullable().optional(),
    type_id: z.number().nullable().optional(),
    standing_type: z.string().nullable().optional(),
    value: z.number().int().nullable().optional(), // Corrected to integer

    // Relations (using actual schemas)
    standing: StandingSchema.nullable().optional(),
    type: TypeSchema.nullable().optional(),
  })
);

// The explicit StandingDetail type is defined above.
// export type StandingDetail = z.infer<typeof StandingDetailSchema>;
