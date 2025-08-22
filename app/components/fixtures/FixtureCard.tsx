'use client';

import { useEffect, useMemo, useState, useContext } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TeamLogo } from '@/app/components/ui/optimized-image';
import { formatTimeUTC } from '@/lib/utils';
import { useDisplaySettings } from '@/app/contexts/DisplaySettingsContext';
import { useLiveScores } from '@/app/hooks/useLiveScores';
import { LoadingIndicator } from '@/app/components/ui/loading-indicator';
import { FixturesContext } from '@/app/contexts/FixturesContext';
import { FixturePredictionMarkets } from './FixturePredictionMarkets';



function isLiveMatch(fixture: Fixture): boolean {
  return fixture.state?.short_name === 'LIVE' || (fixture.state?.name?.toLowerCase() || '').includes('live');
}

function getMatchPhase(fixture: Fixture): 'scheduled' | 'live' | 'finished' {
  const status = (fixture.state?.name || '').toLowerCase();
  if (/live|in progress/.test(status)) return 'live';
  if (/finished|ft|ended/.test(status)) return 'finished';
  return 'scheduled';
}

function getMinutesPlayed(fixture: Fixture): number | null {
  if (getMatchPhase(fixture) === 'live' && fixture.starting_at) {
    const start = new Date(fixture.starting_at + 'Z');
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    if (diff > 0 && diff < 200) return diff;
  }
  return null;
}

