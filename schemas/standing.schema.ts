import { z } from "zod";
import { type Participant, ParticipantSchema } from "./participant.schema";
import { type Season, SeasonSchema } from "./season.schema";
import { type League, LeagueSchema } from "./league.schema";
import { type Stage, StageSchema } from "./stage.schema";
import { type Group, GroupSchema } from "./group.schema";
import { type Round, RoundSchema } from "./round.schema";
import { type Sport, SportSchema } from "./sport.schema";
import { type StandingRule, StandingRuleSchema } from "./standing-rule.schema";
import { type StandingDetail, StandingDetailSchema } from "./standing-detail.schema";
import { type StandingForm, StandingFormSchema } from "./standing-form.schema"; // Import actual StandingForm schema and type

// --- Forward declare the Standing Type ---
export type Standing = {
  id?: number | null; // ID of the standing record itself
  participant_id?: number | null;
  sport_id?: number | null;
  league_id?: number | null;
  season_id?: number | null;
  stage_id?: number | null;
  group_id?: number | null;
  round_id?: number | null;
  position?: number | null;
  points?: number | null;
  games_played?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals_for?: number | null;
  goals_against?: number | null;
  goal_difference?: number | null;
  form?: string | null; // e.g., "WWLDW"
  result?: string | null; // e.g., "Champions League qualification", "Relegation"
  // Add other fields like home_points, away_points etc. if available from API

  // Relations
  participant?: Participant | null;
  season?: Season | null;
  league?: League | null;
  stage?: Stage | null;
  group?: Group | null;
  round?: Round | null;
  sport?: Sport | null;
  rule?: StandingRule | null; // Use explicit StandingRule type
  details?: StandingDetail[] | null; // Use explicit StandingDetail type
  form_details?: StandingForm[] | null; // Use explicit StandingForm type
};

// --- Main Standing Schema based on SportMonks API Documentation ---
export const StandingSchema: z.ZodType<Standing> = z.lazy(() => // Wrapped in z.lazy() for consistency
  z.object({
    id: z.number().nullable().optional(),
    participant_id: z.number().nullable().optional(),
    sport_id: z.number().nullable().optional(),
    league_id: z.number().nullable().optional(),
    season_id: z.number().nullable().optional(),
    stage_id: z.number().nullable().optional(),
    group_id: z.number().nullable().optional(),
    round_id: z.number().nullable().optional(),
    position: z.number().int().nullable().optional(),
    points: z.number().int().nullable().optional(),
    games_played: z.number().int().nullable().optional(),
    wins: z.number().int().nullable().optional(),
    draws: z.number().int().nullable().optional(),
    losses: z.number().int().nullable().optional(),
    goals_for: z.number().int().nullable().optional(),
    goals_against: z.number().int().nullable().optional(),
    goal_difference: z.number().int().nullable().optional(),
    form: z.string().nullable().optional(),
    result: z.string().nullable().optional(),

    // Relations (using actual schemas where available, placeholders otherwise)
    participant: ParticipantSchema.nullable().optional(),
    season: SeasonSchema.nullable().optional(),
    league: LeagueSchema.nullable().optional(),
    stage: StageSchema.nullable().optional(),
    group: GroupSchema.nullable().optional(),
    round: RoundSchema.nullable().optional(),
    sport: SportSchema.nullable().optional(),
    rule: StandingRuleSchema.nullable().optional(), // Use actual StandingRuleSchema
    details: z.array(StandingDetailSchema).nullable().optional(), // Use actual StandingDetailSchema
    form_details: z.array(StandingFormSchema).nullable().optional(), // Use actual StandingFormSchema
  })
);

// The explicit Standing type is defined above.
// export type Standing = z.infer<typeof StandingSchema>; // This is no longer needed
