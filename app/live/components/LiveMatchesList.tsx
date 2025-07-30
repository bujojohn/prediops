'use client';

import { useState } from 'react';
import { LiveMatchCard } from '../../components/live-matches/LiveMatchCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Fixture } from '@/schemas/fixture.schema';

interface LiveMatchesListProps {
  initialFixtures: Fixture[];
}

export function LiveMatchesList({ initialFixtures }: LiveMatchesListProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/sportmonks/fixtures/live');
      const data = await response.json();
      if (data.success) {
        setFixtures(data.data || []);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {fixtures.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixtures.map((liveMatch: Fixture) => (
            <LiveMatchCard
              key={liveMatch.id}
              liveMatch={liveMatch}
            />
          ))}
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No live matches currently
            </h3>
            <p className="text-gray-500 mb-4">
              Check back later for live match updates
            </p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
} 