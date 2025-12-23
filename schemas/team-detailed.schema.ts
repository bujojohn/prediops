import { z } from "zod";
import { CountrySchema } from "./country.schema";
import { FixtureSchema } from "./fixture.schema";
import { SeasonSchema } from "./season.schema";
import { RankingSchema } from "./ranking.schema";
// Coach schema for nested coach data
const CoachSchema = z.object({
  id: z.number(),
  player_id: z.number().nullable().optional(),
  sport_id: z.number().nullable().optional(),
  country_id: z.number().nullable().optional(),
  nationality_id: z.number().nullable().optional(),
  city_id: z.number().nullable().optional(),
  common_name: z.string().nullable().optional(),
  firstname: z.string().nullable().optional(),
  lastname: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  image_path: z.string().nullable().optional(),
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
});

// Team-coach relationship schema (now includes nested coach data)
const TeamCoachSchema = z.object({
  id: z.number(),
  team_id: z.number(),
  coach_id: z.number(),
  position_id: z.number(),
  active: z.boolean(),
  start: z.string().nullable(),
  end: z.string().nullable(),
  temporary: z.boolean(),
  coach: CoachSchema.optional(),
});
// Player schema for nested player data
const PlayerSchema = z.object({
  id: z.number(),
  sport_id: z.number().nullable().optional(),
  country_id: z.number().nullable().optional(),
  nationality_id: z.number().nullable().optional(),
  city_id: z.number().nullable().optional(),
  position_id: z.number().nullable().optional(),
  detailed_position_id: z.number().nullable().optional(),
  type_id: z.number().nullable().optional(),
  common_name: z.string().nullable().optional(),
  firstname: z.string().nullable().optional(),
  lastname: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  image_path: z.string().nullable().optional(),
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
});

// Team-player relationship schema (now includes nested player data)
const TeamPlayerSchema = z.object({
  id: z.number(),
  transfer_id: z.number().nullable(),
  player_id: z.number(),
  team_id: z.number(),
  position_id: z.number(),
  detailed_position_id: z.number().nullable(),
  start: z.string().nullable(),
  end: z.string().nullable(),
  captain: z.boolean(),
  jersey_number: z.number().nullable(),
  player: PlayerSchema.optional(),
});
// Rival team schema (team objects in rivals array)
const RivalTeamSchema = z.object({
  id: z.number(),
  sport_id: z.number().nullable().optional(),
  country_id: z.number().nullable().optional(),
  venue_id: z.number().nullable().optional(),
  gender: z.string().nullable().optional(),
  name: z.string(),
  short_code: z.string().nullable().optional(),
  image_path: z.string().nullable().optional(),
  founded: z.number().nullable().optional(),
  type: z.string().nullable().optional(),
  placeholder: z.boolean().nullable().optional(),
  last_played_at: z.string().nullable().optional(),
});
// Team-trophy relationship schema (not the trophy entity itself)
const TeamTrophySchema = z.object({
  id: z.number(),
  participant_id: z.number(),
  team_id: z.number().nullable(),
  league_id: z.number(),
  season_id: z.number(),
  trophy_id: z.number(),
});
import { SidelinedSchema } from "./sidelined.schema";

// Social media schema
export const SocialSchema = z.object({
  id: z.number().optional(),
  entity_type: z.string().optional(),
  entity_id: z.number().optional(),
  social_network_id: z.number().optional(),
  url: z.string().optional(),
});

// Enhanced Team schema with all includes
export const TeamDetailedSchema = z.object({
  id: z.number().describe("Unique identifier for the team."),
  sport_id: z.number().nullable().describe("ID of the sport the team belongs to."),
  country_id: z.number().nullable().describe("ID of the country the team belongs to."),
  venue_id: z.number().nullable().describe("ID of the team's home venue."),
  gender: z.string().nullable().describe("Gender of the team (e.g., 'male', 'female')."),
  name: z.string().describe("Name of the team."),
  short_code: z.string().nullable().describe("Short code or abbreviation for the team."),
  image_path: z.string().nullable().describe("URL to the team's logo or image."),
  founded: z.number().nullable().describe("Year the team was founded."),
  type: z.string().nullable().describe("Type of team (e.g., 'club', 'national')."),
  placeholder: z.boolean().nullable().describe("Indicates if the team is a placeholder (e.g., for a future season)."),
  last_played_at: z.string().nullable().describe("Datetime of the team's last match."),
  
  // Relations
  country: CountrySchema.nullable().optional().describe("Country the team belongs to."),
  coaches: z.array(TeamCoachSchema).nullable().optional().describe("Current and historical coaching staff."),
  rivals: z.array(RivalTeamSchema).nullable().optional().describe("Traditional rival teams."),
  players: z.array(TeamPlayerSchema).nullable().optional().describe("Current squad players."),
  latest: z.array(FixtureSchema).nullable().optional().describe("Recent fixtures."),
  upcoming: z.array(FixtureSchema).nullable().optional().describe("Upcoming fixtures."),
  seasons: z.array(SeasonSchema).nullable().optional().describe("Historical seasons."),
  activeSeasons: z.array(SeasonSchema).nullable().optional().describe("Currently active seasons."),
  sidelined: z.array(SidelinedSchema).nullable().optional().describe("Currently sidelined players."),
  sidelinedHistory: z.array(SidelinedSchema).nullable().optional().describe("Historical sidelined players."),
  trophies: z.array(TeamTrophySchema).nullable().optional().describe("Team achievements and trophies."),
  socials: z.array(SocialSchema).nullable().optional().describe("Social media links."),
  rankings: z.array(RankingSchema).nullable().optional().describe("Rankings of the team."),
});

export type TeamDetailed = z.infer<typeof TeamDetailedSchema>;
export type TeamCoach = z.infer<typeof TeamCoachSchema>;
export type TeamPlayer = z.infer<typeof TeamPlayerSchema>;
export type TeamTrophy = z.infer<typeof TeamTrophySchema>;
export type RivalTeam = z.infer<typeof RivalTeamSchema>;
export type Social = z.infer<typeof SocialSchema>;
