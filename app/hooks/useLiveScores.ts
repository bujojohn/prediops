'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

interface LiveScore {
  fixtureId: number;
  homeScore: number | null;
  awayScore: number | null;
  state: string;
  currentMinute: number | null;
  matchStatus: 'live' | 'ht' | '2h' | 'ft' | 'cancelled' | 'postponed' | null;
}

export function useLiveScores(fixtures: Fixture[], enabled: boolean = true) {
  const [liveScores, setLiveScores] = useState<Map<number, LiveScore>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);
  
  // Only enable for fixtures that are actually live
  const liveFixtures = fixtures.filter(f => 
    f.state?.short_name === 'LIVE' || 
    f.state?.name?.toLowerCase().includes('live') ||
    f.state?.short_name === 'HT' ||
    f.state?.short_name === '2H'
  );

  const updateLiveScores = useCallback(async () => {
    if (!enabled || liveFixtures.length === 0 || !isMountedRef.current) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch('/api/sportmonks/fixtures/live?limit=20', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch live scores');
      
      const data = await res.json();
      
      // Ensure we have an array of fixtures
      let liveFixturesData: Fixture[] = [];
      if (data?.data && Array.isArray(data.data)) {
        liveFixturesData = data.data;
      } else if (Array.isArray(data)) {
        liveFixturesData = data;
      } else {
        console.warn('Unexpected live fixtures data structure:', data);
        return;
      }
      
      const newScores = new Map<number, LiveScore>();
      
      liveFixturesData.forEach(fixture => {
        // Safety check: ensure fixture has required properties
        if (!fixture || typeof fixture !== 'object' || !fixture.id) {
          console.warn('Invalid fixture object:', fixture);
          return;
        }
        
        // Helper function to get the most appropriate score based on match state
        const getScoreForParticipant = (participant: 'home' | 'away', scores: typeof fixture.scores) => {
          if (!scores || scores.length === 0) return null;
          
          // For finished matches, prioritize FT (Full Time) scores
          if (fixture.state?.short_name === 'FT' || fixture.state?.short_name === 'AET' || fixture.state?.short_name === 'PEN') {
            const ftScore = scores.find(s => 
              s.score?.participant === participant && 
              s.description === 'FT'
            );
            if (ftScore?.score?.goals !== null && ftScore?.score?.goals !== undefined) {
              return ftScore.score.goals;
            }
          }
          
          // For live matches, prioritize CURRENT scores
          if (fixture.state?.short_name === 'LIVE' || fixture.state?.short_name === '2H') {
            const currentScore = scores.find(s => 
              s.score?.participant === participant && 
              s.description === 'CURRENT'
            );
            if (currentScore?.score?.goals !== null && currentScore?.score?.goals !== undefined) {
              return currentScore.score.goals;
            }
          }
          
          // For half-time, prioritize HT scores
          if (fixture.state?.short_name === 'HT') {
            const htScore = scores.find(s => 
              s.score?.participant === participant && 
              s.description === 'HT'
            );
            if (htScore?.score?.goals !== null && htScore?.score?.goals !== undefined) {
              return htScore.score.goals;
            }
          }
          
          // Fallback: get the most recent score (highest goals count, or last entry)
          const participantScores = scores
            .filter(s => s.score?.participant === participant && s.score?.goals !== null && s.score?.goals !== undefined)
            .sort((a, b) => (b.score?.goals || 0) - (a.score?.goals || 0));
          
          return participantScores[0]?.score?.goals || null;
        };
        
        const homeScore = getScoreForParticipant('home', fixture.scores);
        const awayScore = getScoreForParticipant('away', fixture.scores);
        
        // Calculate current minute for live matches (including 2nd half)
        let currentMinute: number | null = null;
        if (fixture.starting_at && 
            (fixture.state?.short_name === 'LIVE' || 
             fixture.state?.short_name === '2H' || 
             fixture.state?.short_name === '2nd')) {
          try {
            const start = new Date(fixture.starting_at);
            const now = new Date();
            const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
            
            // More realistic range: 0-120 minutes (2 hours max for a football match)
            if (diff >= 0 && diff <= 120) currentMinute = diff;
          } catch (error) {
            console.error('Error calculating minutes for fixture:', fixture.id, error);
          }
        }
       
        newScores.set(fixture.id, {
          fixtureId: fixture.id,
          homeScore,
          awayScore,
          state: fixture.state?.name || '',
          currentMinute,
          matchStatus: fixture.state?.short_name?.toLowerCase() as 'live' | 'ht' | '2h' | 'ft' | 'cancelled' | 'postponed' | null
        });
      });
      
      if (isMountedRef.current) {
        setLiveScores(prevScores => {
          const mergedScores = new Map(prevScores);
          newScores.forEach((score, fixtureId) => {
            mergedScores.set(fixtureId, score);
          });
          return mergedScores;
        });
      }
    } catch (error) {
      console.error('Failed to update live scores:', error);
    } finally {
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
    }
  }, [enabled, liveFixtures.length]);

  // Initial update only
  useEffect(() => {
    if (enabled && liveFixtures.length > 0) {
      updateLiveScores();
    }
  }, [enabled, liveFixtures.length, updateLiveScores]);

  // Lightweight polling - only when there are live fixtures
  useEffect(() => {
    if (!enabled || liveFixtures.length === 0) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }
    
    // Set up interval only for live fixtures
    intervalRef.current = setInterval(updateLiveScores, 60000); // Update every 1 minute
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [enabled, liveFixtures.length, updateLiveScores]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, []);

  const getLiveScore = useCallback((fixtureId: number): LiveScore | null => {
    return liveScores.get(fixtureId) || null;
  }, [liveScores]);

  const formatMinutes = useCallback((minutes: number | null): string => {
    if (minutes === null) return '';
    return `${minutes}'`;
  }, []);

  const getStatusDisplay = useCallback((status: string | null): string => {
    if (!status) return '';
    return status.toUpperCase();
  }, []);

  return {
    liveScores,
    getLiveScore,
    getLiveScoreWithMinutes: getLiveScore, // Simplified version
    isUpdating,
    updateLiveScores,
    formatMinutes,
    getStatusDisplay
  };
}
