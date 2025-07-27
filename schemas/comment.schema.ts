import { z } from "zod";
import { type Fixture, FixtureSchema } from "./fixture.schema"; // Import actual Fixture schema and type

// --- Forward declare the Comment Type ---
export type Comment = {
  id?: number | null;
  fixture_id?: number | null;
  comment?: string | null;
  minute?: number | null;
  extra_minute?: number | null;
  is_goal?: boolean | null;
  is_important?: boolean | null;
  order?: number | null;

  // Relations
  fixture?: Fixture | null; // Use actual Fixture type
};

// --- Main Comment Schema ---
export const CommentSchema: z.ZodType<Comment> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    fixture_id: z.number().int().nullable().optional(),
    comment: z.string().nullable().optional(),
    minute: z.number().int().nullable().optional(),
    extra_minute: z.number().int().nullable().optional(),
    is_goal: z.boolean().nullable().optional(),
    is_important: z.boolean().nullable().optional(),
    order: z.number().int().nullable().optional(),

    // Relations
    fixture: z.lazy(() => FixtureSchema).nullable().optional(), // Use actual FixtureSchema
  })
);
