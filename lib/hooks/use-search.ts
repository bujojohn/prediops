import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  id: number;
  type: 'country' | 'league' | 'team' | 'fixture';
  name: string;
  subtitle: string;
  icon: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  data: SearchResult[];
  total: number;
  query: string;
  type?: string;
}

interface SearchParams {
  query: string;
  type?: 'all' | 'countries' | 'leagues' | 'teams' | 'fixtures';
  limit?: number;
}

async function performSearch(params: SearchParams): Promise<SearchResponse> {
  const { query, type = 'all', limit = 10 } = params;
  
  if (!query || query.trim().length < 2) {
    return { data: [], total: 0, query, type };
  }

  const searchParams = new URLSearchParams({
    q: query,
    type,
    limit: limit.toString()
  });

  const response = await fetch(`/api/search?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params.query, params.type, params.limit],
    queryFn: () => performSearch(params),
    enabled: !!params.query && params.query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: () => {
      const recent = localStorage.getItem('recent-searches');
      return recent ? JSON.parse(recent) : [];
    },
    staleTime: Infinity, // Never refetch from server
    gcTime: Infinity,
  });
}

export function addToRecentSearches(query: string) {
  try {
    const recent = localStorage.getItem('recent-searches');
    const searches = recent ? JSON.parse(recent) : [];
    
    // Remove if already exists
    const filtered = searches.filter((item: string) => item !== query);
    
    // Add to beginning
    const updated = [query, ...filtered].slice(0, 10);
    
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
}
