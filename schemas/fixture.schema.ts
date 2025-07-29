//<reference types="react" />
// Purpose: Typescript schema for fixture data, reconciled with SportMonks API.

import { z } from "zod";
import { SportSchema, type Sport } from "./sport.schema";
import { RoundSchema, type Round } from "./round.schema"; 
import { LeagueSchema, type League } from "./league.schema";
import { StateSchema, type State } from "./state.schema";
import { SeasonSchema, type Season } from "./season.schema";
import { StageSchema, type Stage } from "./stage.schema";
import { FixtureAggregateSchema, type FixtureAggregate } from "./fixture-aggregate.schema";
import { GroupSchema, type Group } from "./group.schema";
import { VenueSchema, type Venue } from "./venue.schema";
import { RefereeSchema, type Referee } from "./referee.schema";
import { CoachSchema, type Coach } from "./coach.schema";
import { ParticipantSchema, type Participant } from "./participant.schema";
import { ScoresSchema, type Scores } from "./scores.schema"; 
import { PlayerEventsSchema, type PlayerEvent } from "./player-events.schema";
import { LineupSchema, type Lineup } from "./lineup.schema";
import { FormationSchema, type Formation } from "./formation.schema";
import { PeriodSchema, type Period } from "./period.schema";
import { FixtureStatisticsSchema, type FixtureStatistics } from "./fixture-statistics.schema";
import { TVStationSchema, type TVStation } from "./tvstation.schema";
import { OddsSchema, type Odd } from "./odds.schema";
import { CommentSchema, type Comment } from "./comment.schema";
import { SidelinedSchema, type Sidelined } from "./sidelined.schema";
import { BallCoordinatesSchema, type BallCoordinates } from "./ball-coordinates.schema";
import { FixtureMetadataSchema, type FixtureMetadata } from "./fixture-metadata.schema"; // Import actual FixtureMetadataSchema and its type
import { PredictionSchema, type Prediction } from "./predictions.schema";

// --- Forward declare the Fixture type for explicit annotation ---
// This helps TypeScript with circular dependencies when z.lazy is used.
export type Fixture = {
  id: number;
  sport_id?: number | null;
  league_id?: number | null;
  season_id?: number | null;
  stage_id?: number | null;
  group_id?: number | null;
  aggregate_id?: number | null;
  round_id?: number | null;
  state_id?: number | null;
  venue_id?: number | null;
  name?: string | null;
  starting_at?: string | null;
  result_info?: string | null;
  leg?: string | null;
  details?: string | null;
  length?: number | null;
  placeholder?: boolean | null;
  has_odds?: boolean | null;
  starting_at_timestamp?: number | null;
  sport?: Sport | null; // Use explicit Sport type
  league?: League | null; // Use explicit League type
  season?: Season | null; // Use explicit Season type
  stage?: Stage | null;   // Use explicit Stage type
  round?: Round | null;   // Assuming Round type will be imported
  group?: Group | null;   // Assuming Group type will be imported
  aggregate?: FixtureAggregate | null; // Assuming Aggregate type will be imported
  venue?: Venue | null;     // Assuming Venue type will be imported
  state?: State | null;     // Assuming State type will be imported
  referee?: Referee | null; // Assuming Referee type will be imported
  coaches?: Coach[] | null; 
  participants?: Participant[] | null; // Use actual Participant type
  predictions?: Prediction[] | null; // Use actual Prediction type
  scores?: Scores[] | null; // Use actual Scores type      
  events?: PlayerEvent[] | null; // Use actual PlayerEvent type
  lineups?: Lineup[] | null; // Use actual Lineup type     
  formations?: Formation[] | null; // Use actual Formation type  
  periods?: Period[] | null;      // Use actual Period type
  statistics?: FixtureStatistics[] | null; // Use actual FixtureStatistics type  
  tvstations?: TVStation[] | null; // Use actual TVStation type  
  odds?: Odd[] | null;         // Use actual Odd type        
  comments?: Comment[] | null; // Use actual Comment type    
  sidelined?: Sidelined[] | null; // Use actual Sidelined type   
  ball_coordinates?: BallCoordinates[] | null; // Use actual BallCoordinates type
  metadata?: FixtureMetadata[] | null; // Use actual FixtureMetadata type    
};

