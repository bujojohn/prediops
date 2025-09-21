'use client';

import { useMemo, useCallback } from 'react';
import { Fixture } from '@/schemas/fixture.schema';
import { FixtureList } from './FixtureList';
import { dateKeyUTC, formatSemanticDateUTC } from '@/lib/utils';

interface FixturesListWithPredictionsProps {
  fixtures: Fixture[];
  title?: string;
  onRefresh?: () => Promise<void> | void;
  compact?: boolean;
}

export function FixturesListWithPredictions({
  fixtures,
  title,
  onRefresh,
  compact = false
}: FixturesListWithPredictionsProps) {
  
  // Group fixtures by date
  const fixtureGroups = useMemo(() => {
    const map = new Map<string, { title: string; fixtures: Fixture[] }>();
    
    fixtures.forEach(fixture => {
      const key = fixture.starting_at ? dateKeyUTC(fixture.starting_at) : 'unknown';
      const dateTitle = fixture.starting_at ? formatSemanticDateUTC(fixture.starting_at) : 'Unknown Date';
      const entry = map.get(key) || { title: dateTitle, fixtures: [] };
      entry.fixtures.push(fixture);
      map.set(key, entry);
    });
    
    return Array.from(map.entries())
      .map(([id, { title: dateTitle, fixtures }]) => ({ 
        id, 
        title: title ? `${title} - ${dateTitle}` : dateTitle, 
        fixtures 
      }))
      .sort((a, b) => {
        // Sort by date, with unknown dates at the end
        if (a.id === 'unknown') return 1;
        if (b.id === 'unknown') return -1;
        return a.id.localeCompare(b.id);
      });
  }, [fixtures, title]);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
  }, [onRefresh]);

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No fixtures found for the selected date range.</p>
      </div>
    );
  }

  return (
    <FixtureList
      groups={fixtureGroups}
      onRefresh={handleRefresh}
      compact={compact}
    />
  );
}
