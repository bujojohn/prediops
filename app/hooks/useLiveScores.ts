'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

interface LiveScore {
  fixtureId: number;
  homeScore: number | null;
  awayScore: number | null;
  state: string;
}

export function useLiveScores(fixtures: Fixture[], enabled: boolean = true) {
  const [liveScores, setLiveScores] = useState<Map<number, LiveScore>>(new Map());
  const [isUpdating, setIsUpdating] = useState(false);

  const updateLiveScores = useCallback(async () => {
    if (!enabled) return;
    
    const liveFixtures = fixtures.filter(f => 
      f.state?.short_name === 'LIVE' || 
      f.state?.name?.toLowerCase().includes('live')
    );

    if (liveFixtures.length === 0) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/sportmonks/fixtures/live', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch live scores');
      
      const data = await res.json();
      const liveFixturesData: Fixture[] = data?.data?.data || [];
      
      const newScores = new Map<number, LiveScore>();
      
      liveFixturesData.forEach(fixture => {
        const homeScore = fixture.scores?.find(s => s.score?.participant === 'home')?.score?.goals ?? null;
        const awayScore = fixture.scores?.find(s => s.score?.participant === 'away')?.score?.goals ?? null;
        
        newScores.set(fixture.id, {
          fixtureId: fixture.id,
          homeScore,
          awayScore,
          state: fixture.state?.name || ''
        });
      });
      
      setLiveScores(prevScores => {
        const mergedScores = new Map(prevScores);
        newScores.forEach((score, fixtureId) => {
          mergedScores.set(fixtureId, score);
        });
        return mergedScores;
      });
    } catch (error) {
      console.error('Failed to update live scores:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [fixtures, enabled]);

  // Initial update
  useEffect(() => {
    updateLiveScores();
  }, [updateLiveScores]);

  // Polling for live updates
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(updateLiveScores, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [updateLiveScores, enabled]);

  const getLiveScore = useCallback((fixtureId: number): LiveScore | null => {
    return liveScores.get(fixtureId) || null;
  }, [liveScores]);

  return {
    liveScores,
    getLiveScore,
    isUpdating,
    updateLiveScores
  };
}
