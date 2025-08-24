'use client';

import { useEffect, useMemo, useState, useRef, useContext } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Prediction as FixturePrediction } from '@/schemas/predictions.schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Trophy } from 'lucide-react';
import { TeamLogo } from '@/app/components/ui/optimized-image';
import { cn, formatDateUTC, formatTimeUTC } from '@/lib/utils';
import { useDisplaySettings } from '@/app/contexts/DisplaySettingsContext';
import { useLiveScores } from '@/app/hooks/useLiveScores';
// import { useLiveMatches } from '@/lib/hooks/use-live-matches'; // Temporarily disabled
import { LoadingIndicator } from '@/app/components/ui/loading-indicator';
import { FixturesContext } from '@/app/contexts/FixturesContext';

type MarketKey = string;

type MarketDefinition = {
  key: MarketKey;
  label: string;
  options: { code: string; value: number | null }[];
};

function isThreeWayPred(obj: unknown): obj is { home?: number | null; away?: number | null; draw?: number | null } {
  return !!obj && typeof obj === 'object' && 'home' in (obj as Record<string, unknown>) && 'away' in (obj as Record<string, unknown>) && 'draw' in (obj as Record<string, unknown>);
}

function isYesNoPred(obj: unknown): obj is { yes?: number | null; no?: number | null } {
  return !!obj && typeof obj === 'object' && 'yes' in (obj as Record<string, unknown>) && 'no' in (obj as Record<string, unknown>);
}



function isLiveMatch(fixture: Fixture): boolean {
  const status = fixture.state?.short_name?.toLowerCase() || '';
  const statusName = fixture.state?.name?.toLowerCase() || '';
  
  // Based on real API data: HT, 2nd, INPLAY_2ND_HALF, etc.
  return status === 'live' || 
         status === 'ht' || 
         status === '2nd' || 
         status === '2h' ||
         status.includes('inplay') ||
         statusName.includes('live') ||
         statusName.includes('half time') ||
         statusName.includes('second half') ||
         statusName.includes('2nd half');
}

// Helper function to get a more accurate match status display
function getMatchStatusDisplay(fixture: Fixture, liveScore?: { currentMinute?: number | null } | null): string {
  try {
    const phase = getMatchPhase(fixture);
    const status = fixture.state?.short_name;
    
    if (phase === 'live') {
      // Try to get minutes from the live scores data first
      let mins = liveScore?.currentMinute;
      
      // Fallback to local calculation if live scores don't have minutes
      if (mins === null || mins === undefined) {
        mins = getMinutesPlayed(fixture);
      }
      
      if (mins !== null && mins !== undefined) {
        // For 2nd half, show minutes with context
        if (status === '2H' || status === '2nd') {
          return `${mins}' (2nd Half)`;
        }
        // For half time, show HT
        if (status === 'HT') {
          return 'HT';
        }
        // For live matches, show minutes
        return `${mins}'`;
      }
      
      // Fallback: try to show some useful info even without minutes
      if (status === '2H' || status === '2nd') {
        return '2nd Half';
      }
      if (status === 'HT') {
        return 'HT';
      }
      
      // Final fallback for live matches without minutes
      return 'Live';
    }
    
    if (phase === 'scheduled') {
      return 'Scheduled';
    }
    
    if (phase === 'finished') {
      return status || 'FT';
    }
    
    return status || 'Unknown';
  } catch (error) {
    console.error('Error in getMatchStatusDisplay:', error);
    return 'Live';
  }
}

function getMatchPhase(fixture: Fixture): 'scheduled' | 'live' | 'finished' {
  try {
    const status = fixture.state?.short_name?.toLowerCase() || '';
    const statusName = fixture.state?.name?.toLowerCase() || '';
    
    // Based on real API data: HT, 2nd, INPLAY_2ND_HALF, etc.
    if (/live|in progress|ht|2nd|2h|inplay/.test(status) || 
        /live|in progress|half time|second half|2nd half/.test(statusName)) return 'live';
    if (/finished|ft|ended|suspended|cancelled/.test(status)) return 'finished';
    return 'scheduled';
  } catch (error) {
    console.error('Error in getMatchPhase:', error);
    return 'scheduled';
  }
}

