import { z } from "zod";

// Zod schema for Sport, based on typical SportMonks structure
export const SportSchema = z.lazy(() => // Wrapped with z.lazy() for consistency, though likely not in a cycle itself
  z.object({
    id: z.number().describe("The ID of the sport."),
    name: z.string().nullable().optional().describe("The common name of the sport (e.g., Soccer)."),
    code: z.string().nullable().optional().describe("A code for the sport (e.g., soccer)."),
    developer_name: z.string().nullable().optional().describe("The developer-friendly name for the sport."),
  })
);

// TypeScript type for Sport inferred from the Zod schema
export type Sport = z.infer<typeof SportSchema>;
