import { z } from "zod";

// --- Placeholder Schemas for Related Entities (defined in this file for now) ---
const MarketSchemaPlaceholder = z.any().nullable().optional();
const BookmakerSchemaPlaceholder = z.any().nullable().optional();
const FixtureSchemaPlaceholder = z.any().nullable().optional();

// --- Define simple placeholder interfaces for use in the Odd type ---
interface PlaceholderMarket { id?: number | null; name?: string | null; }
interface PlaceholderBookmaker { id?: number | null; name?: string | null; }
interface PlaceholderFixture { id?: number | null; name?: string | null; }

// --- Forward declare the Odd Type ---
export type Odd = {
  id?: number | null;
  fixture_id?: number | null;
  market_id?: number | null;
  bookmaker_id?: number | null;
  label?: string | null; // e.g., "1", "X", "2", "Over 2.5", "Under 2.5"
  value?: string | number | null; // The odd value, can be decimal string or number
  name?: string | null; // Sometimes used interchangeably with label or for additional description
  handicap?: string | number | null;
  probability?: string | number | null; // Implied probability by the bookmaker
  dp3?: string | null; // Value formatted to 3 decimal places
  last_update?: string | null; // Timestamp of the last update
  // original_label?: string | null; // Sometimes present
  // winning?: boolean | null; // If this odd was a winning one after fixture completion
  // stopped?: boolean | null; // If betting on this odd is currently suspended

  // Relations
  market?: PlaceholderMarket | null;
  bookmaker?: PlaceholderBookmaker | null;
  fixture?: PlaceholderFixture | null;
};

// --- Main Odds Schema based on SportMonks API Documentation ---
export const OddsSchema: z.ZodType<Odd> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number().nullable().optional(),
    fixture_id: z.number().nullable().optional(),
    market_id: z.number().nullable().optional(),
    bookmaker_id: z.number().nullable().optional(),
    label: z.string().nullable().optional(),
    value: z.union([z.string(), z.number()]).nullable().optional(),
    name: z.string().nullable().optional(),
    handicap: z.union([z.string(), z.number()]).nullable().optional(),
    probability: z.union([z.string(), z.number()]).nullable().optional(),
    dp3: z.string().nullable().optional(),
    last_update: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    // original_label: z.string().nullable().optional(),
    // winning: z.boolean().nullable().optional(),
    // stopped: z.boolean().nullable().optional(),

    // Relations (using placeholders)
    market: MarketSchemaPlaceholder,
    bookmaker: BookmakerSchemaPlaceholder,
    fixture: FixtureSchemaPlaceholder, // This will eventually be z.lazy(() => FixtureSchema) if FixtureSchema imports OddsSchema
  })
);

// The explicit Odd type is defined above.
// export type Odd = z.infer<typeof OddsSchema>; // This is no longer needed
