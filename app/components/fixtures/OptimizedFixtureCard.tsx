'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Trophy, Target } from 'lucide-react';
import { cn, formatDateUTC, formatTimeUTC } from '@/lib/utils';
import type { Fixture } from '@/schemas/fixture.schema';
import { ValueBetIcon } from '../valuebet/ValueBetIcon';

export interface OptimizedFixtureCardProps {
  fixture: Fixture;
  compact?: boolean;
  showPredictions?: boolean;
  showValueBets?: boolean;
  onPredictionClick?: (fixture: Fixture) => void;
  onValueBetClick?: (fixture: Fixture) => void;
  className?: string;
}

/**
 * Memoized fixture card component for optimal performance
 * Only re-renders when fixture data actually changes
 */
export const OptimizedFixtureCard = memo<OptimizedFixtureCardProps>(({
  fixture,
  compact = false,
  showPredictions = true,
  showValueBets = true,
  className,
}) => {
  // Memoized value bet state calculation
  const valueBetState = React.useMemo(() => {
    // This would be replaced with actual value bet logic
    return 'no-value' as const;
  }, []);

  // Memoized value bet info
  const valueBetInfo = React.useMemo(() => {
    // This would be replaced with actual value bet data
    return {
      count: 0,
      bestOdd: undefined,
      fairOdd: undefined,
      bookmaker: undefined,
      betName: undefined,
    };
  }, []);

  // Memoized participants info
  const participantsInfo = React.useMemo(() => {
    const homeParticipant = fixture.participants?.find(p => p.meta?.location === 'home');
    const awayParticipant = fixture.participants?.find(p => p.meta?.location === 'away');
    
    return {
      home: homeParticipant,
      away: awayParticipant,
      homeName: homeParticipant?.name || 'TBD',
      awayName: awayParticipant?.name || 'TBD',
    };
  }, [fixture.participants]);

  // Memoized fixture status
  const fixtureStatus = React.useMemo(() => {
    if (!fixture.starting_at) return 'upcoming';
    
    const now = new Date();
    const fixtureTime = new Date(fixture.starting_at);
    
    if (fixture.result_info || (fixture.scores && fixture.scores.length > 0)) {
      return 'finished';
    }
    
    if (fixtureTime < now) {
      return 'finished';
    }
    
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (fixtureTime <= twoHoursFromNow) {
      return 'live';
    }
    
    return 'upcoming';
  }, [fixture.starting_at, fixture.result_info, fixture.scores]);

  // Memoized status styling
  const statusClasses = React.useMemo(() => {
    switch (fixtureStatus) {
      case 'live':
        return 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800';
      case 'finished':
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700';
      default:
        return 'border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700';
    }
  }, [fixtureStatus]);

  // Memoized prediction count
  const predictionCount = React.useMemo(() => {
    return fixture.predictions?.length || 0;
  }, [fixture.predictions]);


  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      statusClasses,
      className
    )}>
      <CardContent className={cn(
        'p-4',
        compact && 'p-3'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {fixture.league && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Trophy className="h-3 w-3" />
                <span className="truncate max-w-32">{fixture.league.name}</span>
              </div>
            )}
            {fixtureStatus === 'live' && (
              <Badge variant="destructive" className="text-xs">
                LIVE
              </Badge>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {showValueBets && (
              <ValueBetIcon
                state={valueBetState}
                size="sm"
                showGlow={false}
                valueBetData={valueBetInfo}
              />
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {participantsInfo.homeName}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mx-3">
            <span className="text-gray-400 text-xs">vs</span>
            {fixtureStatus === 'live' && fixture.scores && fixture.scores.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium">
                <span>{String(fixture.scores[0]?.score || '0-0')}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-right">
            <div className="font-medium text-sm truncate">
              {participantsInfo.awayName}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{fixture.starting_at ? formatDateUTC(fixture.starting_at) : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{fixture.starting_at ? formatTimeUTC(fixture.starting_at) : 'TBD'}</span>
          </div>
        </div>

        {/* Predictions */}
        {showPredictions && predictionCount > 0 && (
          <div className="mb-3">
            <div className="text-sm text-blue-600 dark:text-blue-400">
              {predictionCount} prediction{predictionCount !== 1 ? 's' : ''} available
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {predictionCount > 0 && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {predictionCount} prediction{predictionCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {fixture.venue && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-20">{fixture.venue.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  return (
    prevProps.fixture.id === nextProps.fixture.id &&
    prevProps.fixture.starting_at === nextProps.fixture.starting_at &&
    prevProps.fixture.result_info === nextProps.fixture.result_info &&
    prevProps.fixture.predictions?.length === nextProps.fixture.predictions?.length &&
    prevProps.compact === nextProps.compact &&
    prevProps.showPredictions === nextProps.showPredictions &&
    prevProps.showValueBets === nextProps.showValueBets
  );
});

OptimizedFixtureCard.displayName = 'OptimizedFixtureCard';
