import { z } from "zod";
import { FixtureSchema, Fixture } from "./fixture.schema";

export type ValueBetPrediction = {
    bet: string;
    bookmaker: string;
    odd: number;
    is_value: boolean;
    stake: number;
    fair_odd: number;
  };
  
  export type ValueBet = {
    id: number;
    fixture_id: number;
    predictions: ValueBetPrediction;
    fixture?: Fixture | null;
    type_id: number;
  };
  
// Individual value bet prediction
export const ValueBetPredictionSchema = z.object({
  bet: z.string(),
  bookmaker: z.string(),
  odd: z.number(),
  is_value: z.boolean(),
  stake: z.number(),
  fair_odd: z.number(),
});

// Single value bet item
export const ValueBetSchema = z.object({
  id: z.number(),
  fixture_id: z.number(),
  predictions: ValueBetPredictionSchema,
  fixture: z.lazy(() => FixtureSchema).nullable().optional(),
  type_id: z.number(),
});

