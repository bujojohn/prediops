'use client';

import { SidebarWithTanStackQuery } from '@/app/components/navigation/SidebarWithTanStackQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function TestSidebarPage() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 2,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        <SidebarWithTanStackQuery showLogo={true} />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Sidebar TanStack Query Test</h1>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check if countries are loading in the sidebar</li>
                <li>Verify fixture counts appear (next 14 days)</li>
                <li>Test the search functionality</li>
                <li>Test the refresh button</li>
                <li>Check browser console for any errors</li>
              </ol>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Expected Behavior:</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Countries should load automatically</li>
                <li>Fixture counts should show numbers in badges</li>
                <li>Search should filter countries and leagues</li>
                <li>Refresh should reload all data</li>
                <li>No console errors should appear</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">TanStack Query Features:</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Automatic caching (5-10 minute stale time)</li>
                <li>Request deduplication</li>
                <li>Background refetching</li>
                <li>Error handling with retries</li>
                <li>Loading states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
