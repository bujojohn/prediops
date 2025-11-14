'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Fixture } from '@/schemas/fixture.schema';
import type { League } from '@/schemas/league.schema';
import type { Country } from '@/schemas/country.schema';
import type { Continent } from '@/schemas/continent.schema';
import { FixtureCard } from './FixtureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/app/components/error-boundary';
import { generateLeagueUrl, generateCountryUrl } from '@/lib/utils/routing';

export interface FixtureGroupMeta {
  league?: League | null;
  country?: Country | null;
  continent?: Continent | null;
}

export interface FixtureGroup {
  id: string;
  title: string;
  fixtures: Fixture[];
  meta?: FixtureGroupMeta;
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
            <DefaultGroupHeader
              group={group}
              collapsed={!!collapsed[group.id]}
              onToggle={() => toggle(group.id)}
            />
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

function DefaultGroupHeader({
  group,
  collapsed,
  onToggle,
}: {
  group: FixtureGroup;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const leagueFromMeta = group.meta?.league ?? null;
  const leagueFromFixture = group.fixtures.find((fixture) => fixture.league)?.league ?? null;
  const league = leagueFromMeta ?? leagueFromFixture ?? null;
  
  // Get country from meta, league, or fixtures
  const countryFromMeta = group.meta?.country ?? null;
  const countryFromLeague = league?.country ?? null;
  const country = countryFromMeta ?? countryFromLeague ?? null;

  // Generate URLs
  let countryHref: string | null = null;
  let leagueHref: string | null = null;

  if (country?.id) {
    try {
      countryHref = generateCountryUrl(country);
    } catch {
      countryHref = null;
    }
  }

  if (league?.id) {
    try {
      leagueHref = generateLeagueUrl(league);
    } catch {
      leagueHref = null;
    }
  }

  const leagueName = league?.name ?? group.title;
  const countryName = country?.name ?? null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-border/60 dark:border-border/40">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          aria-label={collapsed ? 'Expand fixtures' : 'Collapse fixtures'}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-border/40 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex-shrink-0"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Breadcrumb: Country / League */}
        <nav className="flex items-center gap-2 min-w-0" aria-label="Breadcrumb">
          {countryName && countryHref ? (
            <>
              <Link
                href={countryHref}
                className="truncate text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                onClick={(e) => e.stopPropagation()}
              >
                {countryName}
              </Link>
              {leagueName && (
                <>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">/</span>
                  {leagueHref ? (
                    <Link
                      href={leagueHref}
                      className="truncate text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {leagueName}
                    </Link>
                  ) : (
                    <span className="truncate text-sm font-semibold text-foreground">{leagueName}</span>
                  )}
                </>
              )}
            </>
          ) : leagueName && leagueHref ? (
            <Link
              href={leagueHref}
              className="truncate text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              onClick={(e) => e.stopPropagation()}
            >
              {leagueName}
            </Link>
          ) : (
            <span className="truncate text-sm font-semibold text-foreground">{leagueName || group.title}</span>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="inline-flex items-center justify-center rounded-full border border-border/60 bg-white px-3 py-1 text-xs font-medium text-muted-foreground dark:border-border/40 dark:bg-gray-800">
          {group.fixtures.length} fixture{group.fixtures.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
