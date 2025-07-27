import { z } from 'zod';

// Forward declaration for CountrySchema to handle potential circular dependency
const CountrySchemaForwardRef = z.lazy(() => CountrySchema);

export type Continent = {
  id: number;
  name?: string | null;
  code?: string | null; // Often continents have a code
  // Relations
  countries?: import('./country.schema').Country[] | null; // Assuming a continent can have multiple countries
};

export const ContinentSchema: z.ZodType<Continent> = z.object({
  id: z.number().int(),
  name: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  // Relations
  countries: z.array(CountrySchemaForwardRef).nullable().optional(),
});

// Import actual CountrySchema to resolve the forward reference
// This creates a circular dependency, so z.lazy() is essential.
import { CountrySchema } from './country.schema';
