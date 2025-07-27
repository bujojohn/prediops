import { z } from "zod";
import { type Type, TypeSchema } from "./type.schema"; // Import actual Type schema and type

// --- Forward declare the FixtureMetadata Type ---
export type FixtureMetadata = {
  id?: number | null;
  metadatable_id?: number | null;
  metadatable_type?: string | null;
  type_id?: number | null;
  value_type?: string | null;
  values?: any | null; // Kept as any due to variable structure, as noted in original comments

  // Relations
  type?: Type | null; // Use actual Type
};

// --- Main Metadata Schema (aliased to FixtureMetadataSchema below) ---
export const MetadataSchema: z.ZodType<FixtureMetadata> = z.lazy(() =>
  z.object({
    id: z.number().int().nullable().optional(),
    metadatable_id: z.number().int().nullable().optional(),
    metadatable_type: z.string().nullable().optional(),
    type_id: z.number().int().nullable().optional(),
    value_type: z.string().nullable().optional(),
    values: z.any().nullable().optional(), // Kept as z.any() for flexibility

    // Relations
    type: z.lazy(() => TypeSchema).nullable().optional(), // Use actual TypeSchema
  })
);

export const FixtureMetadataSchema = MetadataSchema;
