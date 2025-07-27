import { z } from 'zod';
import { type Country, CountrySchema } from './country.schema';

// Forward declaration for CitySchema to handle potential circular dependency if Region links back to City
const CitySchemaForwardRef = z.lazy(() => CitySchema);

export type Region = {
  id: number;
  country_id?: number | null;
  name?: string | null;
  // Relations
  country?: Country | null;
  cities?: import('./city.schema').City[] | null; // Assuming a region can have multiple cities
};

export const RegionSchema: z.ZodType<Region> = z.object({
  id: z.number().int(),
  country_id: z.number().int().nullable().optional(),
  name: z.string().nullable().optional(),
  // Relations
  country: z.lazy(() => CountrySchema).nullable().optional(),
  cities: z.array(CitySchemaForwardRef).nullable().optional(),
});

// Import actual CitySchema to resolve the forward reference
// This creates a circular dependency, so z.lazy() is essential.
import { CitySchema } from './city.schema';
