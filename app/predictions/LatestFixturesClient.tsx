'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';
import { dateKeyUTC, formatDateUTC, formatSemanticDateUTC } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  DatePickerProvider, 
  HorizontalDatePicker, 
  useDatePickerWithFixtures 
} from '@/app/components/date-picker';

function groupByDate(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, { title: string; fixtures: Fixture[] }>();
  for (const fixture of fixtures) {
    const key = fixture.starting_at ? dateKeyUTC(fixture.starting_at) : 'unknown';
    const title = fixture.starting_at ? formatDateUTC(fixture.starting_at) : 'Unknown Date';
    const entry = map.get(key) || { title, fixtures: [] };
    entry.fixtures.push(fixture);
    map.set(key, entry);
  }
  return Array.from(map.entries()).map(([id, { title, fixtures }]) => ({ id, title, fixtures }));
}

function groupByLeague(fixtures: Fixture[]): Array<{ id: string; title: string; fixtures: Fixture[] }>{
  const map = new Map<string, { title: string; fixtures: Fixture[] }>();
  for (const f of fixtures) {
    const country = f.league?.country?.name || 'Other';
    const league = f.league?.name || 'League';
    const key = `${country} - ${league}`;
    const entry = map.get(key) || { title: key, fixtures: [] };
    entry.fixtures.push(f);
    map.set(key, entry);
  }
  return Array.from(map.entries()).map(([id, { title, fixtures }]) => ({ id, title, fixtures }));
}



function PredictionsContent({ initialFixtures }: { initialFixtures: Fixture[] }) {
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
    isLoading: fixturesLoading,
    error: fixturesError,
  } = useDatePickerWithFixtures();

  const groups = useMemo(() => groupByDate(fixtures), [fixtures]);

  // Initialize collapsed dates - collapse all except today
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

  // Handle date selection
  const handleDateSelect = useCallback(async (date: string) => {
    selectDate(date);
    await loadFixturesForDate(date);
  }, [selectDate, loadFixturesForDate]);

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
      {fixtures.length > 0 ? (
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
                           renderHeader={({ group, toggle, count }) => (
                             <div
                               className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                               onClick={toggle}
                             >
                               <div className="flex items-center gap-2">
                                 <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
                                 <div className="font-medium truncate">{group.title}</div>
                               </div>
                               <button type="button" className="text-xs px-2 py-1 border rounded text-gray-700">
                                 {count}
                               </button>
                             </div>
                             )}
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
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Fixtures Found</h3>
            <p className="text-gray-600 mb-4">
              No fixtures with predictions found for the selected date.
            </p>
            <button
              onClick={() => loadFixturesForDate(selectedDate)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

export function LatestFixturesClient({ initialFixtures }: { initialFixtures: Fixture[] }) {
  return (
    <DatePickerProvider>
      <PredictionsContent initialFixtures={initialFixtures} />
    </DatePickerProvider>
  );
}


