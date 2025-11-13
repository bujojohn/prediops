'use client';

import { useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Calendar, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { FixtureList } from '@/app/components/fixtures/FixtureList';
import { formatSemanticDateUTC } from '@/lib/utils';
import { generateCountryUrl, generateLeagueUrl } from '@/lib/utils/routing';
import type { Fixture } from '@/schemas/fixture.schema';
import { groupByDate, groupByLeague } from '../utils/grouping-utils';
import { useCollapsedDates } from '../hooks/useCollapsedDates';

export interface FixturesDisplayProps {
  fixtures: Fixture[];
  selectedDate: string;
  isLoadingDateFixtures: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onTryNextWeek: () => void;
  onTryToday: () => void;
}

/**
 * Component for displaying fixtures with grouping and pagination
 */
export function FixturesDisplay({
  fixtures,
  selectedDate,
  isLoadingDateFixtures,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  onTryNextWeek,
  onTryToday,
}: FixturesDisplayProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const groups = useMemo(() => groupByDate(fixtures), [fixtures]);
  
  const { collapsedDates, toggleDateCollapse } = useCollapsedDates({
    groups,
    selectedDate,
  });

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      }
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [hasMore, onLoadMore]);

  if (isLoadingDateFixtures) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Fixtures...</h3>
          <p className="text-gray-600">Loading fixtures for the selected date.</p>
        </div>
      </Card>
    );
  }

  if (fixtures.length === 0) {
    return (
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
                onClick={onTryNextWeek}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <Calendar className="w-4 h-4" />
                Try Next Week
              </button>
              <button
                onClick={onTryToday}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                View Today
              </button>
              <button
                onClick={onRefresh}
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
    );
  }

  return (
    <>
      {/* Group headers with semantic dates */}
      <div className="space-y-4">
        {groups.map((group) => {
          const leagueGroups = groupByLeague(group.fixtures);
          return (
            <div key={group.id} className="space-y-4">
              {/* Date label with toggle */}
              <div 
                className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleDateCollapse(group.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatSemanticDateUTC(group.fixtures[0]?.starting_at || group.id)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({group.fixtures.length} fixture{group.fixtures.length !== 1 ? 's' : ''})
                  </span>
                  {collapsedDates.has(group.id) && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Click to expand
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {collapsedDates.has(group.id) ? (
                    <span className="text-gray-500">▶</span>
                  ) : (
                    <span className="text-gray-500">▼</span>
                  )}
                </div>
              </div>
              
              {/* Fixtures - only show if not collapsed */}
              {!collapsedDates.has(group.id) && (
                <div className="space-y-4">
                  {leagueGroups.map((leagueGroup) => (
                    <FixtureList
                      key={leagueGroup.id}
                      groups={[leagueGroup]}
                      compact={false}
                      renderHeader={({ group, toggle, count, collapsed }) => {
                        const breadcrumbs: Array<{ label: string; href?: string }> = [];
                        const country = group.meta?.country;
                        const continent = group.meta?.continent;
                        const league = group.meta?.league;

                        if (country?.name && country?.id) {
                          try {
                            breadcrumbs.push({
                              label: country.name,
                              href: generateCountryUrl(country),
                            });
                          } catch {
                            breadcrumbs.push({ label: country.name });
                          }
                        } else if (continent?.name) {
                          breadcrumbs.push({ label: continent.name });
                        }

                        if (league?.name && league?.id) {
                          try {
                            breadcrumbs.push({
                              label: league.name,
                              href: generateLeagueUrl(league),
                            });
                          } catch {
                            breadcrumbs.push({ label: league.name });
                          }
                        }

                        if (breadcrumbs.length === 0) {
                          breadcrumbs.push({ label: group.title });
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
                                {breadcrumbs.map((crumb, index) => (
                                  <span
                                    key={`${crumb.label}-${index}`}
                                    className="flex items-center gap-2 truncate"
                                  >
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
                                    {index < breadcrumbs.length - 1 && (
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
  );
}
