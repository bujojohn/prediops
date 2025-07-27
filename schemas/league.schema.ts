import { z } from "zod";
import { type Sport, SportSchema } from "./sports.schema"; 
import { type Season, SeasonSchema } from "./season.schema";
import { type Stage, StageSchema } from "./stage.schema";
import { type Country, CountrySchema } from "./country.schema";
import { type Fixture, FixtureSchema } from "./fixture.schema"; // Import actual FixtureSchema and its type

export type League = {
  id: number;
  sport_id?: number | null;
  country_id?: number | null;
  name?: string | null;
  active?: boolean | null;
  short_code?: string | null;
  image_path?: string | null;
  type?: string | null;
  sub_type?: string | null;
  last_played_at?: string | null;
  category?: number | null;
  has_jerseys?: boolean | null;
  sort_order?: number | null;
  sport?: Sport | null; 
  country?: Country | null; 
  stages?: Stage[] | null; 
  latest?: Fixture[] | null; // Use explicit Fixture type
  upcoming?: Fixture[] | null; // Use explicit Fixture type
  inplay?: Fixture[] | null; // Use explicit Fixture type
  today?: Fixture[] | null; // Use explicit Fixture type
  currentseason?: Season | null; 
  seasons?: Season[] | null; 
};

// --- Main League Schema based on SportMonks API Documentation ---
export const LeagueSchema: z.ZodType<League> = z.lazy(() =>
  z.object({
    id: z.number(),
    sport_id: z.number().nullable().optional(),
    country_id: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    active: z.boolean().nullable().optional(),
    short_code: z.string().nullable().optional(),
    image_path: z.string().url().nullable().optional(),
    type: z.string().nullable().optional(),
    sub_type: z.string().nullable().optional(),
    last_played_at: z.string().datetime({ precision: 0, message: "Invalid datetime string" }).nullable().optional(),
    category: z.number().int().nullable().optional(),
    has_jerseys: z.boolean().nullable().optional(),
    sort_order: z.number().nullable().optional(), 

    sport: SportSchema.nullable().optional(), 
    country: CountrySchema.nullable().optional(), 
    stages: z.array(StageSchema).nullable().optional(), 
    latest: z.array(FixtureSchema).nullable().optional(), // Use actual FixtureSchema
    upcoming: z.array(FixtureSchema).nullable().optional(), // Use actual FixtureSchema
    inplay: z.array(FixtureSchema).nullable().optional(), // Use actual FixtureSchema
    today: z.array(FixtureSchema).nullable().optional(), // Use actual FixtureSchema
    currentseason: SeasonSchema.nullable().optional(), 
    seasons: z.array(SeasonSchema).nullable().optional(), 
  })
);

// The explicit League type is defined above.
// export type League = z.infer<typeof LeagueSchema>;