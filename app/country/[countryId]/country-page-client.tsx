"use client";

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Calendar, 
  Globe,
  BarChart3
} from 'lucide-react';
import { Country } from '@/schemas/country.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { League } from '@/schemas/league.schema';
import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { generateLeagueUrl } from '@/lib/utils/routing';
import { format } from 'date-fns';

interface CountryPageClientProps {
  country: Country;
  initialFixtures: Fixture[];
  leagues: League[];
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function CountryPageClient({ 
  country, 
  initialFixtures,
  leagues = [],
  initialStartDate,
  initialEndDate 
}: CountryPageClientProps) {
  // State for date range (for initial filters)
  const [currentStartDate] = useState<Date>(
    initialStartDate || new Date()
  );
  const [currentEndDate] = useState<Date>(
    initialEndDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 7 days from now
  );

  // Get active tab from hash or default to 'fixtures'
  const [activeTab, setActiveTab] = useState('fixtures');

  // Handle hash-based tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'fixtures';
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

  // Calculate statistics
  const stats = useMemo(() => {
    const fixturesWithPredictions = initialFixtures.filter(fixture => 
      fixture.predictions && Array.isArray(fixture.predictions) && fixture.predictions.length > 0
    ).length;

    // Extract available markets
    const markets = new Set<string>();
    initialFixtures.forEach(fixture => {
      if (fixture.predictions && Array.isArray(fixture.predictions)) {
        fixture.predictions.forEach((prediction: unknown) => {
          const pred = prediction as { type?: { name?: string } };
          if (pred.type && pred.type.name) {
            markets.add(pred.type.name);
          }
        });
      }
    });

    // Count unique leagues in fixtures
    const uniqueLeagues = new Set<number>();
    initialFixtures.forEach(fixture => {
      if (fixture.league?.id) {
        uniqueLeagues.add(fixture.league.id);
      }
    });

    return {
      totalFixtures: initialFixtures.length,
      fixturesWithPredictions,
      activeLeagues: leagues.length,
      leaguesWithFixtures: uniqueLeagues.size,
      availableMarkets: markets.size,
    };
  }, [initialFixtures, leagues]);

  // Handle refresh (placeholder for now)
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="space-y-6">
      {/* Country Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {country.image_path ? (
              <Image 
                src={country.image_path} 
                alt={country.name || 'Country flag'}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <Globe className="w-16 h-16 text-blue-600" />
            )}
            <div>
              <CardTitle className="text-2xl font-bold">{country.name || 'Unknown Country'}</CardTitle>
              <p className="text-muted-foreground">
                {country.fifa_name || country.official_name || ''} • {stats.activeLeagues} active leagues
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fixtures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFixtures}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected date range
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fixturesWithPredictions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalFixtures > 0 
                ? `${Math.round((stats.fixturesWithPredictions / stats.totalFixtures) * 100)}% coverage`
                : 'No fixtures'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeagues}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.leaguesWithFixtures} with fixtures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableMarkets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Prediction types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fixtures" id="fixtures">
            <Calendar className="w-4 h-4 mr-2" />
            Fixtures
          </TabsTrigger>
          <TabsTrigger value="leagues" id="leagues">
            <Trophy className="w-4 h-4 mr-2" />
            Leagues
          </TabsTrigger>
          <TabsTrigger value="statistics" id="statistics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures" className="space-y-4">
          <ReusableFixtureDisplay
            fixtures={initialFixtures}
            variant="league"
            showDateHeaders={true}
            showLeagueHeaders={true}
            showEmptyState={true}
            showSearchAndFilter={true}
            searchAndFilterVariant="full"
            autoCollapseNonSelectedDates={true}
            searchAndFilterOptions={{
              showSearch: true,
              showLeagueFilter: true, // Allow filtering by league within country
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
            onRefresh={handleRefresh}
            emptyStateTitle={`No Fixtures Found for ${country.name}`}
            emptyStateMessage={`No fixtures found for ${country.name} in the selected date range. Try adjusting the date filter or browse other countries.`}
          />
        </TabsContent>

        {/* Leagues Tab */}
        <TabsContent value="leagues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Leagues in {country.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {leagues.length} {leagues.length === 1 ? 'league' : 'leagues'} available
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              {leagues.length === 0 ? (
                <div className="py-8 text-center">
                  <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-muted-foreground">No leagues available.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This may be due to no active leagues in this country or data not being available.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {leagues.map((league) => {
                    const leagueUrl = generateLeagueUrl(league);
                    
                    // Count fixtures for this league
                    const leagueFixtures = initialFixtures.filter(
                      f => f.league?.id === league.id
                    ).length;

                    return (
                      <Link
                        key={league.id}
                        href={leagueUrl}
                        className="group flex items-center gap-3 rounded-lg border border-border/60 bg-white p-3 transition hover:border-blue-500 hover:shadow-sm dark:border-border/40 dark:bg-gray-900 dark:hover:border-blue-400"
                      >
                        <div className="flex-shrink-0">
                          <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {league.name || 'League'}
                          </div>
                          {league.short_code && (
                            <div className="text-xs text-muted-foreground">{league.short_code}</div>
                          )}
                          {leagueFixtures > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {leagueFixtures} {leagueFixtures === 1 ? 'fixture' : 'fixtures'} in range
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            View
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Country Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overview of {country.name} football data
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Leagues</p>
                    <p className="text-2xl font-bold">{stats.activeLeagues}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Fixtures</p>
                    <p className="text-2xl font-bold">{stats.totalFixtures}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">With Predictions</p>
                    <p className="text-2xl font-bold">{stats.fixturesWithPredictions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Markets</p>
                    <p className="text-2xl font-bold">{stats.availableMarkets}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    More detailed statistics will be available here in the future.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
