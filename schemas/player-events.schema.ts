import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema"; 
import { type Period, PeriodSchema } from "./period.schema"; 
import { type Player, PlayerSchema } from "./player.schema"; 
import { type Participant, ParticipantSchema } from "./participant.schema"; // Use for team/participant
import { type Type, TypeSchema } from "./type.schema"; // Use for event type and sub-type

// --- Forward declare the PlayerEvent Type ---
export type PlayerEvent = {
  id?: number | null;
  fixture_id?: number | null;
  period_id?: number | null;
  participant_id?: number | null;
  type_id?: number | null;
  sub_type_id?: number | null;
  section?: string | null;
  player_id?: number | null;
  related_player_id?: number | null;
  player_name?: string | null;
  related_player_name?: string | null;
  result?: string | null;
  info?: string | null;
  addition?: string | null;
  minute?: number | null;
  extra_minute?: number | null;
  injured?: boolean | null;
  on_bench?: boolean | null;
  coach_id?: number | null;

  // Relations
  fixture?: Fixture | null;
  type?: Type | null;
  subType?: Type | null;
  player?: Player | null;
  relatedPlayer?: Player | null;
  period?: Period | null;
  participant?: Participant | null;
};

// --- Main PlayerEvents Schema ---
export const PlayerEventsSchema: z.ZodType<PlayerEvent> = z.lazy(() => 
  z.object({
    id: z.number().int().nullable().optional(),
    fixture_id: z.number().int().nullable().optional(),
    period_id: z.number().int().nullable().optional(),
    participant_id: z.number().int().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    sub_type_id: z.number().int().nullable().optional(),
    section: z.string().nullable().optional(),
    player_id: z.number().int().nullable().optional(),
    related_player_id: z.number().int().nullable().optional(),
    player_name: z.string().nullable().optional(),
    related_player_name: z.string().nullable().optional(),
    result: z.string().nullable().optional(),
    info: z.string().nullable().optional(),
    addition: z.string().nullable().optional(),
    minute: z.number().int().nullable().optional(),
    extra_minute: z.number().int().nullable().optional(),
    injured: z.boolean().nullable().optional(),
    on_bench: z.boolean().nullable().optional(),
    coach_id: z.number().int().nullable().optional(),

    // Relations
    fixture: z.lazy(() => FixtureSchema).nullable().optional(),
    type: z.lazy(() => TypeSchema).nullable().optional(),
    subType: z.lazy(() => TypeSchema).nullable().optional(),
    player: z.lazy(() => PlayerSchema).nullable().optional(),
    relatedPlayer: z.lazy(() => PlayerSchema).nullable().optional(),
    period: z.lazy(() => PeriodSchema).nullable().optional(),
    participant: z.lazy(() => ParticipantSchema).nullable().optional(),
  })
);
