'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';
import { dateKeyUTC, formatDateUTC, formatSemanticDateUTC } from '@/lib/utils';

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

export function LatestFixturesClient({ initialFixtures }: { initialFixtures: Fixture[] }) {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures || []);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const groups = useMemo(() => groupByDate(fixtures), [fixtures]);

  const loadNextPage = async () => {
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
  };

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
  }, [hasMore, sentinelRef.current, page, isLoadingMore]);

  return (
    <>
      {/* Group headers with semantic dates */}
      <div className="space-y-4">
        {groups.map((g) => {
          const leagueGroups = groupByLeague(g.fixtures);
          return (
            <div key={g.id} className="space-y-4">
              {/* Date demarcation only */}
              <div className="text-xs sm:text-sm text-gray-500 font-medium px-1">
                {formatSemanticDateUTC(g.fixtures[0]?.starting_at || g.id)}
              </div>
              {/* Only one-level grouping: by league */}
              {leagueGroups.map((lg) => (
                <FixtureList
                  key={lg.id}
                  groups={[lg]}
                  compact={false}
                  renderHeader={({ group, collapsed, toggle, count }) => (
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
  );
}


