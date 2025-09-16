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
import { Calendar, RefreshCw, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { dateKeyUTC, formatSemanticDateUTC } from '@/lib/utils';

// Helper functions to extract data from the API response structure
function getStandingStat(details: unknown[] | null | undefined, statType: string): number | null {
  if (!Array.isArray(details)) return null;
  const stat = details.find((d: unknown) => {
    const detail = d as { type?: { code?: string }; value?: number };
    return detail.type?.code === statType;
  });
  return (stat as { value?: number })?.value ?? null;
}

function getFormString(formArray: unknown[] | string | null | undefined): string {
  if (typeof formArray === 'string') return formArray;
  if (!Array.isArray(formArray)) return '';
  return formArray
    .sort((a: unknown, b: unknown) => {
      const aOrder = (a as { sort_order?: number }).sort_order || 0;
      const bOrder = (b as { sort_order?: number }).sort_order || 0;
      return aOrder - bOrder;
    })
    .map((f: unknown) => (f as { form?: string }).form || '')
    .join('');
}

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
          <TabsTrigger value="fixtures" id="fixtures">
            Fixtures & Predictions
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
              <CardTitle className="text-lg">League Standings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current season standings for {league.name}
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              {standings.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Standings not available.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This may be due to the season not starting yet or data not being available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50 dark:bg-gray-800">
                          <th className="text-left p-3 text-xs font-medium text-gray-600 dark:text-gray-400">Pos</th>
                          <th className="text-left p-3 text-xs font-medium text-gray-600 dark:text-gray-400">Team</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">P</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">W</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">D</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">L</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">GF</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">GA</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">GD</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">Pts</th>
                          <th className="text-center p-3 text-xs font-medium text-gray-600 dark:text-gray-400">Form</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings
                          .slice()
                          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                          .map((row) => {
                            const isTopThree = (row.position ?? 0) <= 3;
                            const isRelegationZone = (row.position ?? 0) > standings.length - 3;
                            
                            return (
                              <tr 
                                key={`${row.participant_id}-${row.position}`} 
                                className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                  isTopThree ? 'bg-green-50 dark:bg-green-900/20' : 
                                  isRelegationZone ? 'bg-red-50 dark:bg-red-900/20' : ''
                                }`}
                              >
                                <td className="p-3 text-sm font-mono font-semibold">
                                  <div className="flex items-center gap-2">
                                    <span className={`
                                      inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                      ${isTopThree ? 'bg-green-500 text-white' : 
                                        isRelegationZone ? 'bg-red-500 text-white' : 
                                        'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                                    `}>
                                      {row.position ?? '-'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <TeamLogo 
                                      src={row.participant?.image_path} 
                                      alt={row.participant?.name || 'Team'} 
                                      className="h-6 w-6 flex-shrink-0" 
                                    />
                                    <div className="min-w-0">
                                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {row.participant?.name || 'Team'}
                                      </div>
                                      {row.result && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                          {row.result}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-center text-sm font-mono">{getStandingStat(row.details, 'overall-matches-played') ?? '-'}</td>
                                <td className="p-3 text-center text-sm font-mono text-green-600 dark:text-green-400">{getStandingStat(row.details, 'overall-won') ?? '-'}</td>
                                <td className="p-3 text-center text-sm font-mono text-gray-600 dark:text-gray-400">{getStandingStat(row.details, 'overall-draw') ?? '-'}</td>
                                <td className="p-3 text-center text-sm font-mono text-red-600 dark:text-red-400">{getStandingStat(row.details, 'overall-lost') ?? '-'}</td>
                                <td className="p-3 text-center text-sm font-mono">{getStandingStat(row.details, 'overall-goals-for') ?? '-'}</td>
                                <td className="p-3 text-center text-sm font-mono">{getStandingStat(row.details, 'overall-goals-against') ?? '-'}</td>
                                <td className="p-3 text-center text-sm font-mono">
                                  <span className={`font-semibold ${
                                    (getStandingStat(row.details, 'goal-difference') ?? 0) > 0 ? 'text-green-600 dark:text-green-400' :
                                    (getStandingStat(row.details, 'goal-difference') ?? 0) < 0 ? 'text-red-600 dark:text-red-400' :
                                    'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {(getStandingStat(row.details, 'goal-difference') ?? 0) > 0 ? '+' : ''}{getStandingStat(row.details, 'goal-difference') ?? '-'}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                                    {row.points ?? '-'}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {(() => {
                                    const formString = getFormString(row.form);
                                    return formString && formString.length > 0 ? (
                                      <div className="flex gap-1 justify-center">
                                        {formString.slice(-5).split('').map((result, i) => (
                                          <span 
                                            key={i}
                                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                                              result === 'W' ? 'bg-green-500 text-white' :
                                              result === 'D' ? 'bg-gray-500 text-white' :
                                              result === 'L' ? 'bg-red-500 text-white' :
                                              'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                          >
                                            {result}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">-</span>
                                    );
                                  })()}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {standings
                      .slice()
                      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                      .map((row) => {
                        const isTopThree = (row.position ?? 0) <= 3;
                        const isRelegationZone = (row.position ?? 0) > standings.length - 3;
                        
                        return (
                          <div 
                            key={`${row.participant_id}-${row.position}`}
                            className={`border rounded-lg p-4 space-y-3 ${
                              isTopThree ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                              isRelegationZone ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                              'bg-white dark:bg-gray-800'
                            }`}
                          >
                            {/* Header Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`
                                  inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                                  ${isTopThree ? 'bg-green-500 text-white' : 
                                    isRelegationZone ? 'bg-red-500 text-white' : 
                                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                                `}>
                                  {row.position ?? '-'}
                                </span>
                                <TeamLogo 
                                  src={row.participant?.image_path} 
                                  alt={row.participant?.name || 'Team'} 
                                  className="h-8 w-8" 
                                />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {row.participant?.name || 'Team'}
                                  </div>
                                  {row.result && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                      {row.result}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-lg font-bold">
                                {row.points ?? '-'}
                              </span>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Played</span>
                                  <span className="font-mono font-semibold">{getStandingStat(row.details, 'overall-matches-played') ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Won</span>
                                  <span className="font-mono text-green-600 dark:text-green-400 font-semibold">{getStandingStat(row.details, 'overall-won') ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Drawn</span>
                                  <span className="font-mono text-gray-600 dark:text-gray-400 font-semibold">{getStandingStat(row.details, 'overall-draw') ?? '-'}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Lost</span>
                                  <span className="font-mono text-red-600 dark:text-red-400 font-semibold">{getStandingStat(row.details, 'overall-lost') ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Goals For</span>
                                  <span className="font-mono font-semibold">{getStandingStat(row.details, 'overall-goals-for') ?? '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Goals Against</span>
                                  <span className="font-mono font-semibold">{getStandingStat(row.details, 'overall-goals-against') ?? '-'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Goal Difference and Form */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Goal Diff:</span>
                                <span className={`font-mono font-semibold ${
                                  (getStandingStat(row.details, 'goal-difference') ?? 0) > 0 ? 'text-green-600 dark:text-green-400' :
                                  (getStandingStat(row.details, 'goal-difference') ?? 0) < 0 ? 'text-red-600 dark:text-red-400' :
                                  'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {(getStandingStat(row.details, 'goal-difference') ?? 0) > 0 ? '+' : ''}{getStandingStat(row.details, 'goal-difference') ?? '-'}
                                </span>
                              </div>
                              {(() => {
                                const formString = getFormString(row.form);
                                return formString && formString.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Form:</span>
                                    <div className="flex gap-1">
                                      {formString.slice(-5).split('').map((result, i) => (
                                        <span
                                          key={i}
                                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                                            result === 'W' ? 'bg-green-500 text-white' :
                                            result === 'D' ? 'bg-gray-500 text-white' :
                                            result === 'L' ? 'bg-red-500 text-white' :
                                            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                          }`}
                                        >
                                          {result}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Champions League/European places</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Relegation zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-green-600">W</span>
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-gray-600">D</span>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-red-600">L</span>
                    </div>
                  </div>
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
