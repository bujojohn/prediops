'use client';

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full transition-colors',
                isCollapsed ? 'bg-gray-400' : 'bg-blue-500'
              )} />
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {group.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {fixtureCount} fixture{fixtureCount !== 1 ? 's' : ''}
              </span>
              <div className={cn(
                'w-4 h-4 transition-transform',
                isCollapsed ? 'rotate-0' : 'rotate-90'
              )}>
                ▶
              </div>
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
