import {z, nullable} from 'zod';
import {FixtureSchema} from './fixture.schema';


// Zod schema for PredictFixture
export const PredictFixtureSchema = z.object({
  fixture_id: nullable(z.number()),
  fixture: nullable(FixtureSchema),
  outcome: nullable(z.number()),
  disabled: z.boolean(),
});


// TypeScript type for PredictFixture based on the Zod schema
export type PredictFixture = z.infer<typeof PredictFixtureSchema>;