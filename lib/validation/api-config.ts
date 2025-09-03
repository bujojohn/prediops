import { z } from 'zod';

// Validation schemas for API configuration
export const apiConfigSchema = z.object({
  include: z.string().optional(), // e.g. 'participants;scores;state;predictions;league;venue'
  select: z.string().optional(), // e.g. 'name,starting_at,has_odds'
  filters: z.union([
    z.string(), // For simple filters like 'todayDate'
    z.record(z.string(), z.union([z.string(), z.number()])), // For key-value filters
    z.array(z.union([z.string(), z.record(z.string(), z.union([z.string(), z.number()]))])) // For combined filters
  ]).optional(),
  order: z.enum(['asc', 'desc']).optional(), // Basic ordering
  sortBy: z.string().optional(), // Custom sorting field
  page: z.number().min(1).optional(), // Page number for pagination
  per_page: z.number().min(1).max(50).optional(), // Results per page (range 1-50)
  populate: z.boolean().optional(), // Use _filters=populate_ for higher pagination limit
});

// League-specific validation schemas
export const leaguesConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages;seasons;currentseason'
  filters: z.object({
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    types: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
    sport: z.number().optional(),
  }).optional(),
});

export const leaguesByDateConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages'
  filters: z.object({
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    types: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
  }).optional(),
});

export const leaguesByCountryConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages;seasons'
  filters: z.object({
    types: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
    sport: z.number().optional(),
  }).optional(),
});

export const leaguesBySearchConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport'
  filters: z.object({
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    types: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
  }).optional(),
});

export const leaguesByIdConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages;seasons;currentseason'
});

export const leaguesByLiveConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages'
  filters: z.object({
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    types: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const leaguesByTeamConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages;seasons'
  filters: z.object({
    types: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
  }).optional(),
});

export const leaguesByFixtureDateConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;sport;stages'
  filters: z.object({
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    types: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
  }).optional(),
});

// Specific validation schemas for different endpoint types
export const predictionsConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'fixture;type;participants;league;season'
  filters: z.object({
    predictionTypes: z.union([z.number(), z.array(z.number())]).optional(),
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const fixturesConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'participants;scores;state;league;season;venue;referee;lineup;statistics'
  filters: z.object({
    fixtureTypes: z.union([z.number(), z.array(z.number())]).optional(),
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
    teams: z.union([z.number(), z.array(z.number())]).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }).optional(),
});

// Fixtures by date range allow larger pagination windows at Sportmonks
export const fixturesByDateRangeConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'participants;scores;state;predictions;league.country;venue;stage;round'
  // Allow higher page size for range endpoints
  per_page: z.number().min(1).max(100).optional(),
  filters: z.object({
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
    teams: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

// Team-specific fixtures by date range share the same pagination allowance
export const fixturesByDateRangeForTeamConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const teamsConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;league;statistics;venue'
  filters: z.object({
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    countries: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const playersConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'country;team;statistics;position'
  filters: z.object({
    teams: z.union([z.number(), z.array(z.number())]).optional(),
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    positions: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const standingsConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'league;season;team'
  filters: z.object({
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    seasons: z.union([z.number(), z.array(z.number())]).optional(),
  }).optional(),
});

export const countriesConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'continent;leagues'
  filters: z.object({
    continents: z.union([z.number(), z.array(z.number())]).optional(),
    hasLeagues: z.boolean().optional(),
  }).optional(),
});

export const seasonsConfigSchema = apiConfigSchema.extend({
  include: z.string().optional(), // e.g. 'league;country;stages'
  filters: z.object({
    leagues: z.union([z.number(), z.array(z.number())]).optional(),
    countries: z.union([z.number(), z.array(z.number())]).optional(),
    active: z.boolean().optional(),
  }).optional(),
});

// Validation functions
export const validateApiConfig = (config: unknown) => {
  return apiConfigSchema.parse(config);
};

export const validateLeaguesConfig = (config: unknown) => {
  return leaguesConfigSchema.parse(config);
};

export const validateLeaguesByDateConfig = (config: unknown) => {
  return leaguesByDateConfigSchema.parse(config);
};

export const validateLeaguesByCountryConfig = (config: unknown) => {
  return leaguesByCountryConfigSchema.parse(config);
};

export const validateLeaguesBySearchConfig = (config: unknown) => {
  return leaguesBySearchConfigSchema.parse(config);
};

export const validateLeaguesByIdConfig = (config: unknown) => {
  return leaguesByIdConfigSchema.parse(config);
};

export const validateLeaguesByLiveConfig = (config: unknown) => {
  return leaguesByLiveConfigSchema.parse(config);
};

export const validateLeaguesByTeamConfig = (config: unknown) => {
  return leaguesByTeamConfigSchema.parse(config);
};

export const validateLeaguesByFixtureDateConfig = (config: unknown) => {
  return leaguesByFixtureDateConfigSchema.parse(config);
};

export const validatePredictionsConfig = (config: unknown) => {
  return predictionsConfigSchema.parse(config);
};

export const validateFixturesConfig = (config: unknown) => {
  return fixturesConfigSchema.parse(config);
};

export const validateFixturesByDateRangeConfig = (config: unknown) => {
  return fixturesByDateRangeConfigSchema.parse(config);
};

export const validateFixturesByDateRangeForTeamConfig = (config: unknown) => {
  return fixturesByDateRangeForTeamConfigSchema.parse(config);
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

export const validateCountriesConfig = (config: unknown) => {
  return countriesConfigSchema.parse(config);
};

export const validateSeasonsConfig = (config: unknown) => {
  return seasonsConfigSchema.parse(config);
};

// Type exports
export type ApiConfig = z.infer<typeof apiConfigSchema>;
export type LeaguesConfig = z.infer<typeof leaguesConfigSchema>;
export type LeaguesByDateConfig = z.infer<typeof leaguesByDateConfigSchema>;
export type LeaguesByCountryConfig = z.infer<typeof leaguesByCountryConfigSchema>;
export type LeaguesBySearchConfig = z.infer<typeof leaguesBySearchConfigSchema>;
export type LeaguesByIdConfig = z.infer<typeof leaguesByIdConfigSchema>;
export type LeaguesByLiveConfig = z.infer<typeof leaguesByLiveConfigSchema>;
export type LeaguesByTeamConfig = z.infer<typeof leaguesByTeamConfigSchema>;
export type LeaguesByFixtureDateConfig = z.infer<typeof leaguesByFixtureDateConfigSchema>;
export type PredictionsConfig = z.infer<typeof predictionsConfigSchema>;
export type FixturesConfig = z.infer<typeof fixturesConfigSchema>;
export type FixturesByDateRangeConfig = z.infer<typeof fixturesByDateRangeConfigSchema>;
export type FixturesByDateRangeForTeamConfig = z.infer<typeof fixturesByDateRangeForTeamConfigSchema>;
export type TeamsConfig = z.infer<typeof teamsConfigSchema>;
export type PlayersConfig = z.infer<typeof playersConfigSchema>;
export type StandingsConfig = z.infer<typeof standingsConfigSchema>;
export type CountriesConfig = z.infer<typeof countriesConfigSchema>;
export type SeasonsConfig = z.infer<typeof seasonsConfigSchema>; 