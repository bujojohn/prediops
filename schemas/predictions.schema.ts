import { z } from 'zod';
import { TypeSchema } from './type.schema'

// Common schemas for prediction objects
const HomeAwayDrawPredictions = z.object({
  home: z.number().optional(),
  away: z.number().optional(),
  draw: z.number().optional(),
});

const YesNoPredictions = z.object({
  yes: z.number().optional(),
  no: z.number().optional(),
});

const HalfTimeFullTimePredictions = z.object({
  home_home: z.number().optional(),
  home_away: z.number().optional(),
  home_draw: z.number().optional(),
  away_home: z.number().optional(),
  away_away: z.number().optional(),
  away_draw: z.number().optional(),
  draw_draw: z.number().optional(),
  draw_home: z.number().optional(),
  draw_away: z.number().optional(),
});

const ScorePredictions = z.object({
  '0-0': z.number().optional(),
  '0-1': z.number().optional(),
  '0-2': z.number().optional(),
  '0-3': z.number().optional(),
  Other_1: z.number().optional(),
  '1-0': z.number().optional(),
  '1-1': z.number().optional(),
  '1-2': z.number().optional(),
  '1-3': z.number().optional(),
  Other_2: z.number().optional(),
  '2-0': z.number().optional(),
  '2-1': z.number().optional(),
  '2-2': z.number().optional(),
  '2-3': z.number().optional(),
  '3-0': z.number().optional(),
  '3-1': z.number().optional(),
  '3-2': z.number().optional(),
  '3-3': z.number().optional(),
  Other_X: z.number().optional(),
});

const ScoreObject = z.object({
  '0_0': z.number().optional(),
  '0_1': z.number().optional(),
  '0_2': z.number().optional(),
  '0_3': z.number().optional(),
  other_1: z.number().optional(),
  '1_0': z.number().optional(),
  '1_1': z.number().optional(),
  '1_2': z.number().optional(),
  '1_3': z.number().optional(),
  other_2: z.number().optional(),
  '2_0': z.number().optional(),
  '2_1': z.number().optional(),
  '2_2': z.number().optional(),
  '2_3': z.number().optional(),
  '3_0': z.number().optional(),
  '3_1': z.number().optional(),
  '3_2': z.number().optional(),
  '3_3': z.number().optional(),
  other_x: z.number().optional(),
});

// Main prediction object schema with more flexible predictions field
export const PredictionSchema = z.object({
  id: z.number(),
  fixture_id: z.number(),
  predictions: z.union([
    HomeAwayDrawPredictions,
    YesNoPredictions,
    HalfTimeFullTimePredictions,
    z.object({
      scores: ScorePredictions.optional(),
      score: ScoreObject.optional(),
    }),
    z.any(), // Allow any structure for predictions
  ]).optional(),
  type_id: z.number(),
  type: TypeSchema.nullable().optional(),
});

// Array schema for the complete data structure
export const PredictionsArraySchema = z.array(PredictionSchema);

// Type inference for TypeScript
export type Prediction = z.infer<typeof PredictionSchema>;
export type PredictionsArray = z.infer<typeof PredictionsArraySchema>;