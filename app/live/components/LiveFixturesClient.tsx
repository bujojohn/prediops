'use client';

import { useMemo } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';
import { useQuery } from '@tanstack/react-query';
import { FixturesProvider, useFixtures } from '@/app/contexts/FixturesContext';

function groupByLeague(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const country = f.league?.country?.name || 'Other';
    const league = f.league?.name || 'League';
    const key = `${country} - ${league}`;
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

  // Provide fixtures to context
  return (
    <FixturesProvider initialFixtures={data || []}>
      <LiveFixturesInner />
    </FixturesProvider>
  );
}


