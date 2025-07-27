import { z } from "zod";
import { type Participant, ParticipantSchema } from "./participant.schema"; // Import actual Participant schema and type

// --- Forward declare the Rival Type ---
export type Rival = {
  id?: number | null; // The ID of the rivalry entry itself
  team_id?: number | null; // The ID of the team for whom this is a rival
  rival_id?: number | null; // The ID of the rival team
  // Relations
  team?: Participant | null; // Use explicit Participant type
  rival?: Participant | null; // Use explicit Participant type
};

// --- Main Rival Schema based on SportMonks API Documentation ---
export const RivalSchema: z.ZodType<Rival> = z.lazy(() => 
  z.object({
    id: z.number().nullable().optional(),
    team_id: z.number().nullable().optional(),
    rival_id: z.number().nullable().optional(),

    // Relations (using actual schemas)
    team: ParticipantSchema.nullable().optional(), 
    rival: ParticipantSchema.nullable().optional(), 
  })
);

// The explicit Rival type is defined above.
// export type Rival = z.infer<typeof RivalSchema>; // This is no longer needed
