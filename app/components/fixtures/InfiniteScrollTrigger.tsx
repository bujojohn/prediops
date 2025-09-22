'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfiniteScrollTriggerProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  variant?: 'button' | 'sentinel' | 'auto';
  className?: string;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Component for triggering infinite scroll loading
 * Supports both manual button trigger and automatic intersection observer
 */
export function InfiniteScrollTrigger({
  isLoading,
  hasMore,
  onLoadMore,
  variant = 'button',
  className,
  sentinelRef,
}: InfiniteScrollTriggerProps) {
  // Manual button trigger
  if (variant === 'button') {
    return (
      <div className={cn('flex justify-center py-4', className)}>
        {hasMore ? (
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More
              </>
            )}
          </Button>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            All fixtures loaded
          </div>
        )}
      </div>
    );
  }

  // Automatic intersection observer trigger (sentinel element)
  if (variant === 'sentinel') {
    return (
      <div
        ref={sentinelRef}
        className={cn('h-4 w-full', className)}
      />
    );
  }

  // Auto variant - shows button on mobile, sentinel on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (isMobile) {
    return (
      <div className={cn('flex justify-center py-4', className)}>
        {hasMore ? (
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More
              </>
            )}
          </Button>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            All fixtures loaded
          </div>
        )}
      </div>
    );
  }

  // Desktop - use sentinel
  return (
    <div
      ref={sentinelRef}
      className={cn('h-4 w-full', className)}
    />
  );
}

export default InfiniteScrollTrigger;
