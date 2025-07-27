import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema"; // Import actual Fixture schema and type
import { type Standing, StandingSchema } from "./standing.schema"; // Import actual Standing schema and type

// --- Forward declare the StandingForm Type ---
export type StandingForm = {
  id?: number | null;
  standing_id?: number | null; // ID of the parent Standing record
  fixture_id?: number | null;  // ID of the fixture this form entry pertains to
  standing_type?: string | null; // Context of the standing (e.g., overall, home, away)
  form?: string | null;        // Result of the match (e.g., "W", "D", "L")
  sort_order?: number | null;  // Order of this form entry if multiple exist

  // Relations
  fixture?: Fixture | null; // Use explicit Fixture type
  standing?: Standing | null; // Use explicit Standing type
};

// --- Main StandingForm Schema based on provided fields ---
export const StandingFormSchema: z.ZodType<StandingForm> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number().nullable().optional(),
    standing_id: z.number().nullable().optional(),
    fixture_id: z.number().nullable().optional(),
    standing_type: z.string().nullable().optional(),
    form: z.string().nullable().optional(),
    sort_order: z.number().int().nullable().optional(),

    // Relations (using actual schemas)
    // Need to use z.lazy for StandingSchema due to circular dependency: Standing -> StandingForm -> Standing
    fixture: FixtureSchema.nullable().optional(), 
    standing: z.lazy(() => StandingSchema).nullable().optional(), 
  })
);

// The explicit StandingForm type is defined above.
// export type StandingForm = z.infer<typeof StandingFormSchema>;
