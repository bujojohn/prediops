'use client';

import { useMemo } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';
import { useQuery } from '@tanstack/react-query';
import { FixturesProvider, useFixtures } from '@/app/contexts/FixturesContext';
import { ErrorBoundary } from '@/app/components/error-boundary/ErrorBoundary';
import { createLeagueGroupTitle } from '@/lib/utils/league-utils';

function groupByLeague(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = createLeagueGroupTitle(f.league || undefined);
    const arr = map.get(key) || [];
    arr.push(f);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([title, list]) => ({ id: title, title, fixtures: list }));
}

function LiveFixturesInner() {
  const { fixtures } = useFixtures();
  const groups = useMemo(() => groupByLeague(fixtures), [fixtures]);
  return <FixtureList groups={groups} compact={false} />;
}

export function LiveFixturesClient({ initialFixtures }: { initialFixtures: Fixture[] }) {
  const {
    data,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['live-fixtures'],
    queryFn: async () => {
      const res = await fetch('/api/sportmonks/fixtures/live', { cache: 'no-store' });
      const json = await res.json();
      // Try json.data.data, fallback to json.data, fallback to []
      return json?.data?.data || json?.data || [];
    },
    refetchInterval: 30_000,
    initialData: initialFixtures,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading live fixtures...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 text-center py-8">
        Failed to load live fixtures. Please try again later.<br />
        <span className="text-xs text-gray-500">{error?.message || String(error)}</span>
      </div>
    );
  }

  // Provide fixtures to context
  return (
    <ErrorBoundary>
      <FixturesProvider initialFixtures={data || []}>
        <LiveFixturesInner />
      </FixturesProvider>
    </ErrorBoundary>
  );
}


