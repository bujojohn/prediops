import { z } from "zod";
import { type Country, CountrySchema } from "./country.schema";
import { type Player, PlayerSchema } from "./player.schema";
import { type Participant, ParticipantSchema } from "./participant.schema"; // For Team relation
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type ParticipantTrophy, ParticipantTrophySchema } from "./participant-trophy.schema";
import { type CoachStatistic, CoachStatisticSchema } from "./coach-statistic.schema"; // Import actual CoachStatistic schema and type

// --- Forward declare the Coach Type ---
export type Coach = {
  id: number;
  player_id?: number | null;
  sport_id?: number | null;
  country_id?: number | null;
  nationality_id?: number | null;
  common_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  fullname?: string | null;
  image_path?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;

  // Relations
  country?: Country | null; 
  nationality?: Country | null; 
  teams?: Participant[] | null; 
  statistics?: CoachStatistic[] | null; // Use explicit CoachStatistic type
  trophies?: ParticipantTrophy[] | null; 
  fixtures?: Fixture[] | null; 
  player?: Player | null; 
};

// --- Main Coach Schema based on SportMonks API Documentation and common patterns ---
export const CoachSchema: z.ZodType<Coach> = z.lazy(() => 
  z.object({
    id: z.number(),
    player_id: z.number().nullable().optional(), 
    sport_id: z.number().nullable().optional(),
    country_id: z.number().nullable().optional(), 
    nationality_id: z.number().nullable().optional(), 
    common_name: z.string().nullable().optional(),
    firstname: z.string().nullable().optional(),
    lastname: z.string().nullable().optional(),
    fullname: z.string().nullable().optional(), 
    image_path: z.string().url().nullable().optional(),
    date_of_birth: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    gender: z.string().nullable().optional(), 

    // Relations (using actual schemas where available, placeholders otherwise)
    country: CountrySchema.nullable().optional(), 
    nationality: CountrySchema.nullable().optional(), 
    teams: z.array(ParticipantSchema).nullable().optional(), 
    statistics: z.array(CoachStatisticSchema).nullable().optional(), // Use actual CoachStatisticSchema
    trophies: z.array(ParticipantTrophySchema).nullable().optional(), 
    fixtures: z.array(FixtureSchema).nullable().optional(), 
    player: PlayerSchema.nullable().optional(), 
  })
);

// The explicit Coach type is defined above.
// export type Coach = z.infer<typeof CoachSchema>;
