import { useState, useEffect, useRef, useCallback } from 'react';

export interface SimpleLiveScore {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'ht' | '2h' | 'ft' | 'ns';
  minute?: number;
  startTime: string;
}

interface SimpleLiveScoresState {
  scores: SimpleLiveScore[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
}

export const useSimpleLiveScores = () => {
  const [state, setState] = useState<SimpleLiveScoresState>({
    scores: [],
    isLoading: false,
    error: null,
    lastUpdate: 0,
  });
  
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef<boolean>(true);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);
  
  // Fetch live scores
  const fetchScores = useCallback(async () => {
    if (state.isLoading) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/sportmonks/fixtures/live?limit=10');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      if (data.success && data.data) {
        // Transform to simple format
        const transformedScores: SimpleLiveScore[] = data.data.map((fixture: any) => ({
          id: fixture.id?.toString() || '',
          homeTeam: fixture.participants?.[0]?.name || 'Home Team',
          awayTeam: fixture.participants?.[1]?.name || 'Away Team',
          homeScore: fixture.scores?.[0]?.score || 0,
          awayScore: fixture.scores?.[1]?.score || 0,
          status: mapStatus(fixture.state?.short_name || 'NS'),
          minute: fixture.minute || undefined,
          startTime: fixture.starting_at || '',
        }));
        
        setState(prev => ({
          ...prev,
          scores: transformedScores,
          isLoading: false,
          lastUpdate: Date.now(),
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch live scores');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('SimpleLiveScores: Fetch error:', error);
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
      }));
    }
  }, [state.isLoading]);
  
  // Map SportMonks status to simple status
  const mapStatus = (status: string): SimpleLiveScore['status'] => {
    switch (status) {
      case 'LIVE': return 'live';
      case 'HT': return 'ht';
      case '2H': return '2h';
      case 'FT': return 'ft';
      default: return 'ns';
    }
  };
  
  // Start polling
  const startPolling = useCallback(() => {
    if (timerRef.current) return;
    
    console.log('SimpleLiveScores: Starting polling');
    
    // Initial fetch
    fetchScores();
    
    // Set up interval (every 30 seconds)
    timerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchScores();
      }
    }, 30000);
  }, [fetchScores]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('SimpleLiveScores: Stopping polling');
    cleanup();
  }, [cleanup]);
  
  // Manual refresh
  const refreshScores = useCallback(() => {
    console.log('SimpleLiveScores: Manual refresh requested');
    fetchScores();
  }, [fetchScores]);
  
  // Effect to start polling on mount
  useEffect(() => {
    isMountedRef.current = true;
    startPolling();
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [startPolling, cleanup]);
  
  // Background tab detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('SimpleLiveScores: Tab hidden, pausing polling');
        stopPolling();
      } else {
        console.log('SimpleLiveScores: Tab visible, resuming polling');
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
  };
};
