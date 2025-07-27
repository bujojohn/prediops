import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema"; // Import actual Fixture schema and type
import { type Period, PeriodSchema } from "./period.schema"; // Import actual Period schema and type

// --- Forward declare the BallCoordinates Type ---
export type BallCoordinates = {
  id?: number | null;
  fixture_id?: number | null;
  period_id?: number | null;
  timestamp?: number | null; // Timestamp of the coordinate log
  minute?: number | null;
  second?: number | null;
  x?: number | null; // X coordinate on the pitch
  y?: number | null; // Y coordinate on the pitch
  z?: number | null; // Z coordinate (height), if available

  // Relations
  fixture?: Fixture | null; // Use explicit Fixture type
  period?: Period | null; // Use explicit Period type
};

// --- Main BallCoordinates Schema based on SportMonks API Documentation ---
export const BallCoordinatesSchema: z.ZodType<BallCoordinates> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number().nullable().optional(),
    fixture_id: z.number().nullable().optional(),
    period_id: z.number().nullable().optional(),
    timestamp: z.number().int().nullable().optional(),
    minute: z.number().int().nullable().optional(),
    second: z.number().int().nullable().optional(),
    x: z.number().nullable().optional(),
    y: z.number().nullable().optional(),
    z: z.number().nullable().optional(),

    // Relations (using actual schemas)
    fixture: FixtureSchema.nullable().optional(), // FixtureSchema itself is lazy
    period: PeriodSchema.nullable().optional(), // PeriodSchema itself is lazy
  })
);

// The explicit BallCoordinates type is defined above.
// export type BallCoordinates = z.infer<typeof BallCoordinatesSchema>; // This is no longer needed
