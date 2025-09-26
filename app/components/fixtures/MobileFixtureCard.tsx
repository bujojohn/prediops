'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Trophy, Target } from 'lucide-react';
import { cn, formatDateUTC, formatTimeUTC } from '@/lib/utils';
import type { Fixture } from '@/schemas/fixture.schema';
import { ValueBetIcon } from '../valuebet/ValueBetIcon';
import { FixtureTeamLink } from '@/components/ui/TeamLink';

export interface MobileFixtureCardProps {
  fixture: Fixture;
  showPredictions?: boolean;
  showValueBets?: boolean;
  onPredictionClick?: (fixture: Fixture) => void;
  onValueBetClick?: (fixture: Fixture) => void;
  className?: string;
}

/**
 * Mobile-optimized fixture card with touch-friendly interactions
 * Optimized for small screens with larger touch targets
 */
export const MobileFixtureCard = memo<MobileFixtureCardProps>(({
  fixture,
  showPredictions = true,
  showValueBets = true,
  onPredictionClick,
  onValueBetClick,
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
  const participantsInfo = useMemo(() => {
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
  const fixtureStatus = useMemo(() => {
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
  const statusClasses = useMemo(() => {
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
  const predictionCount = useMemo(() => {
    return fixture.predictions?.length || 0;
  }, [fixture.predictions]);

  const handlePredictionClick = React.useCallback(() => {
    if (onPredictionClick) {
      onPredictionClick(fixture);
    }
  }, [onPredictionClick, fixture]);

  const handleValueBetClick = React.useCallback(() => {
    if (onValueBetClick) {
      onValueBetClick(fixture);
    }
  }, [onValueBetClick, fixture]);

  return (
    <Card className={cn(
      'transition-all duration-200 active:scale-95 touch-manipulation',
      statusClasses,
      className
    )}>
      <CardContent className="p-4">
        {/* Header - Mobile optimized with larger touch targets */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {fixture.league && (
              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 min-w-0">
                <Trophy className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{fixture.league.name}</span>
              </div>
            )}
            {fixtureStatus === 'live' && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                LIVE
              </Badge>
            )}
          </div>
          
          {/* Action buttons - Larger touch targets */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showValueBets && (
              <button
                onClick={handleValueBetClick}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Value bet information"
              >
                <ValueBetIcon
                  state={valueBetState}
                  size="md"
                  showGlow={false}
                  valueBetData={valueBetInfo}
                />
              </button>
            )}
          </div>
        </div>

        {/* Teams - Mobile optimized layout */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 text-left">
              {participantsInfo.home ? (
                <FixtureTeamLink team={participantsInfo.home} fixtureId={fixture.id?.toString()}>
                  <div className="font-semibold text-base truncate">
                    {participantsInfo.homeName}
                  </div>
                </FixtureTeamLink>
              ) : (
                <div className="font-semibold text-base truncate">
                  {participantsInfo.homeName}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 mx-4 flex-shrink-0">
              <span className="text-gray-400 text-sm">vs</span>
              {fixtureStatus === 'live' && fixture.scores && fixture.scores.length > 0 && (
                <div className="flex items-center gap-2 text-lg font-bold">
                  <span className="min-w-0 text-center">{String(fixture.scores[0]?.score || '0-0')}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 text-right">
              {participantsInfo.away ? (
                <FixtureTeamLink team={participantsInfo.away} fixtureId={fixture.id?.toString()}>
                  <div className="font-semibold text-base truncate">
                    {participantsInfo.awayName}
                  </div>
                </FixtureTeamLink>
              ) : (
                <div className="font-semibold text-base truncate">
                  {participantsInfo.awayName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time - Mobile optimized */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{fixture.starting_at ? formatDateUTC(fixture.starting_at) : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{fixture.starting_at ? formatTimeUTC(fixture.starting_at) : 'TBD'}</span>
          </div>
        </div>

        {/* Predictions - Mobile optimized */}
        {showPredictions && predictionCount > 0 && (
          <div className="mb-4">
            <button
              onClick={handlePredictionClick}
              className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors touch-manipulation"
            >
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {predictionCount} prediction{predictionCount !== 1 ? 's' : ''} available
              </div>
            </button>
          </div>
        )}

        {/* Footer - Mobile optimized */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            {predictionCount > 0 && (
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{predictionCount} prediction{predictionCount !== 1 ? 's' : ''}</span>
              </span>
            )}
          </div>
          
          {fixture.venue && (
            <div className="flex items-center gap-1 text-gray-500 min-w-0">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{fixture.venue.name}</span>
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
    prevProps.showPredictions === nextProps.showPredictions &&
    prevProps.showValueBets === nextProps.showValueBets
  );
});

MobileFixtureCard.displayName = 'MobileFixtureCard';
