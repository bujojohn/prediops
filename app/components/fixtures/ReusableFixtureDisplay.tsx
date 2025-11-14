"use client";

import { useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, RefreshCw } from "lucide-react";
import { FixtureList } from "./FixtureList";
import { UnifiedDateFilterRow } from "./UnifiedDateFilterRow";
import { formatSemanticDateUTC } from "@/lib/utils";
import type { Fixture } from "@/schemas/fixture.schema";
import { generateLeagueUrl, generateCountryUrl } from "@/lib/utils/routing";
import Link from "next/link";
import {
  groupByDate,
  groupByLeague,
  type FixtureGroup,
} from "@/app/predictions/utils/grouping-utils";
import { useCollapsedDates } from "@/app/predictions/hooks/useCollapsedDates";
import { useFixtureSearchAndFilter } from "@/app/hooks/useFixtureSearchAndFilter";
import { FixtureFilters } from "./fixture-search-utils";

export interface ReusableFixtureDisplayProps {
  fixtures: Fixture[];
  selectedDate?: string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onTryNextWeek?: () => void;
  onTryToday?: () => void;
  onDateChange?: (date: string) => void;

  // Display options
  variant?: "predictions" | "league" | "team" | "live";
  showDateHeaders?: boolean;
  showLeagueHeaders?: boolean;
  showEmptyState?: boolean;
  compact?: boolean;
  autoCollapseNonSelectedDates?: boolean;

  // Search and filter options
  showSearchAndFilter?: boolean;
  searchAndFilterVariant?: "compact" | "full";
  initialFilters?: Partial<FixtureFilters>;
  searchAndFilterOptions?: {
    showSearch?: boolean;
    showLeagueFilter?: boolean;
    showTeamFilter?: boolean;
    showStatusFilter?: boolean;
    showDateFilter?: boolean;
    showPredictionsFilter?: boolean;
    showValueBetsFilter?: boolean;
  };

  // Custom empty state messages
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateActions?: React.ReactNode;

  // Custom grouping
  customGrouping?: (fixtures: Fixture[]) => FixtureGroup[];

  // Custom header renderer
  renderCustomHeader?: (args: {
    group: FixtureGroup;
    collapsed: boolean;
    toggle: () => void;
    count: number;
  }) => React.ReactNode;
}

/**
 * Reusable fixture display component that can be used across different contexts:
 * - Predictions page
 * - League pages
 * - Team pages
 * - Live matches
 * - Any other fixture display needs
 */
