import { z } from "zod";
import { type Country, CountrySchema } from "./country.schema";
import { type Sport, SportSchema } from "./sport.schema"; // Import actual Sport schema and type
import { type City, CitySchema } from "./city.schema"; // Import actual City schema and type
import { type RefereeStatistic, RefereeStatisticSchema } from "./referee-statistic.schema"; // Import actual RefereeStatistic schema and type

// --- Forward declare the Referee Type ---
export type Referee = {
  id: number;
  sport_id?: number | null;
  country_id?: number | null;
  city_id?: number | null;
  common_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  fullname?: string | null;
  image_path?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality_id?: number | null;

  // Relations
  sport?: Sport | null; // Use actual Sport type
  country?: Country | null;
  nationality?: Country | null;
  city?: City | null; // Use actual City type
  statistics?: RefereeStatistic[] | null; // Use actual RefereeStatistic type
};

// --- Main Referee Schema ---
export const RefereeSchema: z.ZodType<Referee> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    sport_id: z.number().int().nullable().optional(),
    country_id: z.number().int().nullable().optional(),
    city_id: z.number().int().nullable().optional(),
    common_name: z.string().nullable().optional(),
    firstname: z.string().nullable().optional(),
    lastname: z.string().nullable().optional(),
    fullname: z.string().nullable().optional(),
    image_path: z.string().url().nullable().optional(),
    date_of_birth: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    gender: z.string().nullable().optional(),
    nationality_id: z.number().int().nullable().optional(),

    // Relations
    sport: z.lazy(() => SportSchema).nullable().optional(),
    country: z.lazy(() => CountrySchema).nullable().optional(),
    nationality: z.lazy(() => CountrySchema).nullable().optional(), // Assuming nationality is also a Country object
    city: z.lazy(() => CitySchema).nullable().optional(),
    statistics: z.array(z.lazy(() => RefereeStatisticSchema)).nullable().optional(),
  })
);
