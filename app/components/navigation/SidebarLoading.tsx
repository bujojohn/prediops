'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SidebarLoading() {
  return (
    <div className="hidden md:block w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Header skeleton */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Search skeleton */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Skeleton className="h-8 w-full" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