export function ReusableFixtureDisplay({
  fixtures,
  selectedDate,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onTryNextWeek,
  onTryToday,
  onDateChange,
  variant = "predictions",
  showDateHeaders = true,
  showLeagueHeaders = true,
  showEmptyState = true,
  compact = false,
  autoCollapseNonSelectedDates = true,
  showSearchAndFilter = true,
  initialFilters,
  searchAndFilterOptions,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateActions,
  customGrouping,
  renderCustomHeader,
}: ReusableFixtureDisplayProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Search and filter functionality
  const {
    filters,
    filteredFixtures,
    hasActiveFilters: hasFilters,
    updateFilters,
    filterStats,
  } = useFixtureSearchAndFilter(fixtures, {
    initialFilters,
  });

  // Determine fixtures to group based on search and filter
  const fixturesToGroup = showSearchAndFilter ? filteredFixtures : fixtures;

  // Determine grouping strategy based on variant and options
  const groups = useMemo(() => {
    if (customGrouping) {
      return customGrouping(fixturesToGroup);
    }

    if (showDateHeaders) {
      return groupByDate(fixturesToGroup);
    }

    if (showLeagueHeaders) {
      return groupByLeague(fixturesToGroup);
    }

    // Single group if no headers needed
    return [
      {
        id: "all-fixtures",
        title: "Fixtures",
        fixtures: fixturesToGroup,
      },
    ];
  }, [fixturesToGroup, customGrouping, showDateHeaders, showLeagueHeaders]);

  const { collapsedDates, toggleDateCollapse } = useCollapsedDates({
    groups,
    selectedDate: selectedDate || "",
    autoCollapseNonSelectedDates,
  });

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || !onLoadMore) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [hasMore, onLoadMore]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Fixtures...
          </h3>
          <p className="text-gray-600">
            Loading fixtures for the selected criteria.
          </p>
        </div>
      </Card>
    );
  }

  // Empty state
  if (showEmptyState && fixtures.length === 0) {
    const defaultTitle = emptyStateTitle || getDefaultEmptyTitle(variant);
    const defaultMessage = emptyStateMessage || getDefaultEmptyMessage(variant);

    return (
      <Card className="p-8">
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className="space-y-3">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {defaultTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{defaultMessage}</p>
          </div>

          {emptyStateActions || (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onTryNextWeek && (
                <button
                  onClick={onTryNextWeek}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Try Next Week
                </button>
              )}
              {onTryToday && (
                <button
                  onClick={onTryToday}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  View Today
                </button>
              )}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Unified Date Filter Row */}
      {showSearchAndFilter && (
        <UnifiedDateFilterRow
          fixtures={fixtures}
          filters={filters}
          onFiltersChange={updateFilters}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          maxPastDays={7}
          maxFutureDays={21}
          isLoading={isLoading}
          {...searchAndFilterOptions}
        />
      )}

      {/* Filter Stats */}
      {showSearchAndFilter && hasFilters && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filterStats.filtered} of {filterStats.total} fixtures
          {filterStats.leagues > 0 && ` across ${filterStats.leagues} leagues`}
        </div>
      )}

      {/* Fixture groups */}
      <div className="space-y-4">
        {groups.map((group) => {
          const leagueGroups =
            showLeagueHeaders && showDateHeaders
              ? groupByLeague(group.fixtures)
              : [group];

          return (
            <div key={group.id} className="space-y-4">
              {/* Date header (if enabled and multiple dates) */}
              {showDateHeaders && groups.length > 1 && (
                <div
                  className="flex items-center justify-between px-3 mt-5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleDateCollapse(group.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatSemanticDateUTC(
                        group.fixtures[0]?.starting_at || group.id
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({group.fixtures.length} fixture
                      {group.fixtures.length !== 1 ? "s" : ""})
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
              )}

              {/* Fixtures - only show if not collapsed or if no date headers */}
              {(!showDateHeaders || !collapsedDates.has(group.id)) && (
                <div className="space-y-4">
                  {group.fixtures.length === 0 ? (
                    // No fixtures notice for this date
                    <div className="text-center py-8 px-4">
                      <div className="space-y-2">
                        <div className="text-gray-400 text-4xl">📅</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No fixtures for{" "}
                          {formatSemanticDateUTC(
                            group.fixtures[0]?.starting_at || group.id
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {variant === "league"
                            ? "This league may have a break or off-season period."
                            : variant === "team"
                            ? "This team may not have matches scheduled."
                            : "No matches are scheduled for this date."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    leagueGroups.map((leagueGroup) => (
                      <FixtureList
                        key={leagueGroup.id}
                        groups={[leagueGroup]}
                        compact={compact}
                        renderHeader={
                          renderCustomHeader ||
                          (({ group, toggle, count }) => {
                            if (!showLeagueHeaders) return null;

                            // Get league and country from group
                            const leagueFromMeta = group.meta?.league ?? null;
                            const leagueFromFixture = group.fixtures.find((fixture) => fixture.league)?.league ?? null;
                            const league = leagueFromMeta ?? leagueFromFixture ?? null;
                            
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
                              <div
                                className="flex items-center justify-between px-4 py-2 cursor-pointer select-none"
                                onClick={toggle}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span className="inline-block h-3 w-3 rounded-sm bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
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
                                <button
                                  type="button"
                                  className="text-sm px-2 py-1 border rounded text-gray-700 dark:text-gray-300 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggle();
                                  }}
                                >
                                  ({count})
                                </button>
                              </div>
                            );
                          })
                        }
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Infinite scroll sentinel */}
      {onLoadMore && <div ref={sentinelRef} className="h-8" />}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="text-center text-xs text-gray-500 py-2">
          Loading more…
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && fixtures.length > 0 && (
        <div className="text-center text-xs text-gray-400 py-2">
          No more matches.
        </div>
      )}
    </>
  );
}

// Helper functions for default empty state content
function getDefaultEmptyTitle(variant: string): string {
  switch (variant) {
    case "league":
      return "No Fixtures Found";
    case "team":
      return "No Team Fixtures";
    case "live":
      return "No Live Matches";
    default:
      return "No Fixtures Found";
  }
}

function getDefaultEmptyMessage(variant: string): string {
  switch (variant) {
    case "league":
      return "No fixtures found for this league.";
    case "team":
      return "No fixtures found for this team.";
    case "live":
      return "No live matches available at the moment.";
    default:
      return "No fixtures with predictions found for the selected criteria.";
  }
}
