'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useLiveMatches } from '../../lib/hooks/use-live-matches';
import { useLiveMatchesStore } from '../../lib/stores/live-matches-store';
import type { Fixture } from '../../schemas/fixture.schema';

// Mock fixture data for testing
const mockFixtures: Fixture[] = [
  {
    id: 1,
    starting_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // Started 25 minutes ago
    state: { id: 1, short_name: 'LIVE', name: 'Live' },
    participants: [],
    scores: [],
    league: { id: 1, name: 'Premier League' },
    venue: { id: 1, name: 'Old Trafford' },
    predictions: [],
  } as Fixture,
  {
    id: 2,
    starting_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // Started 50 minutes ago (HT)
    state: { id: 2, short_name: 'HT', name: 'Half Time' },
    participants: [],
    scores: [],
    league: { id: 2, name: 'La Liga' },
    venue: { id: 2, name: 'Camp Nou' },
    predictions: [],
  } as Fixture,
  {
    id: 3,
    starting_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // Started 75 minutes ago (2H)
    state: { id: 3, short_name: '2H', name: 'Second Half' },
    participants: [],
    scores: [],
    league: { id: 3, name: 'Bundesliga' },
    venue: { id: 3, name: 'Allianz Arena' },
    predictions: [],
  } as Fixture,
  {
    id: 4,
    starting_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Starts in 30 minutes
    state: { id: 4, short_name: 'NS', name: 'Not Started' },
    participants: [],
    scores: [],
    league: { id: 4, name: 'Serie A' },
    venue: { id: 4, name: 'San Siro' },
    predictions: [],
  } as Fixture,
];

export function LiveMatchesTest() {
  const [testFixtures, setTestFixtures] = useState<Fixture[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use hooks at the top level (React rules)
  const liveMatchesHook = useLiveMatches(testFixtures);
  const liveMatchesStore = useLiveMatchesStore();
  
  // Destructure with fallbacks
  const liveMatchesData = liveMatchesHook.liveMatchesData || [];
  const liveMatchCount = liveMatchesHook.liveMatchCount || 0;
  const hasLiveMatches = liveMatchesHook.hasLiveMatches || false;
  const formatMinutes = liveMatchesHook.formatMinutes || (() => '');
  const getStatusDisplay = liveMatchesHook.getStatusDisplay || (() => '');
  const clearAllMatches = liveMatchesHook.clearAllMatches || (() => {});
  
  const matches = liveMatchesStore.matches || new Map();
  const updateMinutes = liveMatchesStore.updateMinutes || (() => {});

  // Start test with mock fixtures
  const startTest = () => {
    try {
      setError(null); // Clear any previous errors
      // Use fewer fixtures for better performance
      setTestFixtures(mockFixtures.slice(0, 2));
      setIsRunning(true);
    } catch (err) {
      console.error('Error starting test:', err);
      setError(err instanceof Error ? err.message : 'Failed to start test');
    }
  };

  // Stop test
  const stopTest = () => {
    setTestFixtures([]);
    setIsRunning(false);
    clearAllMatches();
  };

  // Manual update for testing
  const manualUpdate = () => {
    updateMinutes();
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Update fixture start times to simulate progression
      setTestFixtures(prev => prev.map(fixture => {
        if (fixture.state?.short_name === 'LIVE' || 
            fixture.state?.short_name === 'HT' || 
            fixture.state?.short_name === '2H') {
          // Move time forward by 1 minute
          if (fixture.starting_at) {
            const newStartTime = new Date(fixture.starting_at);
            newStartTime.setMinutes(newStartTime.getMinutes() - 1);
            return { ...fixture, starting_at: newStartTime.toISOString() };
          }
        }
        return fixture;
      }));
    }, 5000); // Update every 5 seconds for testing

    return () => clearInterval(interval);
  }, [isRunning]);

  // Show error if something went wrong
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error Loading Live Matches</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => setError(null)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={startTest} disabled={isRunning}>
          🚀 Start Live Matches Test
        </Button>
        <Button onClick={stopTest} disabled={!isRunning} variant="destructive">
          ⏹️ Stop Test
        </Button>
        <Button onClick={manualUpdate} disabled={!isRunning}>
          🔄 Manual Update
        </Button>
      </div>

      {/* Live Matches Status */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Live Matches Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{liveMatchCount}</div>
              <div className="text-sm text-blue-600">Live Matches</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{hasLiveMatches ? 'Yes' : 'No'}</div>
              <div className="text-sm text-green-600">Has Live Matches</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{matches.size}</div>
              <div className="text-sm text-purple-600">Total Tracked</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{isRunning ? 'Active' : 'Stopped'}</div>
              <div className="text-sm text-orange-600">Timer Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Matches Data */}
      <Card>
        <CardHeader>
          <CardTitle>⚽ Live Matches Data</CardTitle>
        </CardHeader>
        <CardContent>
          {liveMatchesData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No live matches. Start the test to see data.</p>
          ) : (
            <div className="space-y-4">
              {liveMatchesData.map((match) => (
                <div key={match.fixtureId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">Fixture {match.fixtureId}</div>
                      <div className="text-sm text-gray-600">
                        Status: {getStatusDisplay(match.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatMinutes(match.currentMinute)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(match.lastUpdated || 0).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Store Data */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Raw Store Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(Array.from(matches.entries()), null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. <strong>Start Test</strong> - Initializes mock fixtures and starts the live matches system</p>
            <p>2. <strong>Watch Updates</strong> - Minutes will update every 5 seconds (simulated)</p>
            <p>3. <strong>Manual Update</strong> - Force update minutes and status</p>
            <p>4. <strong>Stop Test</strong> - Cleans up and stops all timers</p>
            <p>5. <strong>Monitor Console</strong> - Check browser console for store updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
