'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fixture, League, Standing } from '@/schemas';
import { Team } from '@/schemas/team.schema';
import { TeamLogo } from '@/app/components/ui/optimized-image';
import { StandingsTable } from '@/app/components/standings/StandingsTable';
import { LeagueFixturesDisplay } from '@/app/components/league/LeagueFixturesDisplay';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { generateTeamUrl } from '@/lib/utils/routing';

interface LeaguePredictionsClientProps {
  league: League;
  fixtures: Fixture[];
  predictions: unknown[];
  standings?: Standing[];
  teams?: Team[];
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function LeaguePredictionsClient({ 
  league, 
  fixtures, 
  standings = [], 
  teams = [],
  initialStartDate,
  initialEndDate 
}: LeaguePredictionsClientProps) {
  // State for date range (for initial filters)
  const [currentStartDate] = useState<Date>(
    initialStartDate || new Date()
  );
  const [currentEndDate] = useState<Date>(
    initialEndDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 7 days from now
  );

  // Get active tab from hash or default to 'matches'
  const [activeTab, setActiveTab] = useState('matches');

  // Handle hash-based tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'matches';
      setActiveTab(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle tab change with hash update
  const handleTabChange = useCallback((value: string) => {
    window.location.hash = value;
    setActiveTab(value);
  }, []);

  // Extract available markets from fixtures for stats
  const availableMarkets = useMemo(() => {
    const markets = new Set<string>();
    fixtures.forEach(fixture => {
      if (fixture.predictions && Array.isArray(fixture.predictions)) {
        fixture.predictions.forEach((prediction: unknown) => {
          const pred = prediction as { type?: { name?: string } };
          if (pred.type && pred.type.name) {
            markets.add(pred.type.name);
          }
        });
      }
    });
    return Array.from(markets);
  }, [fixtures]);

  // Count fixtures with predictions
  const fixturesWithPredictions = fixtures.filter(fixture => 
    fixture.predictions && Array.isArray(fixture.predictions) && fixture.predictions.length > 0
  ).length;



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


      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matches" id="matches">
            Matches
          </TabsTrigger>
          <TabsTrigger value="standings" id="standings">
            Standings
          </TabsTrigger>
          <TabsTrigger value="teams" id="teams">
            Teams
          </TabsTrigger>
          <TabsTrigger value="statistics" id="statistics">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          <LeagueFixturesDisplay
            leagueId={league.id.toString()}
            initialFixtures={fixtures}
            variant="detailed"
            showSearchAndFilter={true}
            searchAndFilterVariant="full"
            searchAndFilterOptions={{
              showSearch: true,
              showLeagueFilter: false, // Not needed on league page
              showTeamFilter: true,
              showStatusFilter: true,
              showDateFilter: true,
              showPredictionsFilter: true,
              showValueBetsFilter: true,
            }}
            initialFilters={{
              dateRange: {
                from: format(currentStartDate, 'yyyy-MM-dd'),
                to: format(currentEndDate, 'yyyy-MM-dd'),
              }
            }}
          />
        </TabsContent>

        <TabsContent value="standings">
            <Card>
            <CardHeader>
              <CardTitle className="text-lg">League Standings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current season standings for {league.name}
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              {standings.length === 0 ? (
                <div className="py-8 text-center">
                  <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-muted-foreground">Standings not available.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This may be due to the season not starting yet or data not being available.
                  </p>
                </div>
              ) : (
                <StandingsTable
                  groups={[{ name: null, standings }]}
                  variant="full"
                  showGroupLabels={false}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teams</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {teams.length === 0 ? (
                <p className="text-center text-muted-foreground">No teams available.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {teams.map((team) => (
                    <Link
                      key={team.id}
                      href={generateTeamUrl(team)}
                      className="group flex items-center gap-3 rounded border border-border/60 bg-white p-2 transition hover:border-orange-500 hover:shadow-sm dark:border-border/40 dark:bg-gray-900 dark:hover:border-orange-400"
                    >
                      <TeamLogo src={team.image_path} alt={team.name || 'Team'} className="h-6 w-6 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400">
                          {team.name || 'Team'}
                        </div>
                        {team.short_code ? (
                          <div className="text-xs text-muted-foreground">{team.short_code}</div>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
