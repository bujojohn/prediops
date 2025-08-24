'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// Real API data structure based on your sample
interface RealFixture {
  id: number;
  name: string;
  starting_at: string;
  state: {
    id: number;
    state: string;
    name: string;
    short_name: string;
    developer_name: string;
  };
  participants: Array<{
    id: number;
    name: string;
    meta: {
      location: 'home' | 'away';
    };
  }>;
  scores: Array<{
    description: string;
    score: {
      goals: number;
      participant: string;
    };
  }>;
}

export function SimpleLiveTest() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Component initialized');
  
  // Add error boundary for this component
  useEffect(() => {
    try {
      setDebugInfo('Component mounted successfully');
      console.log('SimpleLiveTest: Component mounted');
    } catch (err) {
      console.error('SimpleLiveTest: Mount error:', err);
      setError(err instanceof Error ? err.message : 'Mount error');
    }
  }, []);

  // Real fixture data based on your API response
  const realFixtures: RealFixture[] = [
    {
      id: 19553426,
      name: "Egham Town vs Corinthian",
      starting_at: "2025-08-26 18:45:00",
      state: {
        id: 11,
        state: "SUSPENDED",
        name: "Suspended",
        short_name: "SUSP",
        developer_name: "SUSPENDED"
      },
      participants: [
        { id: 1612, name: "Egham Town", meta: { location: "home" } },
        { id: 19742, name: "Corinthian", meta: { location: "away" } }
      ],
      scores: [
        { description: "1ST_HALF", score: { goals: 0, participant: "home" } },
        { description: "1ST_HALF", score: { goals: 0, participant: "away" } },
        { description: "2ND_HALF", score: { goals: 2, participant: "home" } },
        { description: "CURRENT", score: { goals: 1, participant: "away" } }
      ]
    },
    {
      id: 19425915,
      name: "Juárez vs Santos Laguna",
      starting_at: "2025-08-23 01:00:00",
      state: {
        id: 3,
        state: "HT",
        name: "Half Time",
        short_name: "HT",
        developer_name: "HT"
      },
      participants: [
        { id: 6335, name: "Juárez", meta: { location: "home" } },
        { id: 2844, name: "Santos Laguna", meta: { location: "away" } }
      ],
      scores: [
        { description: "1ST_HALF", score: { goals: 0, participant: "home" } },
        { description: "1ST_HALF", score: { goals: 1, participant: "away" } },
        { description: "2ND_HALF", score: { goals: 0, participant: "home" } },
        { description: "2ND_HALF", score: { goals: 1, participant: "away" } }
      ]
    },
    {
      id: 19391088,
      name: "Criciúma vs Novorizontino",
      starting_at: "2025-08-23 00:35:00",
      state: {
        id: 22,
        state: "INPLAY_2ND_HALF",
        name: "2nd Half",
        short_name: "2nd",
        developer_name: "INPLAY_2ND_HALF"
      },
      participants: [
        { id: 6036, name: "Criciúma", meta: { location: "home" } },
        { id: 6370, name: "Novorizontino", meta: { location: "away" } }
      ],
      scores: [
        { description: "1ST_HALF", score: { goals: 0, participant: "home" } },
        { description: "1ST_HALF", score: { goals: 0, participant: "away" } },
        { description: "2ND_HALF", score: { goals: 1, participant: "home" } },
        { description: "2ND_HALF", score: { goals: 0, participant: "away" } }
      ]
    }
  ];

  // Simple live match detection based on real API states
  const isLiveMatch = (fixture: RealFixture): boolean => {
    try {
      const state = fixture.state.short_name.toLowerCase();
      const result = state === 'ht' || state === '2nd' || state === 'live' || 
             fixture.state.name.toLowerCase().includes('half') ||
             fixture.state.name.toLowerCase().includes('in progress');
      
      console.log(`isLiveMatch for ${fixture.name}: ${result} (state: ${state})`);
      return result;
    } catch (err) {
      console.error('Error in isLiveMatch:', err);
      setError(`isLiveMatch error: ${err instanceof Error ? err.message : 'Unknown'}`);
      return false;
    }
  };

  // Calculate minutes played based on real starting_at format
  const calculateMinutes = (startTime: string): number => {
    try {
      // Parse "2025-08-26 18:45:00" format
      const start = new Date(startTime.replace(' ', 'T') + 'Z');
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
      
      // Return minutes if reasonable (0-200 minutes)
      if (diff > 0 && diff < 200) return diff;
      return 0;
    } catch (error) {
      console.error('Error calculating minutes:', error);
      setError(`Minutes calculation error: ${error instanceof Error ? error.message : 'Unknown'}`);
      return 0;
    }
  };

  // Get current score for a fixture
  const getCurrentScore = (fixture: RealFixture): string => {
    try {
      const homeScore = fixture.scores.find(s => 
        s.description === "CURRENT" && s.score.participant === "home"
      )?.score.goals || 0;
      
      const awayScore = fixture.scores.find(s => 
        s.description === "CURRENT" && s.score.participant === "away"
      )?.score.goals || 0;
      
      return `${homeScore} - ${awayScore}`;
    } catch (err) {
      console.error('Error getting score:', err);
      setError(`Score error: ${err instanceof Error ? err.message : 'Unknown'}`);
      return '0 - 0';
    }
  };

  // Start timer for live updates
  const startTimer = () => {
    try {
      if (isTimerRunning) return;
      
      setIsTimerRunning(true);
      setDebugInfo('Timer started');
      
      const interval = setInterval(() => {
        try {
          setCurrentTime(new Date().toLocaleTimeString());
        } catch (err) {
          console.error('Timer update error:', err);
          setError(`Timer error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }, 1000);
      
      // Store interval ID for cleanup
      return () => {
        clearInterval(interval);
        setIsTimerRunning(false);
      };
    } catch (err) {
      console.error('Start timer error:', err);
      setError(`Start timer error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Stop timer
  const stopTimer = () => {
    try {
      setIsTimerRunning(false);
      setDebugInfo('Timer stopped');
    } catch (err) {
      console.error('Stop timer error:', err);
      setError(`Stop timer error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Show error if something went wrong
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error in Simple Live Test</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => setError(null)} variant="outline">
              Try Again
            </Button>
            <div className="text-sm text-red-600">
              <p>Debug Info: {debugInfo}</p>
              <p>Check browser console for more details</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Real API Data Live Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p><strong>Current Time:</strong> {currentTime}</p>
              <p className="text-sm text-gray-600">Debug: {debugInfo}</p>
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={startTimer} 
                  disabled={isTimerRunning}
                  variant="outline"
                >
                  Start Live Clock
                </Button>
                <Button 
                  onClick={stopTimer} 
                  disabled={!isTimerRunning}
                  variant="destructive"
                >
                  Stop Clock
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Real API Fixtures</h3>
              <div className="space-y-3">
                {realFixtures.map((fixture) => {
                  try {
                    const isLive = isLiveMatch(fixture);
                    const minutes = isLive ? calculateMinutes(fixture.starting_at) : null;
                    const currentScore = getCurrentScore(fixture);
                    
                    return (
                      <div key={fixture.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{fixture.name}</p>
                            <p className="text-sm text-gray-600">
                              Started: {new Date(fixture.starting_at.replace(' ', 'T')).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              State: {fixture.state.name} ({fixture.state.short_name})
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {currentScore}
                            </p>
                          </div>
                          <div className="text-right">
                            {isLive ? (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-red-600 font-medium">
                                  {minutes ? `${minutes}' ` : ''}Live
                                </span>
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                {fixture.state.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } catch (err) {
                    console.error(`Error rendering fixture ${fixture.id}:`, err);
                    return (
                      <div key={fixture.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-700">Error rendering fixture: {fixture.name}</p>
                        <p className="text-sm text-red-600">{err instanceof Error ? err.message : 'Unknown error'}</p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Debug Info</h3>
              <div className="space-y-2">
                <p><strong>Live Matches:</strong> {realFixtures.filter(isLiveMatch).length}</p>
                <p><strong>Total Fixtures:</strong> {realFixtures.length}</p>
                <p><strong>Timer Status:</strong> {isTimerRunning ? 'Running' : 'Stopped'}</p>
                <p><strong>Error State:</strong> {error ? 'Yes' : 'No'}</p>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">View Raw Fixture Data</summary>
                <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(realFixtures, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
