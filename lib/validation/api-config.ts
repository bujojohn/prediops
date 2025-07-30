import { z } from 'zod';

// Validation schemas for API configuration
export const apiConfigSchema = z.object({
  includes: z.array(z.string()).optional(),
  select: z.array(z.string()).optional(),
  filters: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

// Specific validation schemas for different endpoint types
export const predictionsConfigSchema = apiConfigSchema.extend({
  includes: z.array(z.enum(['fixture', 'type', 'participants', 'league', 'season'])).optional(),
  filters: z.object({
    predictionTypes: z.union([z.number(), z.array(z.number())]).optional(),
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const fixturesConfigSchema = apiConfigSchema.extend({
  includes: z.array(z.enum([
    'participants', 'scores', 'state', 'league', 'season', 
    'venue', 'referee', 'lineup', 'statistics'
  ])).optional(),
  filters: z.object({
    fixtureTypes: z.union([z.number(), z.array(z.number())]).optional(),
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
    teams: z.union([z.number(), z.array(z.number())]).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }).optional(),
});

export const teamsConfigSchema = apiConfigSchema.extend({
  includes: z.array(z.enum(['country', 'league', 'statistics', 'venue'])).optional(),
  filters: z.object({
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    countries: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const playersConfigSchema = apiConfigSchema.extend({
  includes: z.array(z.enum(['country', 'team', 'statistics', 'position'])).optional(),
  filters: z.object({
    teams: z.union([z.number(), z.array(z.number())]).optional(),
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    positions: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const standingsConfigSchema = apiConfigSchema.extend({
  includes: z.array(z.enum(['league', 'season', 'team'])).optional(),
  filters: z.object({
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

// Validation functions
export const validateApiConfig = (config: unknown) => {
  return apiConfigSchema.parse(config);
};

export const validatePredictionsConfig = (config: unknown) => {
  return predictionsConfigSchema.parse(config);
};

export const validateFixturesConfig = (config: unknown) => {
  return fixturesConfigSchema.parse(config);
};

export const validateTeamsConfig = (config: unknown) => {
  return teamsConfigSchema.parse(config);
};

export const validatePlayersConfig = (config: unknown) => {
  return playersConfigSchema.parse(config);
};

export const validateStandingsConfig = (config: unknown) => {
  return standingsConfigSchema.parse(config);
};

// Type exports
export type ApiConfig = z.infer<typeof apiConfigSchema>;
export type PredictionsConfig = z.infer<typeof predictionsConfigSchema>;
export type FixturesConfig = z.infer<typeof fixturesConfigSchema>;
export type TeamsConfig = z.infer<typeof teamsConfigSchema>;
export type PlayersConfig = z.infer<typeof playersConfigSchema>;
export type StandingsConfig = z.infer<typeof standingsConfigSchema>; 