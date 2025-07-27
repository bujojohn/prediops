import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema"; // Import actual Fixture schema and type
import { type Country, CountrySchema } from "./country.schema"; // Import actual Country schema and type

// --- Forward declare the TVStation Type ---
export type TVStation = {
  id: number;
  name?: string | null;
  url?: string | null;
  image_path?: string | null;
  country_id?: number | null;

  // Relations
  fixtures?: Fixture[] | null; // Use actual Fixture type
  countries?: Country[] | null; // Use actual Country type, assuming it can be an array
  // If it's a single country object related by country_id, this might be `country?: Country | null;`
};

// --- Main TVStation Schema ---
export const TVStationSchema: z.ZodType<TVStation> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    url: z.string().url().nullable().optional(),
    image_path: z.string().url().nullable().optional(),
    country_id: z.number().int().nullable().optional(),

    // Relations
    fixtures: z.array(z.lazy(() => FixtureSchema)).nullable().optional(),
    // Assuming 'countries' is the correct relation name and it can be an array.
    // If the API returns a single 'country' object based on 'country_id', 
    // this should be: country: z.lazy(() => CountrySchema).nullable().optional()
    countries: z.array(z.lazy(() => CountrySchema)).nullable().optional(), 
  })
);
