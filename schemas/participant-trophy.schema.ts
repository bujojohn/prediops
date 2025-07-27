import { z } from "zod";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type League, LeagueSchema } from "./league.schema";
import { type Season, SeasonSchema } from "./season.schema";

// --- Placeholder Schemas for Related Entities (defined in this file for now) ---
const TrophySchemaPlaceholder = z.any().nullable().optional(); // For the definition of the trophy itself

// --- Define simple placeholder interfaces for use in the ParticipantTrophy type ---
interface PlaceholderTrophy { id?: number | null; name?: string | null; }

// --- Forward declare the ParticipantTrophy Type ---
export type ParticipantTrophy = {
  id?: number | null; // ID of this specific trophy record for the participant
  participant_id?: number | null;
  league_id?: number | null;
  season_id?: number | null;
  trophy_id?: number | null; // ID of the actual trophy definition

  // Relations
  team?: Participant | null; // Use explicit Participant type
  league?: League | null; // Use explicit League type
  season?: Season | null; // Use explicit Season type
  trophy?: PlaceholderTrophy | null; // The trophy definition
};

// --- Main ParticipantTrophy Schema based on SportMonks API Documentation ---
export const ParticipantTrophySchema: z.ZodType<ParticipantTrophy> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number().nullable().optional(),
    participant_id: z.number().nullable().optional(),
    league_id: z.number().nullable().optional(),
    season_id: z.number().nullable().optional(),
    trophy_id: z.number().nullable().optional(),

    // Relations (using actual schemas where available, placeholders otherwise)
    team: ParticipantSchema.nullable().optional(),
    league: LeagueSchema.nullable().optional(),
    season: SeasonSchema.nullable().optional(),
    trophy: TrophySchemaPlaceholder,
  })
);

// The explicit ParticipantTrophy type is defined above.
// export type ParticipantTrophy = z.infer<typeof ParticipantTrophySchema>; // This is no longer needed
