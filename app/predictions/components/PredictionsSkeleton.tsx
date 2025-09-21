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
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
            
            {/* League Groups Skeleton */}
            {Array.from({ length: 2 }).map((_, leagueIndex) => (
              <div key={leagueIndex} className="space-y-2">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
                
                {/* Fixture Cards Skeleton */}
                <div className="space-y-2 pl-4">
                  {Array.from({ length: 3 }).map((_, fixtureIndex) => (
                    <div key={fixtureIndex} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
