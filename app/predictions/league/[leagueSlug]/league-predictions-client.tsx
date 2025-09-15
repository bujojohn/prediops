'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fixture, League, Standing } from '@/schemas';
import { Team } from '@/schemas/team.schema';
import { TeamLogo } from '@/app/components/ui/optimized-image';
import { FixtureList } from '@/app/components/fixtures/FixtureList';
import { DateRangeModal } from '@/app/components/date-range-picker/DateRangeModal';
import { Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { dateKeyUTC, formatSemanticDateUTC } from '@/lib/utils';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for date range
  const [currentStartDate, setCurrentStartDate] = useState<Date>(
    initialStartDate || new Date()
  );
  const [currentEndDate, setCurrentEndDate] = useState<Date>(
    initialEndDate || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 7 days from now
  );
  const [isLoadingNewRange, setIsLoadingNewRange] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

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

  // Group fixtures by date
  const fixturesByDate = useMemo(() => {
    const map = new Map<string, { title: string; fixtures: Fixture[] }>();
    
    fixtures.forEach(fixture => {
      const key = fixture.starting_at ? dateKeyUTC(fixture.starting_at) : 'unknown';
      const title = fixture.starting_at ? formatSemanticDateUTC(fixture.starting_at) : 'Unknown Date';
      const entry = map.get(key) || { title, fixtures: [] };
      entry.fixtures.push(fixture);
      map.set(key, entry);
    });
    
    return Array.from(map.entries())
      .map(([id, { title, fixtures }]) => ({ id, title, fixtures }))
      .sort((a, b) => {
        // Sort by date, with unknown dates at the end
        if (a.id === 'unknown') return 1;
        if (b.id === 'unknown') return -1;
        return a.id.localeCompare(b.id);
      });
  }, [fixtures]);

  // Handle date range change
  const handleDateRangeChange = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoadingNewRange(true);
    
    try {
      // Update URL with new date range
      const params = new URLSearchParams(searchParams);
      params.set('startDate', format(startDate, 'yyyy-MM-dd'));
      params.set('endDate', format(endDate, 'yyyy-MM-dd'));
      
      // Navigate to new URL with date range parameters
      router.push(`/predictions/league/${league.name?.toLowerCase().replace(/\s+/g, '-')}?${params.toString()}`);
      
      // Update local state
      setCurrentStartDate(startDate);
      setCurrentEndDate(endDate);
    } catch (error) {
      console.error('Error updating date range:', error);
    } finally {
      setIsLoadingNewRange(false);
    }
  }, [router, searchParams, league.name]);


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
      <Tabs defaultValue="fixtures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fixtures">Fixtures & Predictions</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures" className="space-y-4">
          {/* Date Range Selector - Compact */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">Date Range</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {format(currentStartDate, 'MMM dd')} - {format(currentEndDate, 'MMM dd, yyyy')}
                  </span>
                  <button
                    onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Calendar className="w-3 h-3" />
                    {showDateRangePicker ? 'Hide Picker' : 'Change Range'}
                  </button>
                  {isLoadingNewRange && (
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Date Range Modal */}
          <DateRangeModal
            isOpen={showDateRangePicker}
            startDate={currentStartDate}
            endDate={currentEndDate}
            onDateRangeChange={handleDateRangeChange}
            onClose={() => setShowDateRangePicker(false)}
            maxDays={21}
          />

          {/* Fixtures List */}
          {fixtures.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4 max-w-md mx-auto">
                  {/* Icon and Main Message */}
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      No Fixtures Found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      No fixtures found for <strong>{league.name}</strong> in the selected date range.
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-2">Quick actions:</p>
                      <div className="space-y-1">
                        <button
                          onClick={() => setShowDateRangePicker(true)}
                          className="block w-full text-left text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          • Try a different date range
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                            handleDateRangeChange(today, nextWeek);
                          }}
                          className="block w-full text-left text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          • View next 7 days
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                            handleDateRangeChange(lastWeek, today);
                          }}
                          className="block w-full text-left text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          • View last 7 days
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => setShowDateRangePicker(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        Select Different Date Range
                      </button>
                      <button
                        onClick={() => router.push('/predictions')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Browse All Fixtures
                      </button>
                    </div>
                  </div>

                  {/* Date Range Info */}
                  <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p><strong>Current Range:</strong> {format(currentStartDate, 'MMM dd')} - {format(currentEndDate, 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fixturesByDate.map((dateGroup) => (
                <div key={dateGroup.id} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center gap-2 px-2">
                    <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dateGroup.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ({dateGroup.fixtures.length} fixture{dateGroup.fixtures.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    
                  {/* Fixtures for this date */}
                  <FixtureList
                    groups={[{
                      id: `fixtures-${dateGroup.id}`,
                      title: `${league.name} - ${dateGroup.title}`,
                      fixtures: dateGroup.fixtures
                    }]}
                    compact={false}
                    renderHeader={({ toggle, count }) => (
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={toggle}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                          <div className="font-medium truncate text-sm">
                            {league.name} Fixtures
                      </div>
                    </div>
                        <button type="button" className="text-xs px-2 py-1 border rounded text-gray-700 bg-white">
                          {count}
                        </button>
                      </div>
                    )}
                      />
                    </div>
              ))}
                    </div>
          )}
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Standings</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {standings.length === 0 ? (
                <p className="text-center text-muted-foreground">Standings not available.</p>
              ) : (
                <div className="space-y-2">
                  {standings
                    .slice()
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((row) => (
                      <div key={`${row.participant_id}-${row.position}`} className="grid grid-cols-12 items-center text-sm border rounded px-2 py-1">
                        <div className="col-span-1 text-center font-mono">{row.position ?? '-'}</div>
                        <div className="col-span-5 flex items-center gap-2">
                          <TeamLogo src={row.participant?.image_path} alt={row.participant?.name || 'Team'} className="h-5 w-5" />
                          <span className="truncate">{row.participant?.name || 'Team'}</span>
                        </div>
                        <div className="col-span-1 text-center">{row.games_played ?? '-'}</div>
                        <div className="col-span-1 text-center">{row.wins ?? '-'}</div>
                        <div className="col-span-1 text-center">{row.draws ?? '-'}</div>
                        <div className="col-span-1 text-center">{row.losses ?? '-'}</div>
                        <div className="col-span-1 text-center">{row.goal_difference ?? '-'}</div>
                        <div className="col-span-1 text-center font-semibold">{row.points ?? '-'}</div>
                      </div>
                    ))}
                </div>
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
                    <div key={team.id} className="flex items-center gap-3 p-2 border rounded">
                      <TeamLogo src={team.image_path} alt={team.name || 'Team'} className="h-6 w-6" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{team.name || 'Team'}</div>
                        {team.short_code && (
                          <div className="text-xs text-muted-foreground">{team.short_code}</div>
                        )}
                      </div>
                    </div>
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
