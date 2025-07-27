import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Participant, ParticipantSchema } from "./participant.schema";

// --- Forward declare the Formation Type ---
export type Formation = {
  id?: number | null;
  fixture_id?: number | null;
  participant_id?: number | null;
  formation?: string | null; // e.g., "4-4-2", "3-5-2"
  location?: string | null; // e.g., "home", "away"

  // Relations
  fixture?: Fixture | null;
  participant?: Participant | null; // The team this formation applies to
};

// --- Main Formation Schema based on SportMonks API Documentation ---
export const FormationSchema: z.ZodType<Formation> = z.lazy(() => // Wrapped in z.lazy() due to circular dependency with FixtureSchema
  z.object({
    id: z.number().nullable().optional(),
    fixture_id: z.number().nullable().optional(),
    participant_id: z.number().nullable().optional(),
    formation: z.string().nullable().optional(),
    location: z.string().nullable().optional(),

    // Relations (using actual schemas)
    fixture: z.lazy(() => FixtureSchema).nullable().optional(), // FixtureSchema itself is lazy
    participant: ParticipantSchema.nullable().optional(),
  })
);

// The explicit Formation type is defined above.
// export type Formation = z.infer<typeof FormationSchema>; // This is no longer needed