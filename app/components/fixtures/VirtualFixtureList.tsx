'use client';

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { generateCountryUrl, generateLeagueUrl } from '@/lib/utils/routing';
import type { Fixture } from '@/schemas/fixture.schema';
import type { FixtureGroup } from '@/app/predictions/utils/grouping-utils';
import { OptimizedFixtureCard } from './OptimizedFixtureCard';

export interface VirtualFixtureListProps {
  groups: FixtureGroup[];
  height?: number;
  itemHeight?: number;
  compact?: boolean;
  showPredictions?: boolean;
  showValueBets?: boolean;
  onPredictionClick?: (fixture: Fixture) => void;
  onValueBetClick?: (fixture: Fixture) => void;
  className?: string;
  overscanCount?: number;
}

interface ListItem {
  type: 'header' | 'fixture';
  group?: FixtureGroup;
  fixture?: Fixture;
  collapsed?: boolean;
}

/**
 * Virtual scrolling fixture list for optimal performance with large datasets
 * Renders only visible items to maintain smooth scrolling
 */
export const VirtualFixtureList = memo<VirtualFixtureListProps>(({
  groups,
  compact = false,
  showPredictions = true,
  showValueBets = true,
  onPredictionClick,
  onValueBetClick,
  className,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Memoized list items with headers and fixtures
  const listItems = useMemo(() => {
    const items: ListItem[] = [];
    
    groups.forEach(group => {
      const isCollapsed = collapsedGroups.has(group.id);
      
      // Add group header
      items.push({
        type: 'header',
        group,
        collapsed: isCollapsed,
      });
      
      // Add fixtures if group is not collapsed
      if (!isCollapsed) {
        group.fixtures.forEach(fixture => {
          items.push({
            type: 'fixture',
            fixture,
          });
        });
      }
    });
    
    return items;
  }, [groups, collapsedGroups]);

  // Toggle group collapse
  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Memoized item renderer
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = listItems[index];
    
    if (!item) return null;

    if (item.type === 'header') {
      const group = item.group!;
      const isCollapsed = item.collapsed!;
      const fixtureCount = group.fixtures.length;
      
      return (
        <div style={style} className="px-2">
          <div
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => toggleGroup(group.id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
              <nav
                aria-label="Fixture league breadcrumb"
                className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
              >
                {(() => {
                  const crumbs: Array<{ label: string; href?: string }> = [];
                  const country = group.meta?.country;
                  const continent = group.meta?.continent;
                  const league = group.meta?.league;

                  if (country?.name && country?.id) {
                    try {
                      crumbs.push({
                        label: country.name,
                        href: generateCountryUrl(country),
                      });
                    } catch {
                      crumbs.push({ label: country.name });
                    }
                  } else if (continent?.name) {
                    crumbs.push({ label: continent.name });
                  }

                  if (league?.name && league?.id) {
                    try {
                      crumbs.push({
                        label: league.name,
                        href: generateLeagueUrl(league),
                      });
                    } catch {
                      crumbs.push({ label: league.name });
                    }
                  }

                  if (crumbs.length === 0) {
                    crumbs.push({ label: group.title });
                  }

                  return crumbs.map((crumb, index) => (
                    <span key={`${crumb.label}-${index}`} className="flex items-center gap-2 truncate">
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
                      {index < crumbs.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                      )}
                    </span>
                  ));
                })()}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {fixtureCount} fixture{fixtureCount !== 1 ? 's' : ''}
              </span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-gray-500 transition-transform',
                  isCollapsed ? 'rotate-0' : 'rotate-90'
                )}
              />
            </div>
          </div>
        </div>
      );
    }

    // Fixture item
    const fixture = item.fixture!;
    return (
      <div style={style} className="px-2 pb-2">
        <OptimizedFixtureCard
          fixture={fixture}
          compact={compact}
          showPredictions={showPredictions}
          showValueBets={showValueBets}
          onPredictionClick={onPredictionClick}
          onValueBetClick={onValueBetClick}
        />
      </div>
    );
  }, [listItems, toggleGroup, compact, showPredictions, showValueBets, onPredictionClick, onValueBetClick]);

  // Auto-expand groups with few fixtures
  useEffect(() => {
    const shouldExpand = groups.some(group => group.fixtures.length <= 3);
    if (shouldExpand) {
      setCollapsedGroups(new Set());
    }
  }, [groups]);


  if (listItems.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No fixtures found</div>
          <div className="text-sm">Try adjusting your filters or date range</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-h-96 overflow-y-auto', className)}>
      <div className="space-y-2">
        {listItems.map((item, index) => (
          <ItemRenderer key={index} index={index} style={{}} />
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return (
    prevProps.groups.length === nextProps.groups.length &&
    prevProps.height === nextProps.height &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.compact === nextProps.compact &&
    prevProps.showPredictions === nextProps.showPredictions &&
    prevProps.showValueBets === nextProps.showValueBets
  );
});

VirtualFixtureList.displayName = 'VirtualFixtureList';
