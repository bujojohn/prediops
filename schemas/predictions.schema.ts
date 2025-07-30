import { z } from 'zod';
import { TypeSchema } from './type.schema'

// Common schemas for prediction objects
const HomeAwayDrawPredictions = z.object({
  home: z.number(),
  away: z.number(),
  draw: z.number(),
});

const YesNoPredictions = z.object({
  yes: z.number(),
  no: z.number(),
});

const HalfTimeFullTimePredictions = z.object({
  home_home: z.number(),
  home_away: z.number(),
  home_draw: z.number(),
  away_home: z.number(),
  away_away: z.number(),
  away_draw: z.number(),
  draw_draw: z.number(),
  draw_home: z.number(),
  draw_away: z.number(),
});

const ScorePredictions = z.object({
  '0-0': z.number(),
  '0-1': z.number(),
  '0-2': z.number(),
  '0-3': z.number(),
  Other_1: z.number(),
  '1-0': z.number(),
  '1-1': z.number(),
  '1-2': z.number(),
  '1-3': z.number(),
  Other_2: z.number(),
  '2-0': z.number(),
  '2-1': z.number(),
  '2-2': z.number(),
  '2-3': z.number(),
  '3-0': z.number(),
  '3-1': z.number(),
  '3-2': z.number(),
  '3-3': z.number(),
  Other_X: z.number(),
});

const ScoreObject = z.object({
  '0_0': z.number(),
  '0_1': z.number(),
  '0_2': z.number(),
  '0_3': z.number(),
  other_1: z.number(),
  '1_0': z.number(),
  '1_1': z.number(),
  '1_2': z.number(),
  '1_3': z.number(),
  other_2: z.number(),
  '2_0': z.number(),
  '2_1': z.number(),
  '2_2': z.number(),
  '2_3': z.number(),
  '3_0': z.number(),
  '3_1': z.number(),
  '3_2': z.number(),
  '3_3': z.number(),
  other_x: z.number(),
});

// Main prediction object schema with discriminated union based on type_id
export const PredictionSchema = z.object({
  id: z.number(),
  fixture_id: z.number(),
  predictions: z.union([
    HomeAwayDrawPredictions,
    YesNoPredictions,
    HalfTimeFullTimePredictions,
    z.object({
      scores: ScorePredictions,
      score: ScoreObject,
    }),
  ]),
  type_id: z.number(),
  type: z.array(TypeSchema).nullable().optional(), 
});

// Array schema for the complete data structure
export const PredictionsArraySchema = z.array(PredictionSchema);

// Type inference for TypeScript
export type Prediction = z.infer<typeof PredictionSchema>;
export type PredictionsArray = z.infer<typeof PredictionsArraySchema>;