import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Type, TypeSchema } from "./type.schema";

// --- Forward declare the Scores Type ---
// Note: This represents a single score entry (e.g., home team's current score, or away team's HT score)
// A fixture usually has an array of these score objects.
export type Scores = {
  id?: number | null;
  fixture_id?: number | null;
  type_id?: number | null; // ID of the score type (e.g., from a types table)
  participant_id?: number | null; // ID of the participant (team) this score is for
  score?: {
    goals?: number | null;
    participant?: string | null; // e.g., "home", "away" - often redundant if participant_id is used
  } | null;
  description?: string | null; // e.g., "CURRENT", "HT", "FT"

  // Relations
  fixture?: Fixture | null;
  participant?: Participant | null;
  type?: Type | null; // The type of score
};

// --- Main Scores Schema based on SportMonks API Documentation ---
export const ScoresSchema: z.ZodType<Scores> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number().int().nullable().optional(),
    fixture_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    participant_id: z.number().int().nullable().optional(),
    score: z.object({
        goals: z.number().int().nullable().optional(),
        participant: z.string().nullable().optional(), // e.g., "home", "away"
      }).nullable().optional(),
    description: z.string().nullable().optional(),

    // Relations
    fixture: z.lazy(() => FixtureSchema).nullable().optional(),
    participant: z.lazy(() => ParticipantSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(),
  })
);