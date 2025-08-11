'use client';

import { useState, useEffect } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, MapPin, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveMatchCard({ liveMatch }: { liveMatch: Fixture }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const homeTeam = liveMatch.participants?.find(
    (p) => p.meta?.location === 'home'
  )?.name || 'Home';
  const awayTeam = liveMatch.participants?.find(
    (p) => p.meta?.location === 'away'
  )?.name || 'Away';

  // Find home/away scores
  const homeScore = liveMatch.scores?.find(
    (s) => s.score?.participant === 'home'
  )?.score?.goals ?? 0;
  const awayScore = liveMatch.scores?.find(
    (s) => s.score?.participant === 'away'
  )?.score?.goals ?? 0;

  // Use state.name or fallback to 'Live'
  const matchStatus = liveMatch.state?.name || 'Live';

  // Simulate real-time updates
  useEffect(() => {
    if (matchStatus === 'Live') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'finished':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {liveMatch.name || `${homeTeam} vs ${awayTeam}`}
          </CardTitle>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border",
            getStatusColor(matchStatus)
          )}>
            {matchStatus}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="font-semibold text-lg mb-1">{homeTeam}</div>
            <div className="text-3xl font-bold text-blue-600">{homeScore}</div>
          </div>
          
          <div className="text-center mx-4">
            <div className="text-xs text-gray-600 mb-1">VS</div>
            {matchStatus === 'Live' && (
              <div className="flex items-center justify-center text-sm font-semibold text-red-600">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeElapsed)}
              </div>
            )}
          </div>
          
          <div className="text-center flex-1">
            <div className="font-semibold text-lg mb-1 text-gray-900">{awayTeam}</div>
            <div className="text-3xl font-bold text-blue-600">{awayScore}</div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-semibold text-gray-900">Match Details</h4>
            <div className="space-y-2 text-sm">
              {liveMatch.venue && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    Venue:
                  </div>
                  <span className="font-medium">{liveMatch.venue.name}</span>
                </div>
              )}
              {liveMatch.league && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <Trophy className="w-4 h-4 mr-2" />
                    League:
                  </div>
                  <span className="font-medium">{liveMatch.league.name}</span>
                </div>
              )}
              {liveMatch.starting_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    Started:
                  </div>
                  <span className="font-medium">
                    {new Date(liveMatch.starting_at).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {liveMatch.referee && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Referee:</span>
                  <span className="font-medium">Available</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Match Start Time */}
        {liveMatch.starting_at && (
          <div className="text-center pt-2 border-t">
            <span className="text-xs text-gray-700">
              Started: {new Date(liveMatch.starting_at).toLocaleTimeString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 