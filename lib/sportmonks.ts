import axios from "axios";
import { validateApiConfig } from "@/lib/validation/api-config";
import type { Fixture } from "@/schemas/fixture.schema";
import type { Prediction } from "@/schemas/predictions.schema";
import type { ValueBet } from "@/schemas/valuebet.schema";
import type { Country } from "@/schemas/country.schema";
import type { League } from "@/schemas/league.schema";
import type { Team } from "@/schemas/team.schema";

const api = axios.create({
  baseURL:
    process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3/football",
  headers: {
    Authorization: (process.env.SPORTMONKS_API_TOKEN || "").trim(),
  },
  // Ensure Sportmonks query syntax remains readable: keep ; , : unencoded in values
  paramsSerializer: {
    serialize: (queryParameters: Record<string, unknown>) => {
      const serializedParts: string[] = [];
      for (const [parameterName, parameterValue] of Object.entries(
        queryParameters || {}
      )) {
        if (
          parameterValue === undefined ||
          parameterValue === null ||
          parameterValue === ""
        )
          continue;

        const encodedParameterName = encodeURIComponent(parameterName);
        const rawValueString = String(parameterValue);
        
        // Handle different parameter types with appropriate encoding
        let encodedButSafeValue: string;
        if (parameterName === 'select' || parameterName === 'include') {
          // For select and include parameters, preserve commas and field names as-is
          // Only encode spaces and other special characters, but keep commas unencoded
          encodedButSafeValue = rawValueString
            .replace(/\s+/g, '%20') // Encode spaces
            .replace(/,/g, ',') // Keep commas as-is
            .replace(/;/g, ';') // Keep semicolons as-is
            .replace(/:/g, ':'); // Keep colons as-is
        } else {
          // For other parameters, use the existing logic
          encodedButSafeValue = encodeURIComponent(rawValueString)
            .replace(/%3B/g, ";")
            .replace(/%2C/g, ",")
            .replace(/%3A/g, ":");
        }

        serializedParts.push(`${encodedParameterName}=${encodedButSafeValue}`);
      }
      return serializedParts.join("&");
    },
  },
});

// Add response interceptor to log detailed SportMonks API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Build the complete URL that was sent to SportMonks
      const baseURL = error.config?.baseURL || api.defaults.baseURL;
      const url = error.config?.url;
      const params = error.config?.params;
      
      // Use our custom serializer to show the actual URL that was sent
      let completeURL = `${baseURL}${url}`;
      if (params) {
        const serializer = api.defaults.paramsSerializer;
        let serializedParams: string | undefined;
        
        if (serializer && typeof serializer === 'object' && 'serialize' in serializer && serializer.serialize) {
          serializedParams = serializer.serialize(params);
        } else if (typeof serializer === 'function') {
          serializedParams = serializer(params);
        }
        
        if (serializedParams) {
          completeURL += `?${serializedParams}`;
        }
      }
      
      console.error('SportMonks API Error:', {
        message: errorData.message,
        code: errorData.code,
        link: errorData.link,
        status: error.response.status,
        method: error.config?.method,
        endpoint: error.config?.url,
        completeURL: completeURL,
        params: params,
      });
    } else {
      console.error('Network/Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types for API configuration
export interface ApiConfig {
  include?: string; // e.g. 'participants;scores;state;predictions;league'
  select?: string; // e.g. 'name,starting_at,has_odds'
  filters?: string | Record<string, unknown>; // e.g. 'todayDate;leagues:1,2' or { leagues: 8 }
  order?: "asc" | "desc";
  sortBy?: "starting_at" | "name";
  page?: number;
  per_page?: number;
  populate?: boolean; // when true we send _filters=populate_
}

// Generic list response shape used by SportMonks v3 APIs
export type ApiListResponse<T> = {
  data: T[];
  pagination?: {
    count?: number;
    per_page?: number | string;
    current_page?: number | string;
    next_page?: string | null;
    has_more?: boolean;
  };
  subscription?: unknown;
  rate_limit?: unknown;
  timezone?: string;
  [key: string]: unknown;
};

// Minimal adapter: pass config as-is, only map populate -> _filters and support legacy arrays
function makeParams(
  config?: ApiConfig
): Record<string, string | number | boolean> {
  if (!config) return {};
  try {
    validateApiConfig(config as unknown as Record<string, unknown>);
  } catch (error) {
    console.error("Invalid API configuration:", error);
  }
  const { populate, filters, ...rest } = config;
  const params: Record<string, string | number | boolean> = {};
  
  // Handle filters specially - convert object to Sportmonks format
  if (filters) {
    if (typeof filters === 'string') {
      params.filters = filters;
    } else if (typeof filters === 'object') {
      // Convert object filters to Sportmonks format
      const filterParts: string[] = [];
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          filterParts.push(`${key}:${value.join(',')}`);
        } else if (value !== undefined && value !== null) {
          filterParts.push(`${key}:${value}`);
        }
      }
      if (filterParts.length > 0) {
        params.filters = filterParts.join(';');
      }
    }
  }
  
  // Handle other primitive parameters
  for (const [key, value] of Object.entries(rest)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params[key] = value;
    }
  }
  
  if (populate) params._filters = "populate_";
  return params;
}

