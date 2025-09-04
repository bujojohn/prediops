'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, MapPin, Trophy } from 'lucide-react';
import { cn, formatTimeLocal } from '@/lib/utils';

export function LiveMatchCard({ liveMatch }: { liveMatch: Fixture }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const timelineBtnRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

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

  // Debug logs
 /*  console.log('LiveMatchCard:', {
    events: liveMatch.events,
    matchStatus,
    starting_at: liveMatch.starting_at
  }); */

  // Remove latestMinute and all event-based minute logic

  // Format the minute string
  const minuteString = useMemo(() => {
    if ((/live|in progress/i).test(matchStatus) && liveMatch.starting_at) {
      const start = new Date(liveMatch.starting_at + 'Z'); // ensure UTC
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 60000); // minutes
      if (diff > 0 && diff < 200) {
        return `${diff}'`;
      }
    }
    return null;
  }, [matchStatus, liveMatch.starting_at]);

  // Timeline popover outside click
  useEffect(() => {
    if (!showTimeline) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        timelineBtnRef.current &&
        !timelineBtnRef.current.contains(e.target as Node)
      ) {
        setShowTimeline(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTimeline]);

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
          <div className="text-center mx-4 relative">
            <div className="text-xs text-gray-600 mb-1">VS</div>
            {(/live|in progress/i).test(matchStatus) ? (
              <div className="flex items-center justify-center text-sm font-semibold text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2 inline-block" />
                {minuteString ? (
                  <span>{minuteString} <span className="ml-1">Live</span></span>
                ) : (
                  <span>Live</span>
                )}
                {/* Timeline popover trigger (optional, can keep for event timeline) */}
                <button
                  ref={timelineBtnRef}
                  className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Show event timeline"
                  onClick={e => { e.stopPropagation(); setShowTimeline(v => !v); }}
                >
                  <span role="img" aria-label="timeline">📋</span>
                </button>
                {showTimeline && (
                  <div
                    ref={popoverRef}
                    className="absolute z-50 top-full right-0 mt-2 w-80 max-h-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-3 overflow-y-auto text-left"
                  >
                    <div className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Event Timeline</div>
                    {Array.isArray(liveMatch.events) && liveMatch.events.length > 0 ? (
                      <ul className="space-y-2">
                        {[...liveMatch.events]
                          .map(ev => (
                            <li key={ev.id || Math.random()} className="flex items-start gap-2">
                              <span className="font-mono text-xs text-blue-600 min-w-[36px]">{ev.extra_minute ? `${ev.minute}+${ev.extra_minute}'` : ev.minute ? `${ev.minute}'` : ''}</span>
                              <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{ev.info || ev.addition || `Event ${ev.type_id}`}</span>
                              {ev.player_name && (
                                <span className="text-xs text-gray-500 ml-1">{ev.player_name}</span>
                              )}
                              {ev.result && (
                                <span className="text-xs text-gray-400 ml-2">{ev.result}</span>
                              )}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500">No events yet.</div>
                    )}
                  </div>
                )}
              </div>
            ) :
              (/finished|ft|ended/i).test(matchStatus) ? (
                <div className="flex items-center justify-center text-xs text-gray-500 font-medium">
                  {liveMatch.state?.short_name || matchStatus}
                </div>
              ) : (
                liveMatch.starting_at && (
                  <div className="flex items-center justify-center text-xs text-gray-700">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeLocal(liveMatch.starting_at)}
                  </div>
                )
              )
            }
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
                  <span className="font-medium">{formatTimeLocal(liveMatch.starting_at)}</span>
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
            <span className="text-xs text-gray-700">Started: {formatTimeLocal(liveMatch.starting_at)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 