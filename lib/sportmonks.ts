import axios from 'axios';
import { validateApiConfig } from '@/lib/validation/api-config';

const api = axios.create({
  baseURL: process.env.SPORTMONKS_BASE_URL || 'https://api.sportmonks.com/v3/football',
  headers: {
    Authorization: process.env.SPORTMONKS_API_TOKEN,
    Accept: 'application/json',
  },
});

// Types for API configuration
export interface ApiConfig {
  includes?: string[];
  select?: string[];
  filters?: Record<string, string | number>;
}

// Helper function to build query parameters
function buildQueryParams(config?: ApiConfig): string {
  // Validate configuration if provided
  if (config) {
    try {
      validateApiConfig(config);
    } catch (error) {
      console.error('Invalid API configuration:', error);
      throw new Error(`Invalid API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  const params = new URLSearchParams();
  
  if (config?.includes && config.includes.length > 0) {
    params.append('include', config.includes.join(';'));
  }
  
  if (config?.select && config.select.length > 0) {
    params.append('select', config.select.join(';'));
  }
  
  if (config?.filters) {
    Object.entries(config.filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, value.toString());
    });
  }
  
  return params.toString();
}

export const sportmonks = {
  // Get predictions with configurable options
  async getPredictions(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['fixture', 'type'],
      filters: { predictionTypes: 237 }
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/predictions/probabilities${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get value bets with configurable options
  async getValueBets(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['fixture:name']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/predictions/value-bets${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get live fixtures with configurable options
  async getLiveFixtures(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['participants:name', 'scores', 'state']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/livescores/inplay${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get latest live scores with configurable options
  async getLatestLiveScores(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['participants:name', 'scores', 'state']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/livescores/latest${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get predictions for specific fixture with configurable options
  async getFixturePredictions(fixtureId: string, config?: ApiConfig) {
    const queryParams = buildQueryParams(config);
    const url = `/predictions/probabilities/fixtures/${fixtureId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get upcoming fixtures with configurable options
  async getUpcomingFixtures(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['participants', 'scores', 'state'],
      filters: { fixtureTypes: 1 }
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/fixtures${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get league standings with configurable options
  async getLeagueStandings(seasonId: string, config?: ApiConfig) {
    const queryParams = buildQueryParams(config);
    const url = `/standings/seasons/${seasonId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get team statistics with configurable options
  async getTeamStatistics(teamId: string, config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['statistics']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/teams/${teamId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific fixture with configurable options
  async getFixture(fixtureId: string, config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['participants', 'scores', 'state', 'league', 'season']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/fixtures/${fixtureId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get seasons with configurable options
  async getSeasons(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['league', 'country']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/seasons${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get leagues with configurable options
  async getLeagues(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/leagues${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get teams with configurable options
  async getTeams(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country', 'league']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/teams${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific team with configurable options
  async getTeam(teamId: string, config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country', 'league', 'statistics']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/teams/${teamId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get players with configurable options
  async getPlayers(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country', 'team']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/players${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific player with configurable options
  async getPlayer(playerId: string, config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country', 'team', 'statistics']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/players/${playerId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get countries with configurable options
  async getCountries(config?: ApiConfig) {
    const queryParams = buildQueryParams(config);
    const url = `/countries${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get venues with configurable options
  async getVenues(config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country', 'city']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/venues${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific venue with configurable options
  async getVenue(venueId: string, config?: ApiConfig) {
    const defaultConfig: ApiConfig = {
      includes: ['country', 'city']
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/venues/${venueId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },
}; 