export const sportmonks = {

  
  /**
   * Returns all the countries available within Prediops' subscription. with configurable options
   * Doc: https://docs.sportmonks.com/football/core-api/entities/core#country
   * @param config - ApiConfig
   * @returns ApiListResponse<Country>
   */
  async getCountries(config?: ApiConfig): Promise<ApiListResponse<Country>> {
    const url = `/countries`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /*
  Returns the country you've requested by CountryId with configurable options
  Doc: https://docs.sportmonks.com/football/core-api/endpoints/countries/get-country-by-id
  */
  async getCountry(countryId: string, config?: ApiConfig) {
    const url = `/countries/${countryId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns all the countries that match your search query with configurable options
   * Doc: https://docs.sportmonks.com/football/core-api/endpoints/countries/get-countries-by-search
   * @param searchQuery 
   * @param config 
   * @returns ApiListResponse<Country>
   */
  async getCountriesBySearch(searchQuery: string, config?: ApiConfig) {
    const url = `/countries/search/${encodeURIComponent(searchQuery)}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   *Returns all the continents available within your subscription. with configurable options
   *Doc: https://docs.sportmonks.com/football/core-api/endpoints/continents/get-all-continents
   * @param config 
   * @returns ApiListResponse<Continent>
   */
  async getContinents(config?: ApiConfig) {
    const url = `/continents`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns information from your requested continent ID.
   * Doc: https://docs.sportmonks.com/football/core-api/endpoints/continents/get-continent-by-id
   * @param continentId 
   * @param config 
   * @returns ApiListResponse<Continent>
   */
  async getContinent(continentId: string, config?: ApiConfig) {
    const url = `/continents/${continentId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

    // Deprecated: Use getFixturesById instead.
    async getFixture(fixtureId: string, config?: ApiConfig) {
      return this.getFixturesById(fixtureId, config);
    },
  /**
  Returns the fixture you've requested by FixtureId with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixture-by-id
  */
  async getFixturesById(fixtureId: string, config?: ApiConfig): Promise<ApiListResponse<Fixture>> {
    const url = `/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /*
  Returns the fixtures you've requested by FixtureIds(eg fixtureIds='1,2,3') with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixtures-by-multiple-ids
  */
  async getFixturesByMulipleIds(fixtureIds: string, config?: ApiConfig): Promise<ApiListResponse<Fixture>> {
    const url = `/fixtures/multiple`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns all fixtures for a specific date.
   * For country-specific fixtures, consider using getLeaguesByFixtureDate() which is more efficient.
   * 
   * @param fixturesDate - Date in YYYY-MM-DD format (e.g., '2024-01-01')
   * @param config - ApiConfig with include options like 'participants;scores;state;predictions.type;league.country'
   * @returns ApiListResponse<Fixture> for the specified date
   * 
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixtures-by-date
   */
    async getFixturesByDate(fixturesDate: string, config?: ApiConfig) {
      const url = `/fixtures/date/${fixturesDate}`;
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },
  /*
  Deprecated v2.3: Use getAllFixtures instead.
  */
  async getUpcomingFixtures(
    config?: ApiConfig
  ): Promise<ApiListResponse<Fixture>> {
    return this.getAllFixtures(config);
  },
  /**
   * Returns all the fixtures accessible within Prediops' subscription. with configurable options
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-all-fixtures
   * @param config - ApiConfig
   * @returns ApiListResponse<Fixture>
   */
  async getAllFixtures(
    config?: ApiConfig
  ): Promise<ApiListResponse<Fixture>> {
    const url = `/fixtures`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns fixtures from a date range (maximum 100 days).
   * This is more efficient than multiple getFixturesByDate() calls.
   * 
   * @param startDate - Start date in 'YYYY-MM-DD' format (e.g., '2024-01-01')
   * @param endDate - End date in 'YYYY-MM-DD' format (e.g., '2024-01-10')
   * @param config - ApiConfig with include options like 'participants;scores;state;predictions.type;league.country'
   * @returns ApiListResponse<Fixture> for the date range
   * 
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixtures-by-date-range
   */
  async getFixturesByDateRange(startDate: string, endDate: string, config?: ApiConfig) {
    const url = `/fixtures/between/${startDate}/${endDate}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /*
  Returns the fixtures from your requested date range for your team. 
  All you have to do is parse the date in YYYY-MM-DD format(eg startDate='2024-01-01', endDate='2024-01-10') 
  and add the team ID(eg teamId='1') with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixtures-by-date-range-for-team
  */
 async getFixuresByDateRangeForTeam(teamId: string, startDate: string, endDate: string, config?: ApiConfig) {
  const url = `/fixtures/between/${startDate}/${endDate}/${teamId}`;
  const response = await api.get(url, { params: makeParams(config) });
  return response.data;
 },
 /*
  Returns the fixtures between two teams.
  All you have to do is add the team IDs(eg team1Id='1', team2Id='2') with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixtures-by-head-to-head
  */
 async getFixturesByHeadToHead(team1Id: string, team2Id: string, config?: ApiConfig) {
  const url = `/fixtures/head-to-head/${team1Id}/${team2Id}`;
  const response = await api.get(url, { params: makeParams(config) });
  return response.data;
 },
 /*
  Returns the fixtures that match your search query.
  All you have to do is add the search query(eg searchQuery='Manchester United') with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-fixtures-by-search-by-name
  */
 async getFixturesBySearchName(searchQuery: string, config?: ApiConfig) {
  const url = `/fixtures/search/${searchQuery}`;
  const response = await api.get(url, { params: makeParams(config) });
  return response.data;
 },
 /*
  Returns you all livescores that have received updates within 10 seconds.
  All you have to do is add the configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-latest-updated-fixtures
  */
 async getLatestUpdatedFixtures(config?: ApiConfig) {
  const url = `/fixtures/latest-updated`;
  const response = await api.get(url, { params: makeParams(config) });
  return response.data;
 },
 /*
  GET All Inplay Livescores: returns all the inplay fixtures.
  All you have to do is add the configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-live-fixtures
  */
  async getLiveFixtures(config?: ApiConfig): Promise<ApiListResponse<Fixture>> {
      const url = "/livescores/inplay";
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },
 /*
  Returns you all livescores that have received updates within 10 seconds.
  All you have to do is add the configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/livescores/get-latest-updated-livescores
  */
    async getLatestLiveScores(
      config?: ApiConfig
    ): Promise<ApiListResponse<Fixture>> {
      const url = "/livescores/latest";
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },
 /*
  Returns the fixtures 15 minutes before the game starts. It will also disappear 15 minutes after the game is finished.
  All you have to do is add the configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/livescores/get-all-livescores
  */
    async getLiveScores(config?: ApiConfig): Promise<ApiListResponse<Fixture>> {
      const url = "/livescores";
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },

  /**
   * Returns all the leagues available within your subscription.
   * Use getLeaguesByCountryId() for country-specific leagues as it's more efficient.
   * 
   * @param config - ApiConfig with include options like 'country;sport;currentseason'
   * @returns ApiListResponse<League>
   * 
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-leagues
   */
  async getLeagues(config?: ApiConfig): Promise<ApiListResponse<League>> {
    const url = `/leagues`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Returns all the leagues with fixtures from your requested fixture date with configurable options
  //Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-leagues-by-date
  async getLeaguesByDate(
    date: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/date/${date}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns all the leagues from your requested country ID.
   * This is more efficient than getLeagues() + filtering by country.
   * 
   * @param countryId - Country ID as string
   * @param config - ApiConfig with include options like 'sport;currentseason'
   * @returns ApiListResponse<League> for the specific country
   * 
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-leagues-by-country-id
   */
  async getLeaguesByCountryId(
    countryId: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/countries/${countryId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /* Returns all the leagues that match your search query with configurable options
    Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-leagues-search-by-name
   */
  async getLeaguesBySearch(
    searchQuery: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/search/${encodeURIComponent(searchQuery)}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /*
    Returns the league you've requested by LeagueId with configurable options
    Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-league-by-id
  */
  async getLeagueById(
    leagueId: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/${leagueId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /* Returns all the leagues that have fixtures that are currently being played with configurable options
    Doc: https://api.sportmonks.com/v3/football/leagues/live
  */
  async getLeaguesByLive(config?: ApiConfig): Promise<ApiListResponse<League>> {
    const url = `/leagues/live`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /* 
  Returns all the current and historical leagues from your requested teamId with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-leagues-by-team-id
  */
  async getLeaguesByTeamId(
    teamId: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/teams/${teamId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /* Returns all the current leagues of your requested teamId with configurable options
    Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-current-leagues-by-team-id
  */
  async getCurrentLeaguesByTeamId(
    teamId: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/teams/${teamId}/current`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns all the leagues with fixtures from your requested fixture date.
   * This endpoint is more efficient than getFixturesByDate + filtering as it returns
   * leagues grouped with their fixtures for a specific date.
   * 
   * @param date - Date in YYYY-MM-DD format (e.g., '2024-01-01')
   * @param config - ApiConfig with include options like 'country;fixtures'
   * @returns ApiListResponse<League> with nested fixtures data
   * 
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/leagues/get-leagues-by-fixture-date
   */
  async getLeaguesByFixtureDate(
    date: string,
    config?: ApiConfig
  ): Promise<ApiListResponse<League>> {
    const url = `/leagues/date/${date}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /*
  Returns the fixtures from your requested marketID.
  All you have to do is add the marketID(eg marketId='1') with configurable options
  Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/fixtures/get-upcoming-fixtures-by-market-id
  */
  async getUpcomingFixturesByMarketId(marketId: string, config?: ApiConfig) {
    const url = `/fixtures/upcoming/markets/${marketId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get league standings with configurable options
  async getLeagueStandings(seasonId: string, config?: ApiConfig) {
    const url = `/standings/seasons/${seasonId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get seasons with configurable options
  async getSeasons(config?: ApiConfig): Promise<ApiListResponse<unknown>> {
    const url = `/seasons`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get teams with configurable options
  async getTeams(config?: ApiConfig): Promise<ApiListResponse<Team>> {
    const url = `/teams`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific team with configurable options
  async getTeam(teamId: string, config?: ApiConfig) {
      const url = `/teams/${teamId}`;
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
  },

  // Get teams by country with configurable options
  async getTeamsByCountry(countryId: string, config?: ApiConfig): Promise<ApiListResponse<Team>> {
    const url = `/teams`;
    const filters = typeof config?.filters === 'object' && config.filters 
      ? { ...config.filters, countries: countryId }
      : { countries: countryId };
    const response = await api.get(url, { 
      params: makeParams({ ...config, filters }) 
    });
    return response.data;
  },

  // Get teams by league with configurable options
  async getTeamsByLeague(leagueId: string, config?: ApiConfig): Promise<ApiListResponse<Team>> {
    const url = `/teams`;
    const filters = typeof config?.filters === 'object' && config.filters 
      ? { ...config.filters, leagues: leagueId }
      : { leagues: leagueId };
    const response = await api.get(url, { 
      params: makeParams({ ...config, filters }) 
    });
    return response.data;
  },

  // Get team with detailed information (all includes)
  async getTeamWithDetails(teamId: string, config?: ApiConfig) {
    const defaultIncludes = "country;coaches;rivals;players;latest;upcoming;seasons;activeSeasons;sidelined;sidelinedHistory;trophies;socials";
    const includes = config?.include || defaultIncludes;
    const url = `/teams/${teamId}`;
    const response = await api.get(url, { 
      params: makeParams({ ...config, include: includes }) 
    });
    return response.data;
  },

  // Get players with configurable options
  async getPlayers(config?: ApiConfig): Promise<ApiListResponse<unknown>> {
    const url = `/players`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns player information from your requested player PlayerId with configurable options.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/players/get-player-by-id
   * @param playerId 
   * @param config 
   * @returns ApiListResponse<Player>
   */
  async getPlayerById(playerId: string, config?: ApiConfig) {
    const url = `/players/${playerId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  // Get venues with configurable options
  async getVenues(config?: ApiConfig) {
    const url = `/venues`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific venue with configurable options
  async getVenue(venueId: string, config?: ApiConfig) {
    const url = `/venues/${venueId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Keep track of the season performances of your favourite teams. 
   * The standings endpoint is used to retrieve full league standing tables. with configurable options.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standings/get-standings
   * @param config 
   * @returns ApiListResponse<Standing>
   */
  async getStandings(config?: ApiConfig) {
    const url = `/standings`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns the LIVE league standing table from your requested league ID with configurable options.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standings/get-live-standings-by-league-id
   * @param leagueId 
   * @param config 
   * @returns ApiListResponse<Standing>
   */
  async getLiveStandingsByLeagueId(leagueId: string, config?: ApiConfig) {
    const url = `/standings/live/leagues/${leagueId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Note: '/matches' endpoints are not part of Sportmonks football v3 public API and were removed.

  // Get general statistics with configurable options
  async getStatistics(config?: ApiConfig) {
    const url = `/statistics`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get fixture statistics with configurable options
  async getFixtureStatistics(fixtureId: string, config?: ApiConfig) {
    const url = `/statistics/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
/**
 * Returns all available Pre-match odds.
 * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standard-odds-feed/pre-match-odds/get-all-odds
 * @param config 
 * @returns ApiListResponse<ValueBet>
 */
  async getPreMatchOdds(config?: ApiConfig) {
    const url = `/odds/pre-match`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns all available Pre-match odds for a specific fixture.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standard-odds-feed/pre-match-odds/get-odds-by-fixture-id
   * @param fixtureId 
   * @param config 
   * @returns ApiListResponse<ValueBet>
   */
  async getOddsByFixtureId(fixtureId: string, config?: ApiConfig) {
    const url = `/odds/pre-match/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns the Pre-match odds by Fixture and Bookmaker ID with configurable options.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standard-odds-feed/pre-match-odds/get-odds-by-fixture-id-and-bookmaker-id
   * @param fixtureId 
   * @param bookmakerId 
   * @param config 
   * @returns ApiListResponse<ValueBet>
   */
  async getOddsByFixtureIdAndBookmakerId(fixtureId: string, bookmakerId: string, config?: ApiConfig) {
  const url = `/odds/fixtures/${fixtureId}/bookmakers/${bookmakerId}`;
  const response = await api.get(url, { params: makeParams(config) });
  return response.data;
},
/**
 * Returns the Pre-match odds by Fixture and Market ID with configurable options.
 * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standard-odds-feed/pre-match-odds/get-odds-by-fixture-id-and-market-id
 * @param fixtureId 
 * @param marketId 
 * @param config 
 * @returns ApiListResponse<ValueBet>
 */
  async getOddsByFixtureIdAndMarketId(fixtureId: string, marketId: string, config?: ApiConfig) {
    const url = `/odds/fixtures/${fixtureId}/markets/${marketId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  /**
   * Returns the pre-match odds updated in the last 10 seconds with configurable options.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standard-odds-feed/pre-match-odds/get-last-updated-odds
   * @param config 
   * @returns ApiListResponse<ValueBet>
   */
  async getLastUpdatedOdds(config?: ApiConfig) {
    const url = `/odds/latest-updated`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns all available Post-match odds.
   * Returns all available Post-match odds.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/standard-odds-feed/post-match-odds/get-all-odds
   * @param config 
   * @returns ApiListResponse<ValueBet>
   

  async getPostMatchOdds(config?: ApiConfig) {
    const url = `/odds/post-match`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  */

 /**
  * Returns all referees available within Prediops' subscription.
  * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/referees/get-all-referees
  * @param config 
  * @returns ApiListResponse<Referee>
  */
  async getReferees(config?: ApiConfig) {
    const url = `/referees`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

 /**
  * Returns referee information from your requested referee RefereeId with configurable options.
  * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/referees/get-referee-by-id
  * @param refereeId 
  * @param config 
  * @returns ApiListResponse<Referee>
  */
  async getRefereeById(refereeId: string, config?: ApiConfig) {
    const url = `/referees/${refereeId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

 /**
  * Returns all coaches available within Prediops' subscription.
  * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/coaches/get-all-coaches
  * @param config 
  * @returns ApiListResponse<Coach>
  */
  async getCoaches(config?: ApiConfig) {
    const url = `/coaches`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns coach information from your requested coach CoachId with configurable options.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/coaches/get-coach-by-id
   * @param coachId 
   * @param config 
   * @returns ApiListResponse<Coach>
   */
  async getCoach(coachId: string, config?: ApiConfig) {
    const url = `/coaches/${coachId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

 /**
  * Returns all lineups available within Prediops' subscription.
  * Doc: https://docs.sportmonks.com/football/tutorials-and-guides/tutorials/includes/lineups
  * @param config 
  * @returns ApiListResponse<Lineup>
  */
  async getLineups(config?: ApiConfig) {
    const url = `/lineups`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  /**
   * Returns the lineups for your requested fixture FixtureId with configurable options.
   * Doc: https://docs.sportmonks.com/football/tutorials-and-guides/tutorials/includes/lineups
   * @param fixtureId 
   * @param config 
   * @returns ApiListResponse<Lineup>
   */
  async getFixtureLineupsById(fixtureId: string, config?: ApiConfig) {
    const url = `/lineups/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
    /**
     * This endpoint returns all probabilities available within your subscription. 
     * Note: All probabilities are available 21 days before the match starts
     * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/predictions/get-probabilities
     * @param config 
     * @returns ApiListResponse<Prediction>
     */
    async getPredictions(
      config?: ApiConfig
    ): Promise<ApiListResponse<Prediction>> {
      const url = `/predictions/probabilities`;
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },
    /**
     * This endpoint returns the performances of our Predictions Model by requested league ID.
     * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/predictions/get-predictability-by-league-id
     * @param leagueId 
     * @param config 
     * @returns ApiListResponse<Prediction>
     */
    async getPredictabilityByLeagueId(leagueId: string, config?: ApiConfig) {
      const url = `/predictions/probabilities/leagues/${leagueId}`;
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },
    /**
     * This endpoint returns all the predictions available for your requested fixture ID.
     * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/predictions/get-probabilities-by-fixture-id
     * @param fixtureId 
     * @param config 
     * @returns ApiListResponse<Prediction>
     */
    async getProbabilitiesByFixtureId(fixtureId: string, config?: ApiConfig) {
      const url = `/predictions/probabilities/fixtures/${fixtureId}`;
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },

      // Get team statistics with configurable options
  async getTeamStatistics(teamId: string, config?: ApiConfig) {
    const url = `/teams/${teamId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  
  /**
   * This endpoint returns all value bets available within your subscription.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/predictions/get-value-bets
   * @param config 
   * @returns ApiListResponse<ValueBet>
   */
    async getValueBets(config?: ApiConfig): Promise<ApiListResponse<ValueBet>> {
      const url = `/predictions/value-bets`;
      const response = await api.get(url, { params: makeParams(config) });
      return response.data;
    },

  /**
   * Returns value bets for a specific fixture.
   * Doc: https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/predictions/get-value-bets-by-fixture-id
   * @param fixtureId - Fixture ID as string
   * @param config - ApiConfig with include options
   * @returns ApiListResponse<ValueBet>
   */
  async getValueBetsByFixtureId(fixtureId: string, config?: ApiConfig): Promise<ApiListResponse<ValueBet>> {
    const url = `/predictions/value-bets/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
  
};
