'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';
import { dateKeyUTC, formatDateLocal, formatSemanticDateUTC } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  DatePickerProvider, 
  HorizontalDatePicker, 
  useDatePickerWithFixtures 
} from '@/app/components/date-picker';
import { createLeagueGroupTitle } from '@/lib/utils/league-utils';
import { generateCountryUrl, generateLeagueUrl } from '@/lib/utils/routing';

function groupByDate(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, { title: string; fixtures: Fixture[] }>();
  for (const fixture of fixtures) {
    const key = fixture.starting_at ? dateKeyUTC(fixture.starting_at) : 'unknown';
    const title = fixture.starting_at ? formatDateLocal(fixture.starting_at) : 'Unknown Date';
    const entry = map.get(key) || { title, fixtures: [] };
    entry.fixtures.push(fixture);
    map.set(key, entry);
  }
  return Array.from(map.entries()).map(([id, { title, fixtures }]) => ({ id, title, fixtures }));
}

function groupByLeague(fixtures: Fixture[]): FixtureGroup[]{
  const map = new Map<
    string,
    { title: string; fixtures: Fixture[]; meta?: FixtureGroup['meta'] }
  >();
  for (const f of fixtures) {
    const key = createLeagueGroupTitle(f.league || undefined);
    const league = f.league ?? null;
    const country = league?.country ?? null;
    const continent = country?.continent ?? null;

    const existing = map.get(key);
    if (existing) {
      existing.fixtures.push(f);
      existing.meta = {
        league: existing.meta?.league ?? league ?? null,
        country: existing.meta?.country ?? (country ?? null),
        continent: existing.meta?.continent ?? (continent ?? null),
      };
    } else {
      map.set(key, {
        title: key,
        fixtures: [f],
        meta: {
          league: league ?? null,
          country: country ?? null,
          continent: continent ?? null,
        },
      });
    }
  }
  return Array.from(map.entries()).map(([id, { title, fixtures, meta }]) => ({
    id,
    title,
    fixtures,
    meta,
  }));
}