function getMinutesPlayed(fixture: Fixture): number | null {
  try {
    if (getMatchPhase(fixture) === 'live' && fixture.starting_at) {
      // Handle both ISO format and "2025-08-26 18:45:00" format
      let start: Date;
      if (fixture.starting_at.includes('T')) {
        // ISO format: "2025-08-26T18:45:00Z"
        start = new Date(fixture.starting_at);
      } else {
        // API format: "2025-08-26 18:45:00"
        start = new Date(fixture.starting_at.replace(' ', 'T') + 'Z');
      }
      
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
      
      // More realistic range: 0-120 minutes (2 hours max for a football match)
      // This prevents matches from getting stuck at unrealistic times
      if (diff >= 0 && diff <= 120) return diff;
      
      // If diff is negative (future match) or too high, return null
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error calculating minutes for fixture:', fixture.id, error);
    return null;
  }
}

export function FixtureCard({ fixture: propFixture, compact = false }: { fixture: Fixture; compact?: boolean }) {
  // Use context if available, otherwise fallback to prop
  const context = useContext(FixturesContext);
  const fixture = context?.fixtures?.find(f => f.id === propFixture.id) || propFixture;
  const [expanded, setExpanded] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [selectedMarketKey, setSelectedMarketKey] = useState<MarketKey | null>(null);
  const [showH2H, setShowH2H] = useState(false);
  const { settings } = useDisplaySettings();
  const isLive = isLiveMatch(fixture);
  const { getLiveScore, isUpdating } = useLiveScores([fixture], isLive);
  // const { getLiveMatchData } = useLiveMatches([fixture]); // Temporarily disabled
  const [marketFilter, setMarketFilter] = useState('');
  const [showMorePopover, setShowMorePopover] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!showMorePopover) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        moreBtnRef.current &&
        !moreBtnRef.current.contains(e.target as Node)
      ) {
        setShowMorePopover(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMorePopover]);

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



  const marketsMap: Record<string, MarketDefinition> | null = useMemo(() => {
    if (!fixture.predictions || fixture.predictions.length === 0) return null;
    const map = {} as Record<string, MarketDefinition>;
    
    // Process all prediction types
    fixture.predictions.forEach((prediction: FixturePrediction) => {
      const pred = prediction.predictions;
      // Handle case where type might be null, undefined, or have different structure
      const typeName = prediction.type?.name?.toLowerCase() || '';
      const typeCode = prediction.type?.code?.toLowerCase() || '';
      
      // 1X2 Market (Full Time Result)
      if (isThreeWayPred(pred) && (typeName.includes('fulltime') || typeName.includes('fulltime result') || typeCode.includes('fulltime-result'))) {
              map['1x2'] = {
          key: '1x2',
          label: prediction.type?.name || 'Full Time Result (1 X 2)',
          options: [
            { code: '1', value: pred.home ?? null },
            { code: 'X', value: pred.draw ?? null },
            { code: '2', value: pred.away ?? null },
          ],
        };
      }
      
      // First Half Winner
      else if (isThreeWayPred(pred) && (typeName.includes('first half') || typeCode.includes('first-half-winner'))) {
        map['firsthalf'] = {
          key: 'firsthalf',
          label: prediction.type?.name || 'First Half Winner',
          options: [
            { code: '1', value: pred.home ?? null },
            { code: 'X', value: pred.draw ?? null },
            { code: '2', value: pred.away ?? null },
          ],
        };
      }
      
      // Team To Score First
      else if (isThreeWayPred(pred) && (typeName.includes('score first') || typeCode.includes('team_to_score_first'))) {
        map['teamscorefirst'] = {
          key: 'teamscorefirst',
          label: prediction.type?.name || 'Team To Score First',
          options: [
            { code: '1', value: pred.home ?? null },
            { code: 'X', value: pred.draw ?? null },
            { code: '2', value: pred.away ?? null },
          ],
        };
      }
      
      // Both Teams To Score
      else if (isYesNoPred(pred) && (typeName.includes('both teams to score') || typeCode.includes('both-teams-to-score'))) {
        map['btts'] = {
          key: 'btts',
          label: prediction.type?.name || 'Both Teams To Score',
          options: [
            { code: 'Yes', value: pred.yes ?? null },
            { code: 'No', value: pred.no ?? null },
          ],
        };
      }
      
      // Over/Under Markets (General) - Use unique keys for multiple markets
      else if (isYesNoPred(pred) && (typeName.includes('over/under') || typeCode.includes('over-under')) && !typeName.includes('corners') && !typeName.includes('home') && !typeName.includes('away') && !typeCode.includes('corners') && !typeCode.includes('home') && !typeCode.includes('away')) {
        const overUnderValue = typeCode.match(/over-under-(\d+(?:\.\d+)?)/)?.[1] || '';
        const key = `overunder_${overUnderValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Over/Under ${overUnderValue}`,
          options: [
            { code: 'Over', value: pred.yes ?? null },
            { code: 'Under', value: pred.no ?? null },
          ],
        };
      }
      
      // Home Over/Under Markets - Use unique keys for multiple markets
      else if (isYesNoPred(pred) && (typeName.includes('home over/under') || typeCode.includes('home-over-under'))) {
        const overUnderValue = typeCode.match(/home-over-under-(\d+(?:\.\d+)?)/)?.[1] || '';
        const key = `homeoverunder_${overUnderValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Home Over/Under ${overUnderValue}`,
          options: [
            { code: 'Over', value: pred.yes ?? null },
            { code: 'Under', value: pred.no ?? null },
          ],
        };
      }
      
      // Away Over/Under Markets - Use unique keys for multiple markets
      else if (isYesNoPred(pred) && (typeName.includes('away over/under') || typeCode.includes('away-over-under'))) {
        const overUnderValue = typeCode.match(/away-over-under-(\d+(?:\.\d+)?)/)?.[1] || '';
        const key = `awayoverunder_${overUnderValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Away Over/Under ${overUnderValue}`,
          options: [
            { code: 'Over', value: pred.yes ?? null },
            { code: 'Under', value: pred.no ?? null },
          ],
        };
      }
      
      // Corners Over/Under Markets - Use unique keys for multiple markets
      else if (isYesNoPred(pred) && (typeName.includes('corners over/under') || typeCode.includes('corners-over-under'))) {
        const cornersValue = typeCode.match(/corners-over-under-(\d+(?:\.\d+)?)/)?.[1] || '';
        const key = `corners_${cornersValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Corners Over/Under ${cornersValue}`,
          options: [
            { code: 'Over', value: pred.yes ?? null },
            { code: 'Under', value: pred.no ?? null },
          ],
        };
      }
      
      // Half Time / Full Time Market
      else if (pred && typeof pred === 'object' && 'home_home' in pred && (typeName.includes('half time/full time') || typeCode.includes('half-time-full-time'))) {
        const htft = pred as Record<string, number | null>;
        map['htft'] = {
          key: 'htft',
          label: prediction.type?.name || 'Half Time / Full Time',
          options: [
            { code: '1/1', value: htft.home_home ?? null },
            { code: '1/X', value: htft.home_draw ?? null },
            { code: '1/2', value: htft.home_away ?? null },
            { code: 'X/1', value: htft.draw_home ?? null },
            { code: 'X/X', value: htft.draw_draw ?? null },
            { code: 'X/2', value: htft.draw_away ?? null },
            { code: '2/1', value: htft.away_home ?? null },
            { code: '2/X', value: htft.away_draw ?? null },
            { code: '2/2', value: htft.away_away ?? null },
          ],
        };
      }
      
      // Double Chance Market
      else if (pred && typeof pred === 'object' && 'draw_home' in pred && (typeName.includes('double chance') || typeCode.includes('double_chance'))) {
        const doubleChance = pred as Record<string, number | null>;
        map['doublechance'] = {
          key: 'doublechance',
          label: prediction.type?.name || 'Double Chance',
        options: [
            { code: '1X', value: doubleChance.draw_home ?? null },
            { code: '12', value: doubleChance.home_away ?? null },
            { code: 'X2', value: doubleChance.draw_away ?? null },
        ],
      };
    }
      
      // Correct Score Market
      else if (pred && typeof pred === 'object' && 'scores' in pred && (typeName.includes('correct score') || typeCode.includes('correct-score'))) {
        const scorePred = pred as { scores: Record<string, number | null> };
        if (scorePred.scores) {
          const scoreOptions = [];
          // Add common score combinations
          const commonScores = ['0-0', '1-0', '1-1', '2-0', '2-1', '2-2', '3-0', '3-1', '3-2', '3-3'];
          commonScores.forEach(score => {
            if (scorePred.scores[score] !== undefined) {
              scoreOptions.push({ code: score, value: scorePred.scores[score] ?? null });
            }
          });
          // Add other options if they exist
          if (scorePred.scores.Other_1 !== undefined) {
            scoreOptions.push({ code: 'Other 1', value: scorePred.scores.Other_1 ?? null });
          }
          if (scorePred.scores.Other_2 !== undefined) {
            scoreOptions.push({ code: 'Other 2', value: scorePred.scores.Other_2 ?? null });
          }
          if (scorePred.scores.Other_X !== undefined) {
            scoreOptions.push({ code: 'Other X', value: scorePred.scores.Other_X ?? null });
          }
          
          if (scoreOptions.length > 0) {
            map['correctscore'] = {
              key: 'correctscore',
              label: prediction.type?.name || 'Correct Score',
              options: scoreOptions,
            };
          }
        }
      }
      
      // Generic Yes/No Market (fallback)
      else if (isYesNoPred(pred)) {
        // Use type_id to create a unique key for this market
        const marketKey = `yesno_${prediction.type_id}`;
        map[marketKey] = {
          key: marketKey,
          label: prediction.type?.name || `Yes/No (${prediction.type_id})`,
          options: [
            { code: 'Yes', value: pred.yes ?? null },
            { code: 'No', value: pred.no ?? null },
          ],
        };
      }
      
      // Three-way market fallback (when type info is missing)
      else if (isThreeWayPred(pred)) {
        const marketKey = `threeway_${prediction.type_id}`;
        map[marketKey] = {
          key: marketKey,
          label: prediction.type?.name || `Three Way (${prediction.type_id})`,
          options: [
            { code: '1', value: pred.home ?? null },
            { code: 'X', value: pred.draw ?? null },
            { code: '2', value: pred.away ?? null },
          ],
        };
      }
    });
    
    // Debug: Log detected markets
          if (Object.keys(map).length > 0) {
        console.log('Detected markets for fixture', fixture.id, ':', Object.keys(map));
        console.log('Market count:', Object.keys(map).length);
        console.log('Available predictions:', fixture.predictions?.map(p => ({
          typeId: p.type_id,
          type: p.type,
          hasThreeWay: isThreeWayPred(p.predictions),
          hasYesNo: isYesNoPred(p.predictions),
          predictions: p.predictions
        })));
      } else {
        console.log('No markets detected for fixture', fixture.id);
        console.log('Raw predictions:', fixture.predictions);
      }
    
    return Object.keys(map).length > 0 ? map : null;
  }, [fixture.predictions, fixture.id]);

  useEffect(() => {
    if (!marketsMap) {
      setSelectedMarketKey(null);
      return;
    }
    
    // Market priority: 1x2 > firsthalf > teamscorefirst > btts > overunder > htft > correctscore > doublechance > corners > homeoverunder > awayoverunder > yesno
    const marketKeys = Object.keys(marketsMap);
    
    // Find preferred market by priority
    const preferred = marketKeys.find(key => 
      key === '1x2' || 
      key === 'firsthalf' || 
      key === 'teamscorefirst' || 
      key === 'btts' || 
      key.startsWith('overunder_') || 
      key === 'htft' || 
      key === 'correctscore' || 
      key === 'doublechance' || 
      key.startsWith('corners_') || 
      key.startsWith('homeoverunder_') || 
      key.startsWith('awayoverunder_') || 
      key.startsWith('yesno_') ||
      key.startsWith('threeway_')
    );
    
    // If no preferred market found, select the first available market
    if (!preferred && marketKeys.length > 0) {
      console.log('No preferred market found, selecting first available:', marketKeys[0]);
      setSelectedMarketKey(marketKeys[0]);
    } else {
      console.log('Selected preferred market:', preferred);
      setSelectedMarketKey(preferred || null);
    }
  }, [marketsMap]);

  // Desktop layout (≥640px) - matches the image design
  if (!compact) {
           return (
           <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-4 items-center" style={{ minHeight: '60px' }}>
            {/* Column 1: Status/Time */}
            <div className="flex flex-col justify-center">
              {(() => {
                const phase = getMatchPhase(fixture);
                if (phase === 'live') {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {(() => {
                          try {
                            return getMatchStatusDisplay(fixture, liveScore);
                          } catch (error) {
                            console.error('Error in getMatchStatusDisplay:', error);
                            return 'Live';
                          }
                        })()}
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
              {/* Only show state name for non-live matches to avoid confusion */}
              {fixture.state?.name && 
               fixture.state.name !== 'Not Started' && 
               getMatchPhase(fixture) !== 'live' && (
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
                     {marketsMap && selectedMarketKey && (
                <div className="space-y-1">
                                           {/* Market description */}
                         <div className="text-[12px] text-gray-700 dark:text-gray-300 truncate">
                           {marketsMap?.[selectedMarketKey!]?.label || 'No predictions available'}
                         </div>
                  
                  {/* Prediction buttons with market selector */}
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1 flex-1 relative">
                      {(() => {
                        const market = (selectedMarketKey && marketsMap) ? marketsMap[selectedMarketKey] : null;
                        const options = market?.options || [];
                        
                        // For markets with many options (like Correct Score), show top 3 + expand option
                        if (options.length > 6) {
                          const topOptions = options
                            .filter(opt => opt.value !== null)
                            .sort((a, b) => (b.value || 0) - (a.value || 0))
                            .slice(0, 3);
                          const restOptions = options
                            .filter(opt => opt.value !== null)
                            .sort((a, b) => (b.value || 0) - (a.value || 0))
                            .slice(3);
                          return (
                            <>
                              {topOptions.map((opt) => (
                                <Button
                                  key={opt.code}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-[12px] min-w-0 flex-1"
                                  aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                                >
                                  <span className="font-medium">{opt.code}</span>
                                  <span className="ml-1 text-blue-600">
                                    {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                                  </span>
                                </Button>
                              ))}
                              <Button
                                ref={moreBtnRef}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[12px] relative"
                                onClick={() => setShowMorePopover((v) => !v)}
                                aria-label="Show more options"
                              >
                                +{options.length - 3} more
                              </Button>
                              {showMorePopover && (
                                <div
                                  ref={popoverRef}
                                  className="absolute top-full right-0 z-50 w-56 max-h-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-2 overflow-y-auto"
                                >
                                  <div className="grid grid-cols-3 gap-1">
                                    {restOptions.map((opt) => (
                                      <Button
                                        key={opt.code}
                                        variant="outline"
                                        size="sm"
                                        className="h-6 px-1 text-[10px]"
                                        aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                                      >
                                        <span className="font-medium">{opt.code}</span>
                                        <span className="ml-1 text-blue-600">
                                          {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                                        </span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        }
                        
                        // For markets with 6 or fewer options, show all
                        return options.map((opt) => (
                          <Button
                            key={opt.code}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[12px] min-w-0 flex-1"
                            aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                          >
                            <span className="font-medium">{opt.code}</span>
                            <span className="ml-1 text-blue-600">
                              {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                            </span>
                          </Button>
                        ));
                      })()}
                                         </div>

                     {/* Expanded options view for markets with many options */}
                     {expanded && (() => {
                       const market = (selectedMarketKey && marketsMap) ? marketsMap[selectedMarketKey] : null;
                       const options = market?.options || [];
                       
                       if (options.length > 6) {
                         return (
                           <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                             <div className="grid grid-cols-3 gap-1">
                               {options.map((opt) => (
                                 <Button
                                   key={opt.code}
                                   variant="outline"
                                   size="sm"
                                   className="h-6 px-1 text-[10px]"
                                   aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                                 >
                                   <span className="font-medium">{opt.code}</span>
                                   <span className="ml-1 text-blue-600">
                                     {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                                   </span>
                                 </Button>
                               ))}
                             </div>
                           </div>
                         );
                       }
                       return null;
                     })()}

                                                 {/* Market selector dropdown */}
                           {(() => {
                             const marketCount = marketsMap ? Object.keys(marketsMap).length : 0;
                             console.log('Desktop dropdown condition check:', { marketsMap: !!marketsMap, marketCount, shouldShow: marketCount > 1 });
                             return marketsMap && marketCount > 1;
                           })() && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setMarketOpen((v) => !v)}
                          aria-label="Select prediction market"
                          aria-expanded={marketOpen}
                        >
                                                           <ChevronDown className={cn('h-3 w-3 text-gray-700 dark:text-gray-300 transition-transform', marketOpen && 'rotate-180')} />
                        </Button>
                        {marketOpen && (
                                                             <div className="absolute right-0 mt-1 w-60 max-h-60 rounded-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-md z-10 overflow-y-auto">
                                     <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                       <input
                                         type="text"
                                         value={marketFilter}
                                         onChange={e => setMarketFilter(e.target.value)}
                                         placeholder="Search markets..."
                                         className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none"
                                       />
                                     </div>
                                     {Object.values(marketsMap)
                                       .filter(m => m.label.toLowerCase().includes(marketFilter.toLowerCase()))
                                       .map((m) => (
                                         <button
                                           type="button"
                                           key={m.key}
                                           className={cn('w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100', selectedMarketKey === m.key && 'bg-gray-50 dark:bg-gray-700')}
                                onClick={() => { setSelectedMarketKey(m.key); setMarketOpen(false); }}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
      <CardContent className="py-2"> 
        {/* Header: state/time on left, date on right (mobile spec simplified) */}
        <div className="flex items-center justify-between text-[12px] text-gray-600">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span className="tabular-nums">{formatTimeUTC(fixture.starting_at || '')}</span>
          </div>
          {fixture.starting_at && (
            <span className="hidden sm:inline">{formatDateUTC(fixture.starting_at || '')}</span>
          )}
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

        {/* League */}
        {fixture.league?.name && (
          <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-600">
            <Trophy className="h-3 w-3" />
            <span className="truncate">
              {fixture.league?.country?.name ? `${fixture.league.country.name} - ${fixture.league.name}` : fixture.league.name}
            </span>
          </div>
        )}

        {/* Prediction markets - always show for predictions page */}
                       {marketsMap && selectedMarketKey && (
          <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                                 {marketsMap?.[selectedMarketKey!]?.label || 'No predictions available'}
            </div>
              {(() => {
                const marketCount = marketsMap ? Object.keys(marketsMap).length : 0;
                console.log('Mobile dropdown condition check:', { marketsMap: !!marketsMap, marketCount, shouldShow: marketCount > 1 });
                return marketsMap && marketCount > 1;
              })() && (
              <div className="relative">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setMarketOpen((v) => !v)}>
                    More
                    <ChevronDown className={cn('ml-1 h-3 w-3 transition-transform', marketOpen && 'rotate-180')} />
                </Button>
                {marketOpen && (
                    <div className="absolute right-0 mt-1 w-60 max-h-60 rounded-md border bg-white shadow-md z-10 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={marketFilter}
                        onChange={e => setMarketFilter(e.target.value)}
                        placeholder="Search markets..."
                        className="w-full px-2 py-1 text-xs rounded bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none"
                      />
                    </div>
                    {Object.values(marketsMap)
                      .filter(m => m.label.toLowerCase().includes(marketFilter.toLowerCase()))
                      .map((m) => (
                        <button
                          type="button"
                          key={m.key}
                          className={cn('w-full text-left px-3 py-2 text-sm hover:bg-gray-50', selectedMarketKey === m.key && 'bg-gray-50')}
                          onClick={() => { setSelectedMarketKey(m.key); setMarketOpen(false); }}
                        >
                          {m.label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Prediction options in a compact grid layout */}
            <div className="grid grid-cols-3 gap-2">
            {(() => {
                               const market = (selectedMarketKey && marketsMap) ? marketsMap[selectedMarketKey] : null;
              return market?.options?.map((opt) => (
                  <div key={opt.code} className="bg-gray-50 rounded-md p-2 text-center border">
                    <div className="text-xs text-gray-600 mb-1">{opt.code}</div>
                    <div className="text-sm font-semibold text-blue-600">
                      {opt.value != null ? `${Number(opt.value).toFixed(1)}%` : '-'}
                    </div>
                  </div>
              ));
            })()}
          </div>
        </div>
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

