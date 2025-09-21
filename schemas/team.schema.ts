import { z } from "zod";
import { CountrySchema } from "./country.schema";
import { VenueSchema } from "./venue.schema";
import { SportSchema } from "./sport.schema";
import { SeasonSchema } from "./season.schema";
import { CoachSchema } from "./coach.schema";
import { PlayerSchema } from "./player.schema";
import { FixtureSchema } from "./fixture.schema";
import { TeamStatisticsSchema } from "./team-statistics.schema";
import { SocialSchema } from "./social.schema";
import { ParticipantTrophySchema } from "./participant-trophy.schema";
import { RivalSchema } from "./rival.schema";
import { RankingSchema } from "./ranking.schema";


export const TeamSchema = z.object({
  id: z.number().describe("Unique identifier for the team."),
  sport_id: z.number().describe("ID of the sport the team belongs to."),
  country_id: z.number().describe("ID of the country the team belongs to."),
  venue_id: z.number().describe("ID of the team's home venue."),
  gender: z.string().nullable().optional().describe("Gender of the team (e.g., 'male', 'female')."),
  name: z.string().describe("Name of the team."),
  short_code: z.string().nullable().optional().describe("Short code or abbreviation for the team."),
  image_path: z.string().nullable().optional().describe("URL to the team's logo or image."),
  founded: z.number().nullable().optional().describe("Year the team was founded."),
  type: z.string().nullable().optional().describe("Type of team (e.g., 'club', 'national')."),
  placeholder: z.boolean().nullable().optional().describe("Indicates if the team is a placeholder (e.g., for a future season)."),
  last_played_at: z.string().nullable().optional().describe("Datetime of the team's last match."),
  country: CountrySchema.nullable().optional().describe("Country the team belongs to."),   
  venue: VenueSchema.nullable().optional().describe("Venue the team plays at."),
  sport: SportSchema.nullable().optional().describe("Sport the team belongs to."),
  seasons: z.array(SeasonSchema).nullable().optional().describe("Seasons the team has participated in."),                                                                  
  coaches: z.array(CoachSchema).nullable().optional().describe("Coaches of the team."),
  players: z.array(PlayerSchema).nullable().optional().describe("Players of the team."),   
  latest: z.array(FixtureSchema).nullable().optional().describe("Latest fixtures of the team."),                                                                           
  upcoming: z.array(FixtureSchema).nullable().optional().describe("Upcoming fixtures of the team."),                                                                       
  statistics: z.array(TeamStatisticsSchema).nullable().optional().describe("Statistics of the team."),                                                                     
  socials: z.array(SocialSchema).nullable().optional().describe("Socials of the team."),   
  trophies: z.array(ParticipantTrophySchema).nullable().optional().describe("Trophies of the team."),                                                                      
  rivals: z.array(RivalSchema).nullable().optional().describe("Rivals of the team."),      
  activeSeasons: z.array(SeasonSchema).nullable().optional().describe("Active seasons of the team."),                                                                      
  rankings: z.array(RankingSchema).nullable().optional().describe("Rankings of the team."),
  //sidelinedHistory: z.array(SidelinedSchema).nullable().optional().describe("Sidelined players of the team."),
});

export type Team = z.infer<typeof TeamSchema>;