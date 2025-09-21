import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema";
import { type Venue, VenueSchema } from "./venue.schema";
import { type Coach, CoachSchema } from "./coach.schema";
import { type Sport, SportSchema } from "./sport.schema"; 
import { type Country, CountrySchema } from "./country.schema"; 
import { type Season, SeasonSchema } from "./season.schema"; 
import { type Player, PlayerSchema } from "./player.schema";
import { type Rival, RivalSchema } from "./rival.schema";
import { type TeamSquad, TeamSquadSchema } from "./team-squad.schema";
import { type TeamStatistics, TeamStatisticsSchema } from "./team-statistics.schema";
import { type ParticipantTrophy, ParticipantTrophySchema } from "./participant-trophy.schema";

// --- Forward declare Participant type ---
export type Participant = {
  id: number; 
  sport_id?: number | null;
  country_id?: number | null;
  venue_id?: number | null;
  gender?: string | null;
  name?: string | null;
  short_code?: string | null;
  image_path?: string | null;
  founded?: number | null;
  type?: string | null; 
  placeholder?: boolean | null;
  last_played_at?: string | null;
  national_team?: boolean | null; 
  meta?: {
    location?: string | null; 
    winner?: boolean | null;
    position?: number | null; 
  } | null;

  // Relations
  sport?: Sport | null;
  country?: Country | null;
  venue?: Venue | null;
  coaches?: Coach[] | null;
  rivals?: Rival[] | null; 
  players?: Player[] | null; 
  latest?: Fixture[] | null; 
  upcoming?: Fixture[] | null; 
  seasons?: Season[] | null; 
  activeSeasons?: Season[] | null; 
  squads?: TeamSquad[] | null; 
  statistics?: TeamStatistics[] | null; 
  trophies?: ParticipantTrophy[] | null; // Correctly typed
};

// Zod schema for Participant (representing a Team in fixture context)
export const ParticipantSchema: z.ZodType<Participant> = z.lazy(() =>
  z.object({
    id: z.number(),
    sport_id: z.number().nullable().optional(),
    country_id: z.number().nullable().optional(),
    venue_id: z.number().nullable().optional(),
    gender: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    short_code: z.string().nullable().optional(),
    image_path: z.string().url().nullable().optional(),
    founded: z.number().int().nullable().optional(),
    type: z.string().nullable().optional(),
    placeholder: z.boolean().nullable().optional(),
    last_played_at: z.string().nullable().optional(),
    national_team: z.boolean().nullable().optional(),
    meta: z
      .object({
        location: z.string().nullable().optional(),
        winner: z.boolean().nullable().optional(),
        position: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),

    // Relations
    sport: SportSchema.nullable().optional(),
    country: CountrySchema.nullable().optional(),
    venue: VenueSchema.nullable().optional(),
    coaches: z.array(CoachSchema).nullable().optional(),
    rivals: z.array(RivalSchema).nullable().optional(), 
    players: z.array(PlayerSchema).nullable().optional(), 
    latest: z.array(FixtureSchema).nullable().optional(),
    upcoming: z.array(FixtureSchema).nullable().optional(),
    seasons: z.array(SeasonSchema).nullable().optional(),
    activeSeasons: z.array(SeasonSchema).nullable().optional(),
    squads: z.array(TeamSquadSchema).nullable().optional(), 
    statistics: z.array(TeamStatisticsSchema).nullable().optional(), 
    trophies: z.array(ParticipantTrophySchema).nullable().optional(), // Correctly uses ParticipantTrophySchema
  })
);

// export type Participant = z.infer<typeof ParticipantSchema>; // Replaced by forward declaration