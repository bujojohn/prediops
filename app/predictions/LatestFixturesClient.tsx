'use client';

import { useMemo, useState } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';

function groupByDate(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const dateKey = f.starting_at ? new Date(f.starting_at).toDateString() : 'Unknown Date';
    const arr = map.get(dateKey) || [];
    arr.push(f);
    map.set(dateKey, arr);
  }
  return Array.from(map.entries()).map(([title, list]) => ({ id: title, title, fixtures: list }));
}

export function LatestFixturesClient({ initialFixtures }: { initialFixtures: Fixture[] }) {
  const [fixtures] = useState<Fixture[]>(initialFixtures);
  const groups = useMemo(() => groupByDate(fixtures), [fixtures]);

  return <FixtureList groups={groups} />;
}


