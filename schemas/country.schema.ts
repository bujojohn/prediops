import { z } from "zod";
import { type Continent, ContinentSchema } from "./continent.schema"; // Import actual Continent schema and type
import { type League, LeagueSchema } from "./league.schema";       // Import actual League schema and type
import { type Region, RegionSchema } from "./region.schema";       // Import actual Region schema and type

// --- Forward declare the Country Type ---
export type Country = {
  id: number;
  continent_id?: number | null;
  name?: string | null;
  official_name?: string | null;
  fifa_name?: string | null;
  iso2?: string | null;
  iso3?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  borders?: string[] | null;
  image_path?: string | null;

  // Relations
  continent?: Continent | null; // Use actual Continent type
  leagues?: League[] | null;    // Use actual League type
  regions?: Region[] | null;    // Use actual Region type
};

// --- Main Country Schema ---
export const CountrySchema: z.ZodType<Country> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    continent_id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
    official_name: z.string().nullable().optional(),
    fifa_name: z.string().nullable().optional(),
    iso2: z.string().nullable().optional(),
    iso3: z.string().nullable().optional(),
    latitude: z.string().nullable().optional(),
    longitude: z.string().nullable().optional(),
    borders: z.array(z.string()).nullable().optional(),
    image_path: z.string().url().nullable().optional(),

    // Relations
    continent: z.lazy(() => ContinentSchema).nullable().optional(),
    leagues: z.array(z.lazy(() => LeagueSchema)).nullable().optional(),
    regions: z.array(z.lazy(() => RegionSchema)).nullable().optional(),
  })
);

