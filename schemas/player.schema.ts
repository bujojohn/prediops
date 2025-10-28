import { z } from "zod";
import { type Sport, SportSchema } from "./sport.schema";
import { type Country, CountrySchema } from "./country.schema";
import { type City, CitySchema } from "./city.schema";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Transfer, TransferSchema } from "./transfer.schema";
import { type PlayerStatistic, PlayerStatisticSchema } from "./player-statistic.schema"; // Import actual PlayerStatistic schema and type
import { type Position, PositionSchema } from "./position.schema"; // Import actual Position schema and type
import { type DetailedPosition, DetailedPositionSchema } from "./detailed-position.schema"; // Import actual DetailedPosition schema and type

// --- Forward declare the Player Type ---
export type Player = {
  id: number;
  sport_id?: number | null;
  country_id?: number | null; 
  nationality_id?: number | null; 
  city_id?: number | null; 
  position_id?: number | null; 
  detailed_position_id?: number | null; 
  type_id?: number | null; 
  common_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  name?: string | null; 
  display_name?: string | null;
  image_path?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  height?: number | null; 
  weight?: number | null; 
  last_played_at?: string | null;

  // Relations
  sport?: Sport | null;
  country?: Country | null; 
  city?: City | null; 
  nationality?: Country | null; 
  transfers?: Transfer[] | null;
  pendingTransfers?: Transfer[] | null;
  teams?: Participant[] | null;
  statistics?: PlayerStatistic[] | null; // Use actual PlayerStatistic type
  latest?: Fixture[] | null; 
  position?: Position | null; // Use actual Position type
  detailedPosition?: DetailedPosition | null; // Use actual DetailedPosition type
};

// --- Main Player Schema based on SportMonks API Documentation ---
export const PlayerSchema: z.ZodType<Player> = z.lazy(() => 
  z.object({
    id: z.number(),
    sport_id: z.number().nullable().optional(),
    country_id: z.number().nullable().optional(),
    nationality_id: z.number().nullable().optional(),
    city_id: z.number().nullable().optional(),
    position_id: z.number().nullable().optional(),
    detailed_position_id: z.number().nullable().optional(),
    type_id: z.number().nullable().optional(),
    common_name: z.string().nullable().optional(),
    firstname: z.string().nullable().optional(),
    lastname: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    display_name: z.string().nullable().optional(),
    image_path: z.string().url().nullable().optional(),
    date_of_birth: z.iso.date().nullable().optional(),
    gender: z.string().nullable().optional(),
    height: z.number().int().nullable().optional(),
    weight: z.number().int().nullable().optional(),
    last_played_at: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),

    // Relations
    sport: SportSchema.nullable().optional(),
    country: CountrySchema.nullable().optional(),
    city: CitySchema.nullable().optional(), 
    nationality: CountrySchema.nullable().optional(), 
    transfers: z.array(z.lazy(() => TransferSchema)).nullable().optional(),
    pendingTransfers: z.array(z.lazy(() => TransferSchema)).nullable().optional(),
    teams: z.array(ParticipantSchema).nullable().optional(),
    statistics: z.array(z.lazy(() => PlayerStatisticSchema)).nullable().optional(), // Use actual PlayerStatisticSchema
    latest: z.array(FixtureSchema).nullable().optional(),
    position: z.lazy(() => PositionSchema).nullable().optional(), // Use actual PositionSchema
    detailedPosition: z.lazy(() => DetailedPositionSchema).nullable().optional(), // Use actual DetailedPositionSchema
  })
);

// The explicit Player type is defined above.
// export type Player = z.infer<typeof PlayerSchema>;
