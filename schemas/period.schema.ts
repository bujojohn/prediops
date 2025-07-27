import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type PlayerEvent, PlayerEventsSchema } from "./player-events.schema";
import { type FixtureStatistics, FixtureStatisticsSchema } from "./fixture-statistics.schema"; // Import actual FixtureStatisticsSchema

// --- Placeholder Schemas for Related Entities (defined in this file for now) ---
const TypeSchemaPlaceholder = z.any().nullable().optional(); // For period type
const TimelineEventSchemaPlaceholder = z.any().nullable().optional(); // If timeline is a specific structure

// --- Define simple placeholder interfaces for use in the Period type ---
interface PlaceholderType { id?: number | null; name?: string | null; }
interface PlaceholderTimelineEvent { time?: string | null; description?: string | null; }

// --- Forward declare the Period Type ---
export type Period = {
  id: number;
  fixture_id?: number | null;
  type_id?: number | null; // ID of the period type (e.g., 1st half, 2nd half, ET, PEN)
  started?: number | null; // Timestamp or minute
  ended?: number | null; // Timestamp or minute
  counts_from?: number | null; // Minute from which this period counts (e.g., 46 for 2nd half)
  ticking?: boolean | null;
  sort_order?: number | null;
  description?: string | null; // e.g., "1st Half", "Extra Time"
  time_added?: number | null; // Added time in minutes
  period_length?: number | null; // Official length of the period in minutes
  minutes?: number | null; // Current minute of the period if live
  seconds?: number | null; // Current seconds of the period if live
  has_timer?: boolean | null;

  // Relations
  fixture?: Fixture | null;
  type?: PlaceholderType | null; // Period type object
  events?: PlayerEvent[] | null; // Events that occurred in this period
  timeline?: PlaceholderTimelineEvent[] | null; // Simplified timeline events
  statistics?: FixtureStatistics[] | null; // Use actual FixtureStatistics type
};

// --- Main Period Schema based on SportMonks API Documentation ---
export const PeriodSchema: z.ZodType<Period> = z.lazy(() => // Wrapped in z.lazy() due to circular dependency with FixtureSchema
  z.object({
    id: z.number(),
    fixture_id: z.number().nullable().optional(),
    type_id: z.number().nullable().optional(),
    started: z.number().int().nullable().optional(),
    ended: z.number().int().nullable().optional(),
    counts_from: z.number().int().nullable().optional(),
    ticking: z.boolean().nullable().optional(),
    sort_order: z.number().int().nullable().optional(),
    description: z.string().nullable().optional(),
    time_added: z.number().int().nullable().optional(),
    period_length: z.number().int().nullable().optional(),
    minutes: z.number().int().nullable().optional(),
    seconds: z.number().int().nullable().optional(),
    has_timer: z.boolean().nullable().optional(),

    // Relations (using actual schemas where available, placeholders otherwise)
    fixture: z.lazy(() => FixtureSchema).nullable().optional(), // FixtureSchema itself is lazy
    type: TypeSchemaPlaceholder,
    events: z.array(PlayerEventsSchema).nullable().optional(),
    timeline: z.array(TimelineEventSchemaPlaceholder).nullable().optional(),
    statistics: z.array(FixtureStatisticsSchema).nullable().optional(), // Use actual FixtureStatisticsSchema
  })
);

// The explicit Period type is defined above.
// export type Period = z.infer<typeof PeriodSchema>; // This is no longer needed