import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SPORTMONKS_BASE_URL || 'https://api.sportmonks.com/v3/football',
  headers: {
    Authorization: `${process.env.SPORTMONKS_API_TOKEN}`,
    Accept: 'application/json',
  },
});

export const sportmonks = {
  // Test your active predictions access
  async getPredictions() {
    const response = await api.get('/predictions/probabilities?include=fixture;type&filters=predictionTypes:237');
    return response.data;
  },

  // Get value bets (active in your plan)
  async getValueBets() {
    const response = await api.get('/predictions/value-bets?include=fixture:name');
    return response.data;
  },

  // Get live fixtures
  async getLiveFixtures() {
    const response = await api.get('/livescores/inplay?include=participants:name;scores;state');
    return response.data;
  },

  // Get predictions for specific fixture
  async getFixturePredictions(fixtureId: string) {
    const response = await api.get(`/predictions/probabilities/fixtures/${fixtureId}`);
    return response.data;
  },

  // Get upcoming fixtures
  async getUpcomingFixtures() {
    const response = await api.get('/fixtures?filters=fixtureTypes:1');
    return response.data;
  },

  // Get league standings
  async getLeagueStandings(seasonId: string) {
    const response = await api.get(`/standings/seasons/${seasonId}`);
    return response.data;
  },

  // Get team statistics
  async getTeamStatistics(teamId: string) {
    const response = await api.get(`/teams/${teamId}?include=statistics`);
    return response.data;
  },
}; 