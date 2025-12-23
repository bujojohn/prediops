import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

/**
 * Skeleton loading component for predictions page
 */
export function PredictionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Date Picker Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Fixtures Loading */}
      <Card className="p-8">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Predictions...</h3>
          <p className="text-gray-600">Fetching fixtures and predictions data.</p>
        </div>
      </Card>

      {/* Fixtures List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {/* Date Group Header Skeleton */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            
            {/* League Groups Skeleton */}
            {Array.from({ length: 2 }).map((_, leagueIndex) => (
              <Card key={leagueIndex}>
                {/* League Header Skeleton */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
                
                {/* Fixture Cards Skeleton - matches CardContent with grid structure */}
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Array.from({ length: 3 }).map((_, fixtureIndex) => (
                      <Card key={fixtureIndex} className="p-4">
                        <div className="space-y-3">
                          {/* Team names and logos */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                            </div>
                          </div>
                          {/* Match time and league */}
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
