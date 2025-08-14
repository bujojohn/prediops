'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureCard } from './FixtureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/app/components/error-boundary';

export interface FixtureGroup {
  id: string;
  title: string;
  fixtures: Fixture[];
}

interface FixtureListProps {
  groups: FixtureGroup[];
  onRefresh?: () => Promise<void> | void;
  compact?: boolean;
  renderHeader?: (args: {
    group: FixtureGroup;
    collapsed: boolean;
    toggle: () => void;
    count: number;
  }) => ReactNode;
}

export function FixtureList({ groups, onRefresh, compact = false, renderHeader }: FixtureListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      {onRefresh && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      )}

      {groups.map((group) => (
        <Card key={`group-${group.id || group.title}`}>
          {renderHeader ? (
            renderHeader({
              group,
              collapsed: !!collapsed[group.id],
              toggle: () => toggle(group.id),
              count: group.fixtures.length,
            })
          ) : (
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              onClick={() => toggle(group.id)}
            >
              <div className="flex items-center gap-2">
                {collapsed[group.id] ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <div className="font-medium">{group.title}</div>
              </div>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                {group.fixtures.length}
              </Button>
            </div>
          )}
          {!collapsed[group.id] && (
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {group.fixtures.map((fixture, index) => (
                  <ErrorBoundary
                    key={
                      fixture.id
                        ? `fixture-${fixture.id}`
                        : `fixture-${fixture.league?.id ?? 'L'}-${fixture.starting_at ?? 'T'}-${
                            (fixture.participants || []).map((p) => p.id).join('-') || 'P'
                          }-${index}`
                    }
                  >
                    <FixtureCard
                      fixture={fixture}
                      compact={compact}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}


