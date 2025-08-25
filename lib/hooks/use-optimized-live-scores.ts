import { useState, useEffect, useRef, useCallback } from 'react';

export interface LiveScore {
  id: string;
  fixture_id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: 'LIVE' | 'HT' | '2H' | 'FT' | 'NS' | 'CANCELLED' | 'POSTPONED';
  current_minute?: number;
  start_time: string;
  league: string;
  venue?: string;
  last_updated: string;
}

interface LiveScoresState {
  scores: LiveScore[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  isPolling: boolean;
}

interface PollingConfig {
  baseInterval: number;
  maxInterval: number;
  backoffMultiplier: number;
  errorBackoffMultiplier: number;
}

export const useOptimizedLiveScores = (config?: Partial<PollingConfig>) => {
  const defaultConfig: PollingConfig = {
    baseInterval: 30000, // 30 seconds
    maxInterval: 300000, // 5 minutes
    backoffMultiplier: 1.5,
    errorBackoffMultiplier: 2,
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<LiveScoresState>({
    scores: [],
    isLoading: false,
    error: null,
    lastUpdate: 0,
    isPolling: false,
  });
  
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentIntervalRef = useRef<number>(finalConfig.baseInterval);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);
  const isMountedRef = useRef<boolean>(true);
  const consecutiveErrorsRef = useRef<number>(0);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  // Fetch live scores with proper error handling
  const fetchLiveScores = useCallback(async () => {
    if (state.isPolling) {
      console.log('LiveScores: Skipping fetch - already polling');
      return;
    }
    
    setState(prev => ({ ...prev, isPolling: true, error: null }));
    
    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/sportmonks/fixtures/live?limit=15', {
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      if (data.success && data.data) {
        // Transform SportMonks data to our LiveScore format
        const transformedScores: LiveScore[] = data.data.map((fixture: unknown) => {
          const f = fixture as {
            id?: number;
            participants?: Array<{ name?: string }>;
            scores?: Array<{ score?: number }>;
            state?: { short_name?: string };
            minute?: number;
            starting_at?: string;
            league?: { name?: string };
            venue?: { name?: string };
          };
          
          return {
            id: f.id?.toString() || '',
            fixture_id: f.id?.toString() || '',
            home_team: f.participants?.[0]?.name || 'Home Team',
            away_team: f.participants?.[1]?.name || 'Away Team',
            home_score: f.scores?.[0]?.score || 0,
            away_score: f.scores?.[1]?.score || 0,
            status: f.state?.short_name || 'NS',
            current_minute: f.minute || undefined,
            start_time: f.starting_at || '',
            league: f.league?.name || 'Unknown League',
            venue: f.venue?.name,
            last_updated: new Date().toISOString(),
          };
        });
        
        setState(prev => ({
          ...prev,
          scores: transformedScores,
          isLoading: false,
          error: null,
          lastUpdate: Date.now(),
          isPolling: false,
        }));
        
        // Reset interval on successful fetch
        currentIntervalRef.current = finalConfig.baseInterval;
        consecutiveErrorsRef.current = 0;
        
        console.log(`LiveScores: Successfully fetched ${transformedScores.length} scores`);
      } else {
        throw new Error(data.error || 'Failed to fetch live scores');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      // Don't update state if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('LiveScores: Request aborted');
        return;
      }
      
      console.error('LiveScores: Fetch error:', error);
      
      consecutiveErrorsRef.current += 1;
      
      // Implement exponential backoff for errors
      const newInterval = Math.min(
        currentIntervalRef.current * finalConfig.errorBackoffMultiplier,
        finalConfig.maxInterval
      );
      
      currentIntervalRef.current = newInterval;
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
        isPolling: false,
      }));
      
      console.log(`LiveScores: Backing off to ${newInterval / 1000}s due to errors`);
    }
  }, [state.isPolling, finalConfig.baseInterval, finalConfig.maxInterval, finalConfig.errorBackoffMultiplier]);
  
  // Start polling
  const startPolling = useCallback(() => {
    if (timerRef.current) {
      console.log('LiveScores: Already polling');
      return;
    }
    
    console.log('LiveScores: Starting polling with interval:', currentIntervalRef.current / 1000, 'seconds');
    
    // Initial fetch
    fetchLiveScores();
    
    // Set up interval
    timerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchLiveScores();
      }
    }, currentIntervalRef.current);
  }, [fetchLiveScores]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('LiveScores: Stopping polling');
    cleanup();
    setState(prev => ({ ...prev, isPolling: false }));
  }, [cleanup]);
  
  // Adjust polling interval based on match status
  const adjustPollingInterval = useCallback(() => {
    const hasLiveMatches = state.scores.some(score => 
      score.status === 'LIVE' || score.status === 'HT' || score.status === '2H'
    );
    
    const hasUpcomingMatches = state.scores.some(score => score.status === 'NS');
    
    let newInterval = finalConfig.baseInterval;
    
    if (hasLiveMatches) {
      newInterval = 15000; // 15 seconds for live matches
    } else if (hasUpcomingMatches) {
      newInterval = 30000; // 30 seconds for upcoming matches
    } else {
      newInterval = 60000; // 1 minute for finished matches
    }
    
    if (newInterval !== currentIntervalRef.current) {
      console.log(`LiveScores: Adjusting interval from ${currentIntervalRef.current / 1000}s to ${newInterval / 1000}s`);
      currentIntervalRef.current = newInterval;
      
      // Restart timer with new interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          if (isMountedRef.current) {
            fetchLiveScores();
          }
        }, newInterval);
      }
    }
  }, [state.scores, finalConfig.baseInterval, fetchLiveScores]);
  
  // Manual refresh
  const refreshScores = useCallback(() => {
    console.log('LiveScores: Manual refresh requested');
    fetchLiveScores();
  }, [fetchLiveScores]);
  
  // Effect to start polling on mount
  useEffect(() => {
    isMountedRef.current = true;
    startPolling();
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [startPolling, cleanup]);
  
  // Effect to adjust polling interval when scores change
  useEffect(() => {
    if (state.scores.length > 0) {
      adjustPollingInterval();
    }
  }, [state.scores, adjustPollingInterval]);
  
  // Background tab detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('LiveScores: Tab hidden, pausing polling');
        stopPolling();
      } else {
        console.log('LiveScores: Tab visible, resuming polling');
        startPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);
  
  return {
    ...state,
    startPolling,
    stopPolling,
    refreshScores,
    currentInterval: currentIntervalRef.current,
    consecutiveErrors: consecutiveErrorsRef.current,
  };
};