function PredictionsContent({ initialFixtures }: { initialFixtures: Fixture[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures || []);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingDateFixtures, setIsLoadingDateFixtures] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    selectedDate,
    selectDate,
  } = useDatePickerWithFixtures();

  const groups = useMemo(() => groupByDate(fixtures), [fixtures]);

  // Initialize collapsed dates - collapse all except today. 
  // TODO: Make this collapse all except selected date or current date.
  useEffect(() => {
    if (groups.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const newCollapsedDates = new Set<string>();
      
      groups.forEach(group => {
        // Check if this group contains today's fixtures
        const hasTodayFixture = group.fixtures.some(fixture => {
          if (!fixture.starting_at) return false;
          const fixtureDate = new Date(fixture.starting_at).toISOString().split('T')[0];
          return fixtureDate === today;
        });
        
        // If not today's group, collapse it
        if (!hasTodayFixture) {
          newCollapsedDates.add(group.id);
        }
      });
      
      setCollapsedDates(newCollapsedDates);
    }
  }, [groups]);

  // Toggle collapse state for a specific date group
  const toggleDateCollapse = useCallback((dateId: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateId)) {
        newSet.delete(dateId);
      } else {
        newSet.add(dateId);
      }
      return newSet;
    });
  }, []);

  // Load fixtures for selected date
  const loadFixturesForDate = useCallback(async (date: string) => {
    try {
      setIsLoadingDateFixtures(true);
      const response = await fetch(`/api/sportmonks/fixtures/date/${date}?include=participants;scores;state;predictions.type;league.country;events&per_page=100`);
      
      if (!response.ok) {
        throw new Error('Failed to load fixtures for selected date');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setFixtures(data.data);
        setPage(1);
        setHasMore(data.data.length >= 100);
      } else {
        setFixtures([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading fixtures for date:', date, err);
      setFixtures([]);
      setHasMore(false);
    } finally {
      setIsLoadingDateFixtures(false);
    }
  }, []);

  // Handle date selection with URL update
  const handleDateSelect = useCallback(async (date: string) => {
    selectDate(date);
    
    // Update URL to reflect selected date
    const params = new URLSearchParams(searchParams);
    params.set('date', date);
    router.push(`/predictions?${params.toString()}`);
    
    await loadFixturesForDate(date);
  }, [selectDate, loadFixturesForDate, router, searchParams]);

  // Load initial fixtures for today if no fixtures exist
  useEffect(() => {
    if (fixtures.length === 0 && initialFixtures.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      loadFixturesForDate(today);
    }
  }, [fixtures.length, initialFixtures.length, loadFixturesForDate]);

  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/sportmonks/fixtures?page=${nextPage}&per_page=50`, { cache: 'no-store' });
      const json = await res.json();
      const next: Fixture[] = json?.data?.data || [];
      if (next.length === 0) {
        setHasMore(false);
      } else {
        // Deduplicate by fixture.id
        const seen = new Set<number>(fixtures.map((f) => f.id));
        const merged = fixtures.concat(next.filter((f) => !seen.has(f.id)));
        setFixtures(merged);
        setPage(nextPage);
      }
    } catch {
      // stop trying further if fetch fails
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, fixtures]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadNextPage();
        }
      }
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [hasMore, sentinelRef, page, isLoadingMore, loadNextPage]);

  return (
    <div className="space-y-6">
      {/* Date Picker Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Select Date for Predictions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <HorizontalDatePicker
            onDateSelect={handleDateSelect}
            className="mb-4"
          />
          
          <div className="text-xs sm:text-sm text-gray-600">
            <p><strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <div className="space-y-1">
              <p><strong>URL Formats:</strong></p>
              <div className="space-y-1">
                <code className="block bg-gray-100 px-2 py-1 rounded text-xs">
                  /predictions?date={selectedDate}
                </code>
                <code className="block bg-gray-100 px-2 py-1 rounded text-xs">
                  /predictions/{selectedDate}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

                {/* Fixtures Display */}
      {isLoadingDateFixtures ? (
        <Card className="p-8">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Fixtures...</h3>
            <p className="text-gray-600">Loading fixtures for the selected date.</p>
          </div>
        </Card>
      ) : fixtures.length > 0 ? (
        <>
          {/* Group headers with semantic dates */}
          <div className="space-y-4">
                         {groups.map((g) => {
               const leagueGroups = groupByLeague(g.fixtures);
               return (
                 <div key={g.id} className="space-y-4">
                   {/* Date label with toggle */}
                   <div 
                     className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     onClick={() => toggleDateCollapse(g.id)}
                   >
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                         {formatSemanticDateUTC(g.fixtures[0]?.starting_at || g.id)}
                       </span>
                       <span className="text-xs text-gray-500">
                         ({g.fixtures.length} fixture{g.fixtures.length !== 1 ? 's' : ''})
                       </span>
                       {collapsedDates.has(g.id) && (
                         <span className="text-xs text-blue-600 dark:text-blue-400">
                           Click to expand
                         </span>
                       )}
                     </div>
                     <div className="flex items-center gap-2">
                       {collapsedDates.has(g.id) ? (
                         <ChevronRight className="h-4 w-4 text-gray-500" />
                       ) : (
                         <ChevronDown className="h-4 w-4 text-gray-500" />
                       )}
                     </div>
                   </div>
                   
                   {/* Fixtures - only show if not collapsed */}
                   {!collapsedDates.has(g.id) && (
                     <div className="space-y-4">
                       {leagueGroups.map((lg) => (
                         <FixtureList
                           key={lg.id}
                           groups={[lg]}
                           compact={false}
                          renderHeader={({ group, toggle, count, collapsed }) => {
                            const crumbs: Array<{ label: string; href?: string }> = [];
                            const country = group.meta?.country;
                            const continent = group.meta?.continent;
                            const league = group.meta?.league;

                            if (country?.name && country?.id) {
                              try {
                                crumbs.push({
                                  label: country.name,
                                  href: generateCountryUrl(country),
                                });
                              } catch {
                                crumbs.push({ label: country.name });
                              }
                            } else if (continent?.name) {
                              crumbs.push({ label: continent.name });
                            }

                            if (league?.name && league?.id) {
                              try {
                                crumbs.push({
                                  label: league.name,
                                  href: generateLeagueUrl(league),
                                });
                              } catch {
                                crumbs.push({ label: league.name });
                              }
                            }

                            if (crumbs.length === 0) {
                              crumbs.push({ label: group.title });
                            }

                            return (
                              <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
                                onClick={toggle}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {collapsed ? (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  )}
                                  <nav
                                    aria-label="Fixture league breadcrumb"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
                                  >
                                    {crumbs.map((crumb, index) => (
                                      <span key={`${crumb.label}-${index}`} className="flex items-center gap-2 truncate">
                                        {crumb.href ? (
                                          <Link
                                            href={crumb.href}
                                            className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                                            onClick={(event) => event.stopPropagation()}
                                          >
                                            {crumb.label}
                                          </Link>
                                        ) : (
                                          <span className="truncate">{crumb.label}</span>
                                        )}
                                        {index < crumbs.length - 1 && (
                                          <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                                        )}
                                      </span>
                                    ))}
                                  </nav>
                                </div>
                                <button
                                  type="button"
                                  className="text-xs px-2 py-1 border rounded text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggle();
                                  }}
                                >
                                  {count}
                                </button>
                              </div>
                            );
                          }}
                           />
                         ))}
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
          <div ref={sentinelRef} className="h-8" />
          {isLoadingMore && (
            <div className="text-center text-xs text-gray-500 py-2">Loading more…</div>
          )}
          {!hasMore && (
            <div className="text-center text-xs text-gray-400 py-2">No more matches.</div>
          )}
        </>
      ) : (
        <Card className="p-8">
          <div className="text-center max-w-md mx-auto space-y-6">
            {/* Icon and Main Message */}
            <div className="space-y-3">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Fixtures Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
              No fixtures with predictions found for the selected date.
            </p>
            </div>

            {/* Suggested Actions */}
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-2">Try these options:</p>
                <ul className="space-y-1 text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Select a different date using the date picker above</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Check if there are matches scheduled for nearby dates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Look for live matches or recent results</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    const today = new Date();
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const nextWeekStr = nextWeek.toISOString().split('T')[0];
                    handleDateSelect(nextWeekStr);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Try Next Week
                </button>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    handleDateSelect(today);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  View Today
                </button>
            <button
              onClick={() => loadFixturesForDate(selectedDate)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
              </div>
            </div>

            {/* Date Info */}
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p><strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p className="mt-1">
                <strong>Tip:</strong> Some leagues may have breaks or off-seasons. Try selecting nearby dates.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export function LatestFixturesClient({ initialFixtures, initialDate }: { initialFixtures: Fixture[]; initialDate: string }) {
  return (
    <DatePickerProvider initialDate={initialDate}>
      <PredictionsContent initialFixtures={initialFixtures} />
    </DatePickerProvider>
  );
}


