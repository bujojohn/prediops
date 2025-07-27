import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Country, CountrySchema } from "./country.schema"; // Import actual Country schema and type
import { type City, CitySchema } from "./city.schema"; // Import actual City schema and type

// --- Forward declare the Venue Type ---
export type Venue = {
  id: number;
  country_id?: number | null;
  city_id?: number | null;
  name?: string | null;
  address?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  capacity?: number | null;
  image_path?: string | null;
  city_name?: string | null; // This might be redundant if the city object is included
  surface?: string | null;
  national_team?: boolean | null;

  // Relations
  country?: Country | null; // Use explicit Country type
  city?: City | null; // Use explicit City type
  fixtures?: Fixture[] | null; // Use explicit Fixture type
};

// --- Main Venue Schema based on SportMonks API Documentation and common patterns ---
export const VenueSchema: z.ZodType<Venue> = z.lazy(() =>
  z.object({
    id: z.number(),
    country_id: z.number().nullable().optional(),
    city_id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    latitude: z.string().nullable().optional(),
    longitude: z.string().nullable().optional(),
    capacity: z.number().int().nullable().optional(),
    image_path: z.string().url().nullable().optional(),
    city_name: z.string().nullable().optional(),
    surface: z.string().nullable().optional(),
    national_team: z.boolean().nullable().optional(),

    // Relations (using actual schemas)
    country: CountrySchema.nullable().optional(),
    city: CitySchema.nullable().optional(),
    fixtures: z.array(FixtureSchema).nullable().optional(),
  })
);