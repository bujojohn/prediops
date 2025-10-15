import { useState, useCallback } from 'react';

/**
 * Custom hook for managing league fixture counts
 */
export function useLeagueFixtures() {
  const [leagueFixtureCounts, setLeagueFixtureCounts] = useState<Map<number, number>>(new Map());
  const [loadingLeagueCounts, setLoadingLeagueCounts] = useState<Set<number>>(new Set());

  const loadLeagueFixtureCounts = useCallback(async (leagueId: number, force = false) => {
    if (!force && (loadingLeagueCounts.has(leagueId) || leagueFixtureCounts.has(leagueId))) {
      return;
    }

    setLoadingLeagueCounts(prev => new Set(prev).add(leagueId));

    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = nextWeek.toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/sportmonks/leagues/${leagueId}/fixtures?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        const count = data.data.length || 0;
        setLeagueFixtureCounts(prev => new Map(prev).set(leagueId, count));
      } else {
        setLeagueFixtureCounts(prev => new Map(prev).set(leagueId, 0));
      }
    } catch (error) {
      console.error('Error loading fixture counts for league:', leagueId, error);
      setLeagueFixtureCounts(prev => new Map(prev).set(leagueId, 0));
    } finally {
      setLoadingLeagueCounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(leagueId);
        return newSet;
      });
    }
  }, [leagueFixtureCounts, loadingLeagueCounts]);

  const clearCache = useCallback(() => {
    setLeagueFixtureCounts(new Map());
  }, []);

  return {
    leagueFixtureCounts,
    loadingLeagueCounts,
    loadLeagueFixtureCounts,
    clearCache,
  };
}

