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
  select?: string[];  // Select specific fields on the base entity
  filters?: Record<string, string | number> | string | (Record<string, string | number> | string)[];
  order?: 'asc' | 'desc';  // Basic ordering (ascending or descending)
  sortBy?: string;  // Custom sorting field (e.g., 'starting_at', 'name')
  page?: number;  // Page number for pagination (default: 1)
  per_page?: number;  // Results per page (range 1-50, default: 25)
  populate?: boolean;  // Use _filters=populate_ for higher pagination limit (max 1000)
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
    params.append('select', config.select.join(','));
  }
  
  if (config?.filters) {
    if (typeof config.filters === 'string') {
      // Handle simple string filters like 'todayDate'
      params.append('filters', config.filters);
    } else if (Array.isArray(config.filters)) {
      // Handle combined filters (string and record) - join with semicolons
      const filterStrings: string[] = [];
      
      config.filters.forEach(filter => {
        if (typeof filter === 'string') {
          filterStrings.push(filter);
        } else if (typeof filter === 'object' && filter !== null) {
          // Convert record filters to string format (e.g., {eventTypes: [23,34]} -> "eventTypes:23,34")
          Object.entries(filter).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              filterStrings.push(`${key}:${value.join(',')}`);
            } else {
              filterStrings.push(`${key}:${value}`);
            }
          });
        }
      });
      
      if (filterStrings.length > 0) {
        params.append('filters', filterStrings.join(';'));
      }
    } else {
      // Handle key-value filters - combine into single filters parameter
      const filterStrings: string[] = [];
      Object.entries(config.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          filterStrings.push(`${key}:${value.join(',')}`);
        } else {
          filterStrings.push(`${key}:${value}`);
        }
      });
      
      if (filterStrings.length > 0) {
        params.append('filters', filterStrings.join(';'));
      }
    }
  }
  
  // Handle ordering and sorting parameters
  if (config?.order) {
    params.append('order', config.order);
  }
  
  if (config?.sortBy) {
    params.append('sortBy', config.sortBy);
  }
  
  // Handle pagination parameters
  if (config?.page && config.page > 1) {
    params.append('page', config.page.toString());
  }
  
  if (config?.per_page && config.per_page !== 25) {
    params.append('per_page', config.per_page.toString());
  }
  
  // Handle populate filter for higher pagination limit
  if (config?.populate) {
    params.append('_filters', 'populate_');
  }
  
  return params.toString();
}

export const sportmonks = {
  // Get predictions with configurable options
  async getPredictions(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/predictions/probabilities${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get value bets with configurable options
  async getValueBets(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/predictions/value-bets${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get live fixtures with configurable options
  async getLiveFixtures(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/livescores/inplay${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get latest live scores with configurable options
  async getLatestLiveScores(config?: ApiConfig) {
    const finalConfig = { ...config };
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
    const finalConfig = { ...config };
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
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/teams/${teamId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific fixture with configurable options
  async getFixture(fixtureId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/fixtures/${fixtureId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get seasons with configurable options
  async getSeasons(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/seasons${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get leagues with configurable options
  async getLeagues(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/leagues${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get teams with configurable options
  async getTeams(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/teams${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific team with configurable options
  async getTeam(teamId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/teams/${teamId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get players with configurable options
  async getPlayers(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/players${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific player with configurable options
  async getPlayer(playerId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
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

  // Get specific country with configurable options
  async getCountry(countryId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/countries/${countryId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get countries by search with configurable options
  async getCountriesBySearch(searchQuery: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/countries/search/${encodeURIComponent(searchQuery)}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get continents with configurable options
  async getContinents(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/continents${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific continent with configurable options
  async getContinent(continentId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/continents/${continentId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get venues with configurable options
  async getVenues(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/venues${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific venue with configurable options
  async getVenue(venueId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/venues/${venueId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get general standings with configurable options
  async getStandings(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/standings${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get league standings by league ID with configurable options
  async getLeagueStandingsByLeague(leagueId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/standings/leagues/${leagueId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get matches with configurable options
  async getMatches(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/matches${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific match with configurable options
  async getMatch(matchId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/matches/${matchId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get general statistics with configurable options
  async getStatistics(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/statistics${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get fixture statistics with configurable options
  async getFixtureStatistics(fixtureId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/statistics/fixtures/${fixtureId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get odds with configurable options
  async getOdds(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/odds${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get fixture odds with configurable options
  async getFixtureOdds(fixtureId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/odds/fixtures/${fixtureId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get referees with configurable options
  async getReferees(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/referees${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific referee with configurable options
  async getReferee(refereeId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/referees/${refereeId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get coaches with configurable options
  async getCoaches(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/coaches${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get specific coach with configurable options
  async getCoach(coachId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/coaches/${coachId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get lineups with configurable options
  async getLineups(config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/lineups${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get fixture lineups with configurable options
  async getFixtureLineups(fixtureId: string, config?: ApiConfig) {
    const finalConfig = { ...config };
    const queryParams = buildQueryParams(finalConfig);
    const url = `/lineups/fixtures/${fixtureId}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },
}; 