export function FixtureCard({ fixture: propFixture, compact = false }: { fixture: Fixture; compact?: boolean }) {
  // Use context if available, otherwise fallback to prop
  const context = useContext(FixturesContext);
  const fixture = context?.fixtures?.find(f => f.id === propFixture.id) || propFixture;
  const [expanded, setExpanded] = useState(false);
  const [showH2H, setShowH2H] = useState(false);
  const { settings } = useDisplaySettings();
  const isLive = isLiveMatch(fixture);
  const { getLiveScore, isUpdating } = useLiveScores([fixture], isLive);



  const participantsArray = useMemo(() => (
    Array.isArray(fixture.participants) ? fixture.participants : []
  ), [fixture.participants]);
  const scoresArray = useMemo(() => (
    Array.isArray(fixture.scores) ? fixture.scores : []
  ), [fixture.scores]);

  const home = useMemo(
    () => participantsArray.find((p) => p.meta?.location === 'home'),
    [participantsArray]
  );
  const away = useMemo(
    () => participantsArray.find((p) => p.meta?.location === 'away'),
    [participantsArray]
  );

  const liveScore = getLiveScore(fixture.id);
  const scoreHome = useMemo(
    () => liveScore?.homeScore ?? scoresArray.find((s) => s.score?.participant === 'home')?.score?.goals ?? null,
    [scoresArray, liveScore?.homeScore]
  );
  const scoreAway = useMemo(
    () => liveScore?.awayScore ?? scoresArray.find((s) => s.score?.participant === 'away')?.score?.goals ?? null,
    [scoresArray, liveScore?.awayScore]
  );





  // Force mobile layout on small screens regardless of compact prop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop layout (≥640px) - matches the image design
  if (!compact && !isMobile) {
           return (
           <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center" style={{ minHeight: '60px' }}>
            {/* Column 1: Status/Time */}
            <div className="flex flex-col justify-center">
              {(() => {
                const phase = getMatchPhase(fixture);
                if (phase === 'live') {
                  const mins = getMinutesPlayed(fixture);
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {mins ? `${mins}' ` : ''}Live
                      </span>
                    </div>
                  );
                }
                if (phase === 'scheduled' && fixture.starting_at) {
                  return (
                    <div className="flex items-center gap-1">
                      <span>{formatTimeUTC(fixture.starting_at || '')}</span>
                    </div>
                  );
                }
                // For finished/other states, show short name if available
                if (fixture.state?.short_name) {
                  return (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-500">{fixture.state.short_name}</span>
                    </div>
                  );
                }
                // If finished, show nothing (or status if desired)
                return null;
              })()}
              {fixture.state?.name && fixture.state.name !== 'Not Started' && (
                <div className="text-gray-500">- {fixture.state.name}</div>
              )}
            </div>

            {/* Column 2: Teams */}
            <div className="flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                {settings.showTeamImages && (
                  <TeamLogo src={home?.image_path ?? undefined} alt={home?.name || 'Home'} className="rounded h-4 w-4" />
                )}
                                         <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">{home?.name || 'Home'}</span>
              </div>
              <div className="flex items-center gap-2">
                {settings.showTeamImages && (
                  <TeamLogo src={away?.image_path ?? undefined} alt={away?.name || 'Away'} className="rounded h-4 w-4" />
                )}
                                       <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">{away?.name || 'Away'}</span>
              </div>
            </div>

            {/* Column 3: Scores */}
            <div className="flex flex-col justify-center gap-1">
              {isLive && isUpdating ? (
                <LoadingIndicator size="sm" text="Updating..." />
              ) : (
                <>
                                           <div className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                           {scoreHome !== null ? scoreHome : '-'}
                         </div>
                         <div className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                           {scoreAway !== null ? scoreAway : '-'}
                         </div>
                </>
          )}
        </div>

                               {/* Column 4: Prediction Probabilities */}
                   <div className="flex flex-col justify-center">
              {fixture.predictions && fixture.predictions.length > 0 && (
                <FixturePredictionMarkets 
                  predictions={fixture.predictions} 
                  variant="desktop"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile layout (compact) - existing design
  return (
    <Card className="w-full">
      <CardContent className="py-2 overflow-x-hidden"> 
        {/* Header: state/time on left, date on right (mobile spec simplified) */}
        <div className="flex items-center justify-between text-[12px] text-gray-600">
          <div className="w-16 shrink-0 tabular-nums text-center">{formatTimeUTC(fixture.starting_at || '')}</div>
          <div className="w-12 shrink-0 tabular-nums text-center">{(() => { const m = getMinutesPlayed(fixture); return m != null ? `${m}'` : '-'; })()}</div>
          <div className="w-14 shrink-0 text-center" title={(fixture.state?.short_name || fixture.state?.name) || ''}>
            {(((fixture.state?.short_name || fixture.state?.name) || '') as string).toString().slice(0, 4)}
          </div>
        </div>

        {/* Teams (mobile stacked, desktop row) */}
        <div className="mt-2 grid grid-cols-3 items-center gap-2" style={{ minHeight: compact ? 0 : undefined }}>
          <div className="flex items-center gap-2 min-w-0" onClick={() => setShowH2H(true)}>
            {settings.showTeamImages && (
              <TeamLogo src={home?.image_path ?? undefined} alt={home?.name || 'Home'} className="rounded h-5 w-5" />
            )}
            <span className="font-medium truncate text-[12px] sm:text-[13px] text-gray-800">{home?.name || 'Home'}</span>
            </div>
          <div className="flex items-center justify-center gap-2">
            {scoreHome != null && scoreAway != null ? (
              <>
                <div className="text-lg font-bold text-blue-600 tabular-nums">{scoreHome}</div>
                <div className="text-xs text-gray-400">-</div>
                <div className="text-lg font-bold text-blue-600 tabular-nums">{scoreAway}</div>
              </>
            ) : (
              <div className="text-sm font-medium text-gray-700 tabular-nums">{formatTimeUTC(fixture.starting_at || '')}</div>
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0 justify-end" onClick={() => setShowH2H(true)}>
            <span className="font-medium truncate text-[12px] sm:text-[13px] text-right text-gray-800">{away?.name || 'Away'}</span>
            {settings.showTeamImages && (
              <TeamLogo src={away?.image_path ?? undefined} alt={away?.name || 'Away'} className="rounded h-5 w-5" />
            )}
          </div>
        </div>



        {/* Prediction markets - using the new component */}
        {fixture.predictions && fixture.predictions.length > 0 && (
          <FixturePredictionMarkets 
            predictions={fixture.predictions} 
            variant="mobile"
            className="mt-3"
          />
        )}

        {/* Expand details (placeholder for H2H etc.) */}
        <div className="mt-3">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded((v) => !v)}>
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" /> Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" /> Show details
              </>
            )}
          </Button>
          {expanded && (
            <div className="mt-2 border-t pt-3 text-xs text-gray-600 space-y-2">
              {fixture.venue?.name && (
                <div className="flex justify-between">
                  <span>Venue</span>
                  <span className="font-medium">{fixture.venue.name}</span>
                </div>
              )}
              {fixture.referee && (
                <div className="flex justify-between">
                  <span>Referee</span>
                  <span className="font-medium">Available</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {/* H2H modal */}
      {showH2H && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowH2H(false)}>
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b font-semibold">Head to Head</div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamLogo src={home?.image_path ?? undefined} alt={home?.name || 'Home'} className="rounded h-6 w-6" />
                  <span className="font-medium">{home?.name || 'Home'}</span>
                </div>
                <div className="text-gray-400">vs</div>
                <div className="flex items-center gap-2">
                  <TeamLogo src={away?.image_path ?? undefined} alt={away?.name || 'Away'} className="rounded h-6 w-6" />
                  <span className="font-medium">{away?.name || 'Away'}</span>
                </div>
              </div>
              <div className="text-gray-600">Head-to-head stats coming soon.</div>
            </div>
            <div className="p-3 border-t flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowH2H(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


