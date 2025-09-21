import { useQuery } from '@tanstack/react-query';
import { sportmonks, ApiConfig } from '@/lib/sportmonks';
// Removed unused imports

// Query keys for React Query
export const sportmonksKeys = {
  all: ['sportmonks'] as const,
  liveFixtures: () => [...sportmonksKeys.all, 'liveFixtures'] as const,
  latestLiveScores: () => [...sportmonksKeys.all, 'latestLiveScores'] as const,
  predictions: () => [...sportmonksKeys.all, 'predictions'] as const,
  valueBets: () => [...sportmonksKeys.all, 'valueBets'] as const,
  fixtures: () => [...sportmonksKeys.all, 'fixtures'] as const,
  standings: (seasonId: string) => [...sportmonksKeys.all, 'standings', seasonId] as const,
  teams: () => [...sportmonksKeys.all, 'teams'] as const,
  team: (teamId: string, include?: string) => include ? 
    [...sportmonksKeys.all, 'team', teamId, include] as const :
    [...sportmonksKeys.all, 'team', teamId] as const,
  teamsByCountry: (countryId: string) => [...sportmonksKeys.all, 'teams', 'country', countryId] as const,
  teamsByLeague: (leagueId: string) => [...sportmonksKeys.all, 'teams', 'league', leagueId] as const,
  seasons: () => [...sportmonksKeys.all, 'seasons'] as const,
  leagues: () => [...sportmonksKeys.all, 'leagues'] as const,
  players: () => [...sportmonksKeys.all, 'players'] as const,
  player: (playerId: string) => [...sportmonksKeys.all, 'player', playerId] as const,
  countries: () => [...sportmonksKeys.all, 'countries'] as const,
  venues: () => [...sportmonksKeys.all, 'venues'] as const,
  venue: (venueId: string) => [...sportmonksKeys.all, 'venue', venueId] as const,
};

// Client-side hooks for refreshing data (not initial fetching)
export const useRefreshLiveFixtures = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.liveFixtures(),
    queryFn: async () => {
      const data = await sportmonks.getLiveFixtures(config);
      return data;
    },
    enabled: false, // Don't run automatically
    staleTime: 60 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRefreshLatestLiveScores = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.latestLiveScores(),
    queryFn: async () => {
      const data = await sportmonks.getLatestLiveScores(config);
      return data;
    },
    enabled: false, // Don't run automatically
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRefreshPredictions = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.predictions(),
    queryFn: async () => {
      const data = await sportmonks.getPredictions(config);
      return data;
    },
    enabled: false, // Don't run automatically
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRefreshValueBets = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.valueBets(),
    queryFn: async () => {
      const data = await sportmonks.getValueBets(config);
      return data;
    },
    enabled: false, // Don't run automatically
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hooks for real-time updates (when needed)
export const useLiveFixturesRealtime = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.liveFixtures(),
    queryFn: async () => {
      const data = await sportmonks.getLiveFixtures(config);
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Other hooks for specific use cases (when client-side fetching is needed)
export const useFixturePredictions = (fixtureId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: [...sportmonksKeys.predictions(), fixtureId],
    queryFn: async () => {
      const data = await sportmonks.getPredictions(config);
      // Filter predictions for the specific fixture
      return {
        ...data,
        data: data.data.filter((prediction: Record<string, unknown>) => 
          prediction.fixture_id === parseInt(fixtureId)
        )
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTeamStatistics = (teamId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.team(teamId),
    queryFn: async () => {
      const data = await sportmonks.getTeamStatistics(teamId, config);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useLeagueStandings = (seasonId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.standings(seasonId),
    queryFn: async () => {
      const data = await sportmonks.getLeagueStandings(seasonId, config);
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Additional hooks for other endpoints (when client-side fetching is needed)
export const useSeasons = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.seasons(),
    queryFn: async () => {
      const data = await sportmonks.getSeasons(config);
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useLeagues = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.leagues(),
    queryFn: async () => {
      const data = await sportmonks.getLeagues(config);
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useTeams = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.teams(),
    queryFn: async () => {
      const data = await sportmonks.getTeams(config);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
};

export const useTeam = (teamId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.team(teamId),
    queryFn: async () => {
      const data = await sportmonks.getTeam(teamId, config);
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!teamId,
  });
};

export const useTeamWithDetails = (teamId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.team(teamId, config?.include),
    queryFn: async () => {
      const data = await sportmonks.getTeamWithDetails(teamId, config);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!teamId,
  });
};

export const useTeamsByCountry = (countryId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.teamsByCountry(countryId),
    queryFn: async () => {
      const data = await sportmonks.getTeamsByCountry(countryId, config);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!countryId,
  });
};

export const useTeamsByLeague = (leagueId: string, config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.teamsByLeague(leagueId),
    queryFn: async () => {
      const data = await sportmonks.getTeamsByLeague(leagueId, config);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!leagueId,
  });
};

export const usePlayers = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.players(),
    queryFn: async () => {
      const data = await sportmonks.getPlayers(config);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
};

export const useCountries = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.countries(),
    queryFn: async () => {
      const data = await sportmonks.getCountries(config);
      return data;
    },
    staleTime: 720 * 60 * 60 * 1000, // 30 days
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const useVenues = (config?: ApiConfig) => {
  return useQuery({
    queryKey: sportmonksKeys.venues(),
    queryFn: async () => {
      const data = await sportmonks.getVenues(config);
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}; 