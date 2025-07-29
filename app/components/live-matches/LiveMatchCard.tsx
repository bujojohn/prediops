'use client';

import { useState, useEffect } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

export function LiveMatchCard({ liveMatch }: { liveMatch: Fixture }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const homeTeam = liveMatch.participants?.find(
    (p) => p.meta?.location === 'home'
  )?.name || 'Home';
  const awayTeam = liveMatch.participants?.find(
    (p) => p.meta?.location === 'away'
  )?.name || 'Away';

  // Find home/away scores
  const homeScore = liveMatch.scores?.find(
    (s) => s.score?.participant === 'home'
  )?.score?.goals ?? 0;
  const awayScore = liveMatch.scores?.find(
    (s) => s.score?.participant === 'away'
  )?.score?.goals ?? 0;

  // Use state.name or fallback to 'Live'
  const matchStatus = liveMatch.state?.name || 'Live';

  // Simulate real-time updates
  useEffect(() => {
    if (matchStatus === 'Live') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">
          {liveMatch.name || `${homeTeam} vs ${awayTeam}`}
        </h3>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
          {matchStatus}
        </span>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-center flex-1">
          <div className="font-semibold text-lg">{homeTeam}</div>
          <div className="text-2xl font-bold text-blue-600">{homeScore}</div>
        </div>
        <div className="text-center mx-4">
          <div className="text-xs text-gray-500 mb-1">VS</div>
          {matchStatus === 'Live' && (
            <div className="text-sm font-medium text-red-600">
              {formatTime(timeElapsed)}
            </div>
          )}
        </div>
        <div className="text-center flex-1">
          <div className="font-semibold text-lg">{awayTeam}</div>
          <div className="text-2xl font-bold text-blue-600">{awayScore}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">Match Details</h4>
          <div className="space-y-2 text-sm">
            {liveMatch.venue && (
              <div className="flex justify-between">
                <span className="text-gray-600">Venue:</span>
                <span className="font-medium">{liveMatch.venue.name}</span>
              </div>
            )}
            {liveMatch.league && (
              <div className="flex justify-between">
                <span className="text-gray-600">League:</span>
                <span className="font-medium">{liveMatch.league.name}</span>
              </div>
            )}
            {liveMatch.starting_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">
                  {new Date(liveMatch.starting_at).toLocaleTimeString()}
                </span>
              </div>
            )}
            {liveMatch.referee && (
              <div className="flex justify-between">
                <span className="text-gray-600">Referee:</span>
                <span className="font-medium">Available</span>
              </div>
            )}
          </div>
        </div>
      )}

      {liveMatch.starting_at && (
        <div className="text-center">
          <span className="text-xs text-gray-500">
            Started: {new Date(liveMatch.starting_at).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
} 