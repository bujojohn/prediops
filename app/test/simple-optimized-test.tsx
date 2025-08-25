'use client';

import { useOptimizedLiveScores } from '../../lib/hooks/use-optimized-live-scores';

export function SimpleOptimizedTest() {
  const {
    scores,
    isLoading,
    error,
    lastUpdate,
    isPolling,
    refreshScores,
    currentInterval,
    consecutiveErrors,
  } = useOptimizedLiveScores({
    baseInterval: 30000, // 30 seconds
    maxInterval: 300000, // 5 minutes
  });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">🚀 Simple Optimized Live Scores Test</h2>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Status:</strong> {isPolling ? '🟢 Polling' : '🔴 Stopped'}
        </div>
        <div>
          <strong>Interval:</strong> {currentInterval / 1000}s
        </div>
        <div>
          <strong>Errors:</strong> {consecutiveErrors}
        </div>
        <div>
          <strong>Last Update:</strong> {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div className="p-4 bg-blue-100 border border-blue-300 rounded">
          Loading live scores...
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Live Scores ({scores.length})</h3>
        {scores.length === 0 && !isLoading && !error && (
          <p className="text-gray-500">No live scores available</p>
        )}
        {scores.map((score) => (
          <div key={score.id} className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{score.home_team} vs {score.away_team}</div>
                <div className="text-sm text-gray-600">{score.league}</div>
                <div className="text-xs text-gray-500">Status: {score.status}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{score.home_score} - {score.away_score}</div>
                {score.current_minute && (
                  <div className="text-sm text-gray-600">{score.current_minute}&apos;</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={refreshScores}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Scores
      </button>

      <details className="mt-4 p-4 bg-gray-100 rounded">
        <summary className="cursor-pointer font-medium">Debug Info</summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify({ scores: scores.length, isPolling, currentInterval, consecutiveErrors, lastUpdate }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