// --- Main Fixture Schema based on SportMonks API Documentation ---
export const FixtureSchema: z.ZodType<Fixture> = z.lazy(() => 
  z.object({
    id: z.number().describe("The ID of the fixture entity."),
    sport_id: z.number().nullable().optional().describe("The ID of the sport the fixture belongs to."),
    league_id: z.number().nullable().optional().describe("The ID of the league the fixture belongs to."),
    season_id: z.number().nullable().optional().describe("The ID of the season the fixture belongs to."),
    stage_id: z.number().nullable().optional().describe("The ID of the stage the fixture belongs to."),
    group_id: z.number().nullable().optional().describe("The ID of the group the fixture belongs to."),
    aggregate_id: z.number().nullable().optional().describe("The ID of the aggregate the fixture belongs to (e.g. for two-legged ties)."),
    round_id: z.number().nullable().optional().describe("The ID of the round the fixture belongs to."),
    state_id: z.number().nullable().optional().describe("The ID of the current state of the fixture."),
    venue_id: z.number().nullable().optional().describe("The ID of the venue where the fixture will be played."),
    name: z.string().nullable().optional().describe("The name of the fixture, usually a concatenation of participant names."),
    starting_at: z.string().datetime({ precision: 0, message: "Invalid datetime string. Must be UTC and in YYYY-MM-DD HH:MM:SS format." }).nullable().optional().describe("The UTC datetime when the fixture is scheduled to start."),
    result_info: z.string().nullable().optional().describe("Information about the result (e.g., FT, AET, PEN)."),
    leg: z.string().nullable().optional().describe("The leg of the fixture (e.g., 1/2, 2/2)."),
    details: z.any().nullable().optional().describe("Additional details or metadata about the fixture. Structure may vary."),
    length: z.number().int().nullable().optional().describe("The duration of the match in minutes (e.g., 90, 120)."),
    placeholder: z.boolean().nullable().optional().describe("Indicates if the fixture is a placeholder (e.g., for a future round)."),
    has_odds: z.boolean().nullable().optional().describe("Indicates if pre-match odds are available for this fixture."),
    starting_at_timestamp: z.number().int().nullable().optional().describe("The UNIX timestamp of the starting_at datetime."),
    
    // --- Relations ---
    sport: SportSchema.nullable().optional(),
    league: LeagueSchema.nullable().optional(),
    season: SeasonSchema.nullable().optional(), // Use actual SeasonSchema
    stage: StageSchema.nullable().optional(), // Use actual StageSchema
    round: RoundSchema.nullable().optional(), 
    group: GroupSchema.nullable().optional(), 
    aggregate: FixtureAggregateSchema.nullable().optional(),
    venue: VenueSchema.nullable().optional(),
    state: StateSchema.nullable().optional(),
    coaches: z.array(CoachSchema).nullable().optional(),
    referee: RefereeSchema.nullable().optional(), 
    predictions: z.array(PredictionSchema).nullable().optional(), // Use actual PredictionSchema
    participants: z.array(ParticipantSchema).nullable().optional(), // Use actual ParticipantSchema
    scores: z.array(ScoresSchema).nullable().optional(), // Use actual ScoresSchema
    events: z.array(PlayerEventsSchema).nullable().optional(), // Use actual PlayerEventsSchema
    lineups: z.array(LineupSchema).nullable().optional(), // Use actual LineupSchema
    formations: z.array(FormationSchema).nullable().optional(), // Use actual FormationSchema
    periods: z.array(PeriodSchema).nullable().optional(), // Use actual PeriodSchema
    statistics: z.array(FixtureStatisticsSchema).nullable().optional(), // Use actual FixtureStatisticsSchema
    tvstations: z.array(TVStationSchema).nullable().optional(), // Use actual TVStationSchema
    odds: z.array(OddsSchema).nullable().optional(), // Use actual OddsSchema
    comments: z.array(CommentSchema).nullable().optional(), // Use actual CommentSchema
    sidelined: z.array(SidelinedSchema).nullable().optional(), // Use actual SidelinedSchema
    ball_coordinates: z.array(BallCoordinatesSchema).nullable().optional(), // Use actual BallCoordinatesSchema
    metadata: z.array(FixtureMetadataSchema).nullable().optional(),
  })
);

// export type Fixture = z.infer<typeof FixtureSchema>; // Explicit type is defined above
