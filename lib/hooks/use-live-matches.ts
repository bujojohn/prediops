import { useEffect, useCallback, useMemo } from 'react';
import { useLiveMatchesStore } from '@/lib/stores/live-matches-store';
import type { Fixture } from '@/schemas/fixture.schema';

export interface LiveMatchData {
  fixtureId: string;
  currentMinute: number | null;
  status: 'live' | 'ht' | '2h' | 'ft' | 'cancelled' | 'postponed' | null;
  isLive: boolean;
  lastUpdated: number | null;
}

export const useLiveMatches = (fixtures: Fixture[] = []) => {
  const {
    matches,
    addLiveMatch,
    removeLiveMatch,
    getCurrentMinute,
    getMatchStatus,
    updateMatchStatus,
    clearAllMatches,
  } = useLiveMatchesStore();

  // Helper function to determine if a fixture is live
  const isLiveFixture = useCallback((fixture: Fixture): boolean => {
    const status = fixture.state?.short_name?.toLowerCase() || '';
    const statusName = fixture.state?.name?.toLowerCase() || '';
    
    return status === 'live' || 
           statusName.includes('live') || 
           statusName.includes('in progress') ||
           statusName.includes('first half') ||
           statusName.includes('second half') ||
           statusName.includes('half time');
  }, []);

  // Auto-manage live matches based on fixture data
  useEffect(() => {
    console.log('useLiveMatches effect triggered:', { 
      fixturesCount: fixtures.length, 
      fixtures: fixtures.map(f => ({ id: f.id, state: f.state?.short_name, starting_at: f.starting_at }))
    });
    
    fixtures.forEach((fixture) => {
      const isLive = fixture.starting_at && isLiveFixture(fixture);
      console.log('Processing fixture:', { 
        id: fixture.id, 
        state: fixture.state?.short_name, 
        starting_at: fixture.starting_at, 
        isLive 
      });
      
      if (isLive && fixture.starting_at) {
        addLiveMatch(fixture.id.toString(), fixture.starting_at);
      } else {
        removeLiveMatch(fixture.id.toString());
      }
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up live matches for fixtures:', fixtures.map(f => f.id));
      fixtures.forEach((fixture) => {
        removeLiveMatch(fixture.id.toString());
      });
    };
  }, [fixtures, addLiveMatch, removeLiveMatch, isLiveFixture]);

  // Get live match data for a specific fixture
  const getLiveMatchData = useCallback((fixtureId: string): LiveMatchData => {
    const currentMinute = getCurrentMinute(fixtureId);
    const status = getMatchStatus(fixtureId);
    const match = matches.get(fixtureId);

    return {
      fixtureId,
      currentMinute,
      status,
      isLive: status === 'live' || status === 'ht' || status === '2h',
      lastUpdated: match?.lastUpdated || null,
    };
  }, [matches, getCurrentMinute, getMatchStatus]);

  // Get all live matches data
  const liveMatchesData = useMemo(() => {
    return Array.from(matches.values()).map((match) => ({
      fixtureId: match.fixtureId,
      currentMinute: match.currentMinute,
      status: match.status,
      isLive: match.isLive,
      lastUpdated: match.lastUpdated,
    }));
  }, [matches]);

  // Get live match count
  const liveMatchCount = useMemo(() => {
    return Array.from(matches.values()).filter(match => match.isLive).length;
  }, [matches]);

  // Format minutes for display
  const formatMinutes = useCallback((minutes: number | null): string => {
    if (minutes === null) return '';
    if (minutes <= 0) return 'Live';
    if (minutes >= 45 && minutes <= 60) return `HT`;
    if (minutes >= 60 && minutes <= 105) return `${minutes}'`;
    if (minutes > 105) return 'FT';
    return `${minutes}'`;
  }, []);

  // Get status display text
  const getStatusDisplay = useCallback((status: LiveMatchData['status']): string => {
    switch (status) {
      case 'live': return 'Live';
      case 'ht': return 'Half Time';
      case '2h': return 'Second Half';
      case 'ft': return 'Full Time';
      case 'cancelled': return 'Cancelled';
      case 'postponed': return 'Postponed';
      default: return '';
    }
  }, []);

  // Check if any matches are currently live
  const hasLiveMatches = useMemo(() => {
    return liveMatchCount > 0;
  }, [liveMatchCount]);

  return {
    // Data
    liveMatchesData,
    liveMatchCount,
    hasLiveMatches,
    
    // Actions
    getLiveMatchData,
    addLiveMatch,
    removeLiveMatch,
    updateMatchStatus,
    clearAllMatches,
    
    // Utilities
    formatMinutes,
    getStatusDisplay,
    isLiveFixture,
  };
};
