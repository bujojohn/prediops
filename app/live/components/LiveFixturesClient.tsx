'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';

function groupByLeague(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = f.league?.name || 'Other';
    const arr = map.get(key) || [];
    arr.push(f);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([title, list]) => ({ id: title, title, fixtures: list }));
}

export function LiveFixturesClient({ initialFixtures }: { initialFixtures: Fixture[] }) {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const groups = useMemo(() => groupByLeague(fixtures), [fixtures]);

  const onRefresh = async () => {
    const res = await fetch('/api/sportmonks/fixtures/live', { cache: 'no-store' });
    const json = await res.json();
    const next: Fixture[] = json?.data?.data || [];
    setFixtures(next);
  };

  // Simple polling to keep live fixtures updated without reload
  useEffect(() => {
    const id = setInterval(() => { onRefresh().catch(() => {}) }, 30_000);
    return () => clearInterval(id);
  }, []);

  return <FixtureList groups={groups} onRefresh={onRefresh} />;
}


