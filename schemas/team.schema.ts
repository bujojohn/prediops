import { z } from "zod";
import { CountrySchema } from "./country.schema";

export const TeamSchema = z.object({
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
  country: CountrySchema.nullable().describe("Country the team belongs to."),
  // Optionally include relationships if needed
  // country: CountrySchema.nullable().optional(),
  // venue: VenueSchema.nullable().optional(),
});

export type Team = z.infer<typeof TeamSchema>;