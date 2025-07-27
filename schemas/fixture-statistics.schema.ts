import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type

// --- Forward declare the FixtureStatistics Type ---
export type FixtureStatistics = {
  id?: number | null;
  fixture_id?: number | null;
  type_id?: number | null;
  participant_id?: number | null;
  data?: {
    value?: number | string | boolean | null;
  } | null;
  location?: string | null;

  // Relations
  fixture?: Fixture | null;
  type?: Type | null; // Use actual Type
  participant?: Participant | null;
};

// --- Main FixtureStatistics Schema ---
export const FixtureStatisticsSchema: z.ZodType<FixtureStatistics> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    fixture_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    participant_id: z.number().int().nullable().optional(),
    data: z.object({
        value: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
      }).nullable().optional(),
    location: z.string().nullable().optional(),

    // Relations
    fixture: z.lazy(() => FixtureSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(), // Use actual TypeSchema
    participant: z.lazy(() => ParticipantSchema).nullable().optional(),
  })
);
