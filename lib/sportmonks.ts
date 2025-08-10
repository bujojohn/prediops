import axios from "axios";
import { validateApiConfig } from "@/lib/validation/api-config";

const api = axios.create({
  baseURL: process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3/football",
  headers: {
    Authorization: (process.env.SPORTMONKS_API_TOKEN || "").trim(),
  },
  // Ensure Sportmonks query syntax remains readable: keep ; , : unencoded in values
  paramsSerializer: {

  },
});

// Types for API configuration
export interface ApiConfig {
  include?: string; // e.g. 'participants;scores;state;predictions;league;venue'
  select?: string;  // e.g. 'name,starting_at,has_odds'
  filters?: string; // e.g. 'todayDate;leagues:1,2'
  order?: 'asc' | 'desc';
  sortBy?: 'starting_at' | 'name';
  page?: number;
  per_page?: number;
  populate?: boolean; // when true we send _filters=populate_
}

// Minimal adapter: pass config as-is, only map populate -> _filters and support legacy arrays
function makeParams(config?: ApiConfig): Record<string, string | number | boolean> {
  if (!config) return {};
  try {
    validateApiConfig(config as unknown as Record<string, unknown>);
  } catch (error) {
    console.error('Invalid API configuration:', error);
  }
  const { populate, ...rest } = config;
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      params[key] = value;
    }
  }
  if (populate) params._filters = 'populate_';
  return params;
}

export const sportmonks = {
  // Get predictions with configurable options
  async getPredictions(config?: ApiConfig) {
    const url = `/predictions/probabilities`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get value bets with configurable options
  async getValueBets(config?: ApiConfig) {
    const url = `/predictions/value-bets`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get live fixtures with configurable options
  async getLiveFixtures(config?: ApiConfig) {
    const url = `/livescores/inplay`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get latest live scores with configurable options
  async getLatestLiveScores(config?: ApiConfig) {
    const url = "/livescores/latest";
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get predictions for specific fixture with configurable options
  async getFixturePredictions(fixtureId: string, config?: ApiConfig) {
    const url = `/predictions/probabilities/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get upcoming fixtures with configurable options
  async getUpcomingFixtures(config?: ApiConfig) {
    const url = `/fixtures`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get league standings with configurable options
  async getLeagueStandings(seasonId: string, config?: ApiConfig) {
    const url = `/standings/seasons/${seasonId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get team statistics with configurable options
  async getTeamStatistics(teamId: string, config?: ApiConfig) {
    const url = `/teams/${teamId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific fixture with configurable options
  async getFixture(fixtureId: string, config?: ApiConfig) {
    const url = `/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get seasons with configurable options
  async getSeasons(config?: ApiConfig) {
    const url = `/seasons`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get leagues with configurable options
  async getLeagues(config?: ApiConfig) {
    const url = `/leagues`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get teams with configurable options
  async getTeams(config?: ApiConfig) {
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

  // Get players with configurable options
  async getPlayers(config?: ApiConfig) {
    const url = `/players`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific player with configurable options
  async getPlayer(playerId: string, config?: ApiConfig) {
    const url = `/players/${playerId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get countries with configurable options
  async getCountries(config?: ApiConfig) {
    const url = `/countries`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific country with configurable options
  async getCountry(countryId: string, config?: ApiConfig) {
    const url = `/countries/${countryId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get countries by search with configurable options
  async getCountriesBySearch(searchQuery: string, config?: ApiConfig) {
    const url = `/countries/search/${encodeURIComponent(searchQuery)}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get continents with configurable options
  async getContinents(config?: ApiConfig) {
    const url = `/continents`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific continent with configurable options
  async getContinent(continentId: string, config?: ApiConfig) {
    const url = `/continents/${continentId}`;
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

  // Get general standings with configurable options
  async getStandings(config?: ApiConfig) {
    const url = `/standings`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get league standings by league ID with configurable options
  async getLeagueStandingsByLeague(leagueId: string, config?: ApiConfig) {
    const url = `/standings/leagues/${leagueId}`;
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

  // Get odds with configurable options
  async getOdds(config?: ApiConfig) {
    const url = `/odds`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get fixture odds with configurable options
  async getFixtureOdds(fixtureId: string, config?: ApiConfig) {
    const url = `/odds/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get referees with configurable options
  async getReferees(config?: ApiConfig) {
    const url = `/referees`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific referee with configurable options
  async getReferee(refereeId: string, config?: ApiConfig) {
    const url = `/referees/${refereeId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get coaches with configurable options
  async getCoaches(config?: ApiConfig) {
    const url = `/coaches`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get specific coach with configurable options
  async getCoach(coachId: string, config?: ApiConfig) {
    const url = `/coaches/${coachId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get lineups with configurable options
  async getLineups(config?: ApiConfig) {
    const url = `/lineups`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },

  // Get fixture lineups with configurable options
  async getFixtureLineups(fixtureId: string, config?: ApiConfig) {
    const url = `/lineups/fixtures/${fixtureId}`;
    const response = await api.get(url, { params: makeParams(config) });
    return response.data;
  },
};
