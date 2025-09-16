'use client';
import Head from 'next/head';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PredictionStatusBadge } from '../components/predictions/PredictionStatusBadge';
import { PredictionStatusDashboard } from '../components/predictions/PredictionStatusDashboard';
import { EnhancedPredictionCard } from '../components/predictions/EnhancedPredictionCard';
// import { usePredictionStatus } from '@/lib/hooks/usePredictionStatus';
import { type Prediction } from '@/schemas/predictions.schema';
import { type Fixture } from '@/schemas';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  TrendingUp
} from 'lucide-react';

// Sample data for demonstration
const sampleFixtures: Fixture[] = [
  {
    id: 1,
    name: "Manchester United vs Liverpool",
    starting_at: "2024-01-15T20:00:00Z",
    state: { id: 1, name: "Live", code: "LIVE" },
    participants: [
      { id: 1, name: "Manchester United", meta: { location: "home" } },
      { id: 2, name: "Liverpool", meta: { location: "away" } }
    ],
    scores: [{
      id: 1,
      fixture_id: 1,
      score: {
        goals: 2,
        participant: 'home'
      }
    }, {
      id: 2,
      fixture_id: 1,
      score: {
        goals: 1,
        participant: 'away'
      }
    }]
  } as Fixture,
  {
    id: 2,
    name: "Arsenal vs Chelsea",
    starting_at: "2024-01-15T19:30:00Z",
    state: { id: 2, name: "Finished", code: "FT" },
    participants: [
      { id: 3, name: "Arsenal", meta: { location: "home" } },
      { id: 4, name: "Chelsea", meta: { location: "away" } }
    ],
    scores: [{
      id: 3,
      fixture_id: 2,
      score: {
        goals: 3,
        participant: 'home'
      }
    }, {
      id: 4,
      fixture_id: 2,
      score: {
        goals: 0,
        participant: 'away'
      }
    }]
  } as Fixture,
  {
    id: 3,
    name: "Barcelona vs Real Madrid",
    starting_at: "2024-01-16T21:00:00Z",
    state: { id: 3, name: "Scheduled", code: "SCHEDULED" },
    participants: [
      { id: 5, name: "Barcelona", meta: { location: "home" } },
      { id: 6, name: "Real Madrid", meta: { location: "away" } }
    ],
    scores: []
  } as Fixture
];

const samplePredictions: Prediction[] = [
  {
    id: 1,
    fixture_id: 1,
    type_id: 1,
    type: { id: 1, name: "Full Time Result", code: "fulltime-result-probability" },
    predictions: {
      home: 0.35,
      draw: 0.28,
      away: 0.37
    }
  } as Prediction,
  {
    id: 2,
    fixture_id: 2,
    type_id: 2,
    type: { id: 2, name: "Over/Under 2.5", code: "over-under-2_5-probability" },
    predictions: {
      yes: 0.65,
      no: 0.35
    }
  } as Prediction,
  {
    id: 3,
    fixture_id: 3,
    type_id: 3,
    type: { id: 3, name: "Both Teams to Score", code: "both-teams-to-score-probability" },
    predictions: {
      yes: 0.72,
      no: 0.28
    }
  } as Prediction
];

export default function PredictionStatusDemoPage() {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(30000);
  
  // const {
  //   predictionsWithStatus,
  //   isUpdating,
  //   lastUpdate,
  //   refresh,
  //   getLivePredictions,
  //   getActivePredictions
  // } = usePredictionStatus(samplePredictions, sampleFixtures, {
  //   updateInterval,
  //   enableRealTime: isRealTimeEnabled,
  //   onStatusChange: (predictionId, status) => {
  //     console.log(`Prediction ${predictionId} status changed to:`, status);
  //   }
  // });

  // const livePredictions = getLivePredictions();
  // const activePredictions = getActivePredictions();

  return (
    
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <Head>
        <title>Pediction Status Demo</title>
        <meta name="google" content="nositelinkssearchbox" key="sitelinks" />
        <meta name="google" content="notranslate" key="notranslate" />
      </Head>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Prediction Status System Demo</h1>
        <p className="text-xl text-muted-foreground">
          Real-time tracking of prediction success, succeeding, and failed states
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Button
                variant={isRealTimeEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              >
                {isRealTimeEnabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause Real-time
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Enable Real-time
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Update Interval:</label>
              <select
                value={updateInterval}
                onChange={(e) => setUpdateInterval(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {}} // Placeholder for refresh
              disabled={true} // Disable refresh as usePredictionStatus is commented out
            >
              <RefreshCw className={`h-4 w-4 mr-1`} />
              Refresh Now
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
            {isRealTimeEnabled && (
              <span className="ml-2 text-green-600">
                • Real-time updates enabled ({updateInterval / 1000}s interval)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {/* {predictionsWithStatus.length} */}
                0
              </div>
              <div className="text-sm text-blue-600">Total Predictions</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {/* {livePredictions.length} */}
                0
              </div>
              <div className="text-sm text-red-600">Live Matches</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {/* {activePredictions.length} */}
                0
              </div>
              <div className="text-sm text-yellow-600">Active Predictions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {/* {predictionsWithStatus.filter(p => p.status.status === 'success').length} */}
                0
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Prediction Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Individual Prediction Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samplePredictions.map((prediction) => {
            const fixture = sampleFixtures.find(f => f.id === prediction.fixture_id);
            if (!fixture) return null;
            return (
              <EnhancedPredictionCard
                key={prediction.id}
                prediction={prediction}
                fixture={fixture}
              />
            );
          })}
        </div>
      </div>

      {/* Full Dashboard */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Full Status Dashboard</h2>
        <PredictionStatusDashboard
          predictions={samplePredictions}
          fixtures={sampleFixtures}
        />
      </div>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <PredictionStatusBadge status="pending" />
              <span className="text-sm text-muted-foreground">
                Match hasn&apos;t started yet
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PredictionStatusBadge status="live" />
              <span className="text-sm text-muted-foreground">
                Match is currently in progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PredictionStatusBadge status="succeeding" />
              <span className="text-sm text-muted-foreground">
                Prediction is currently on track
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PredictionStatusBadge status="success" />
              <span className="text-sm text-muted-foreground">
                Prediction was correct
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PredictionStatusBadge status="failed" />
              <span className="text-sm text-muted-foreground">
                Prediction was incorrect
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
