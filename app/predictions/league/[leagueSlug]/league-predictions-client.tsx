'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fixture, League } from '@/schemas';
import { TeamLogo } from '@/components/ui/TeamLogo';
import { formatDate, formatTime } from '@/lib/utils';

interface LeaguePredictionsClientProps {
  league: League;
  fixtures: Fixture[];
  predictions: unknown[];
}

export function LeaguePredictionsClient({ league, fixtures }: LeaguePredictionsClientProps) {
  const [selectedMarket, setSelectedMarket] = useState<string>('all');

  // Extract available markets from fixtures
  const availableMarkets = useMemo(() => {
    const markets = new Set<string>();
    fixtures.forEach(fixture => {
      if (fixture.predictions && Array.isArray(fixture.predictions)) {
        fixture.predictions.forEach((prediction: unknown) => {
          const pred = prediction as { market?: { name?: string } };
          if (pred.market && pred.market.name) {
            markets.add(pred.market.name);
          }
        });
      }
    });
    return Array.from(markets);
  }, [fixtures]);

  // Filter fixtures based on selected market
  const filteredFixtures = useMemo(() => {
    if (selectedMarket === 'all') return fixtures;
    
    return fixtures.filter(fixture => {
      if (!fixture.predictions || !Array.isArray(fixture.predictions)) return false;
      
      return fixture.predictions.some((prediction: unknown) => {
        const pred = prediction as { market?: { name?: string } };
        return pred.market && pred.market.name === selectedMarket;
      });
    });
  }, [fixtures, selectedMarket]);

  // Count fixtures with predictions
  const fixturesWithPredictions = fixtures.filter(fixture => 
    fixture.predictions && Array.isArray(fixture.predictions) && fixture.predictions.length > 0
  ).length;

  const renderPredictionMarkets = (fixture: Fixture) => {
    if (!fixture.predictions || !Array.isArray(fixture.predictions)) {
      return <p className="text-muted-foreground text-sm">No predictions available</p>;
    }

    return (
      <div className="space-y-3">
        {fixture.predictions.map((prediction: unknown, index: number) => {
          const pred = prediction as { 
            market?: { name?: string; type?: string }; 
            outcomes?: Array<{ 
              label?: string; 
              name?: string; 
              odds?: number; 
              probability?: number 
            }> 
          };
          
          return (
            <div key={index} className="border rounded-lg p-3 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{pred.market?.name || 'Unknown Market'}</h4>
                <Badge variant="secondary" className="text-xs">
                  {pred.market?.type || 'Unknown Type'}
                </Badge>
              </div>
              
              {pred.outcomes && Array.isArray(pred.outcomes) && (
                <div className="grid grid-cols-1 gap-2">
                  {pred.outcomes.map((outcome, outcomeIndex: number) => (
                    <div key={outcomeIndex} className="flex items-center justify-between p-2 bg-background rounded border">
                      <span className="text-sm font-medium">{outcome.label || outcome.name || 'Unknown'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {outcome.odds ? `${outcome.odds.toFixed(2)}` : 'N/A'}
                        </span>
                        <Badge 
                          variant={outcome.probability && outcome.probability > 0.5 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {outcome.probability ? `${(outcome.probability * 100).toFixed(1)}%` : 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* League Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{league.name}</CardTitle>
              <p className="text-muted-foreground">
                {league.country?.name} • {league.short_code}
              </p>
            </div>
            {league.logo && (
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                <img 
                  src={league.logo} 
                  alt={`${league.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fixtures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixtures.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fixtures with Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixturesWithPredictions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableMarkets.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Market Filter */}
      {availableMarkets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Market</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filter fixtures by prediction market type
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMarket === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMarket('all')}
              >
                All Markets ({fixtures.length})
              </Button>
              {availableMarkets.map((market) => (
                <Button
                  key={market}
                  variant={selectedMarket === market ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMarket(market)}
                >
                  {market} ({filteredFixtures.length})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="fixtures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fixtures">Fixtures & Predictions</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures" className="space-y-4">
          {filteredFixtures.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No fixtures found for the selected market.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFixtures.map((fixture) => (
              <Card key={fixture.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {fixture.stage?.name || 'Unknown Stage'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {fixture.round?.name || 'Unknown Round'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(fixture.starting_at)} • {formatTime(fixture.starting_at)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <TeamLogo 
                        team={fixture.participants?.[0]?.meta?.name || 'Home Team'}
                        logo={fixture.participants?.[0]?.image_path}
                        size="sm"
                      />
                      <span className="font-medium">
                        {fixture.participants?.[0]?.meta?.name || 'Home Team'}
                      </span>
                    </div>
                    
                    <div className="text-center mx-4">
                      <div className="text-lg font-bold">VS</div>
                      <div className="text-xs text-muted-foreground">
                        {fixture.state?.name || 'Scheduled'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-sm font-medium">
                        {fixture.participants?.[1]?.meta?.name || 'Away Team'}
                      </span>
                      <TeamLogo 
                        team={fixture.participants?.[1]?.meta?.name || 'Away Team'}
                        logo={fixture.participants?.[1]?.image_path}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Venue */}
                  {fixture.venue && (
                    <div className="text-sm text-muted-foreground text-center">
                      📍 {fixture.venue.name}
                      {fixture.venue.city && `, ${fixture.venue.city.name}`}
                    </div>
                  )}

                  {/* Predictions */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Prediction Markets</h4>
                    {renderPredictionMarkets(fixture)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Standings data will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Teams information will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                League statistics will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
