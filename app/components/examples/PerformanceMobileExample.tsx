'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveFixtureDisplay } from '@/app/components/fixtures/ResponsiveFixtureDisplay';
import { useResponsiveDesign } from '@/app/hooks/useResponsiveDesign';
import type { Fixture } from '@/schemas/fixture.schema';

// Mock fixture data for demonstration
const mockFixtures: Fixture[] = [
  {
    id: 1,
    starting_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    participants: [
      {
        id: 1,
        name: 'Manchester United',
        meta: { location: 'home' }
      },
      {
        id: 2,
        name: 'Liverpool FC',
        meta: { location: 'away' }
      }
    ],
    league: {
      id: 1,
      name: 'Premier League',
      country: { id: 1, name: 'England' }
    },
    venue: {
      id: 1,
      name: 'Old Trafford',
      city: { id: 1, name: 'Manchester' }
    },
    predictions: [
      { id: 1, fixture_id: 1, type_id: 1, predictions: { home: 0.65, away: 0.25, draw: 0.10 } },
      { id: 2, fixture_id: 1, type_id: 2, predictions: { yes: 0.72, no: 0.28 } }
    ],
    scores: []
  },
  {
    id: 2,
    starting_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    participants: [
      {
        id: 3,
        name: 'Arsenal FC',
        meta: { location: 'home' }
      },
      {
        id: 4,
        name: 'Chelsea FC',
        meta: { location: 'away' }
      }
    ],
    league: {
      id: 1,
      name: 'Premier League',
      country: { id: 1, name: 'England' }
    },
    venue: {
      id: 2,
      name: 'Emirates Stadium',
      city: { id: 2, name: 'London' }
    },
    predictions: [
      { id: 3, fixture_id: 2, type_id: 1, predictions: { home: 0.58, away: 0.32, draw: 0.10 } },
      { id: 4, fixture_id: 2, type_id: 3, predictions: { yes: 0.68, no: 0.32 } }
    ],
    scores: []
  },
  {
    id: 3,
    starting_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    participants: [
      {
        id: 5,
        name: 'Real Madrid',
        meta: { location: 'home' }
      },
      {
        id: 6,
        name: 'Barcelona FC',
        meta: { location: 'away' }
      }
    ],
    league: {
      id: 2,
      name: 'La Liga',
      country: { id: 2, name: 'Spain' }
    },
    venue: {
      id: 3,
      name: 'Santiago Bernabéu',
      city: { id: 3, name: 'Madrid' }
    },
    predictions: [
      { id: 5, fixture_id: 3, type_id: 1, predictions: { home: 0.62, away: 0.28, draw: 0.10 } },
      { id: 6, fixture_id: 3, type_id: 4, predictions: { yes: 0.85, no: 0.15 } }
    ],
    scores: []
  }
];

/**
 * Example component demonstrating the performance and mobile optimizations
 * This component shows how to integrate the new responsive fixture display
 */
export function PerformanceMobileExample() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    fixtureCount: 0,
    lastUpdate: new Date()
  });
  
  const { isMobile, isTablet, screenWidth, screenHeight } = useResponsiveDesign();

  // Simulate loading fixtures
  useEffect(() => {
    const loadFixtures = async () => {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate more fixtures for performance testing
      const generatedFixtures = Array.from({ length: 25 }, (_, index) => ({
        ...mockFixtures[index % mockFixtures.length],
        id: index + 1,
        starting_at: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      }));
      
      setFixtures(generatedFixtures);
      
      const endTime = performance.now();
      setPerformanceMetrics({
        renderTime: endTime - startTime,
        fixtureCount: generatedFixtures.length,
        lastUpdate: new Date()
      });
      
      setIsLoading(false);
    };

    loadFixtures();
  }, []);

  const handlePredictionClick = (fixture: Fixture) => {
    console.log('Prediction clicked:', fixture);
    // In a real app, this would navigate to prediction details
    alert(`Prediction details for ${fixture.participants?.[0]?.name} vs ${fixture.participants?.[1]?.name}`);
  };

  const handleValueBetClick = (fixture: Fixture) => {
    console.log('Value bet clicked:', fixture);
    // In a real app, this would show value bet information
    alert(`Value bet information for ${fixture.participants?.[0]?.name} vs ${fixture.participants?.[1]?.name}`);
  };

  const deviceInfo = {
    type: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
    dimensions: `${screenWidth}x${screenHeight}`,
    touchOptimized: isMobile || isTablet
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Performance & Mobile Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating responsive fixture display with performance optimizations
        </p>
      </div>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 Device Information
            <Badge variant={deviceInfo.touchOptimized ? "default" : "secondary"}>
              {deviceInfo.type}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Device Type:</strong> {deviceInfo.type}
            </div>
            <div>
              <strong>Screen Size:</strong> {deviceInfo.dimensions}
            </div>
            <div>
              <strong>Touch Optimized:</strong> {deviceInfo.touchOptimized ? 'Yes' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Render Time:</strong> {performanceMetrics.renderTime.toFixed(2)}ms
            </div>
            <div>
              <strong>Fixture Count:</strong> {performanceMetrics.fixtureCount}
            </div>
            <div>
              <strong>Last Update:</strong> {performanceMetrics.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Fixture Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Responsive Fixture Display
            <Badge variant="outline">
              Auto-adapting to {deviceInfo.type.toLowerCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading fixtures...</span>
            </div>
          ) : (
            <ResponsiveFixtureDisplay
              fixtures={fixtures}
              variant="predictions"
              showDateHeaders={true}
              showLeagueHeaders={true}
              showSearchAndFilter={true}
              searchAndFilterVariant="auto"
              searchAndFilterOptions={{
                showSearch: true,
                showLeagueFilter: true,
                showTeamFilter: true,
                showStatusFilter: true,
                showDateFilter: true,
                showPredictionsFilter: true,
                showValueBetsFilter: true,
              }}
              onPredictionClick={handlePredictionClick}
              onValueBetClick={handleValueBetClick}
              emptyStateTitle="No Fixtures Available"
              emptyStateMessage="No fixtures found for the selected criteria. Try adjusting your filters or date range."
            />
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 How to Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <strong>Search & Filter:</strong> Use the search bar and filter options to test the filtering functionality
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <strong>Touch Interactions:</strong> On mobile devices, tap the prediction and value bet buttons
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <strong>Responsive Design:</strong> Resize your browser window to see the layout adapt
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <strong>Performance:</strong> Check the performance metrics above to see render times
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💻 Code Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { ResponsiveFixtureDisplay } from '@/app/components/fixtures/ResponsiveFixtureDisplay';

export function MyComponent({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <ResponsiveFixtureDisplay
      fixtures={fixtures}
      variant="predictions"
      showSearchAndFilter={true}
      searchAndFilterVariant="auto"
      onPredictionClick={(fixture) => {
        // Handle prediction click
      }}
      onValueBetClick={(fixture) => {
        // Handle value bet click
      }}
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceMobileExample;
