import { z } from "zod";
import { type Country, CountrySchema } from "./country.schema"; // Import actual Country schema and type
import { type Region, RegionSchema } from "./region.schema";   // Import actual Region schema and type

// --- Forward declare the City Type ---
export type City = {
  id: number;
  country_id?: number | null;
  region_id?: number | null;
  name?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  geoname_id?: number | null;

  // Relations
  country?: Country | null; // Use actual Country type
  region?: Region | null;   // Use actual Region type
};

// --- Main City Schema ---
export const CitySchema: z.ZodType<City> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    country_id: z.number().int().nullable().optional(),
    region_id: z.number().int().nullable().optional(),
    name: z.string().nullable().optional(),
    latitude: z.string().nullable().optional(), // Consider z.number() if appropriate
    longitude: z.string().nullable().optional(), // Consider z.number() if appropriate
    geoname_id: z.number().int().nullable().optional(),

    // Relations
    country: z.lazy(() => CountrySchema).nullable().optional(),
    region: z.lazy(() => RegionSchema).nullable().optional(),
  })
);
