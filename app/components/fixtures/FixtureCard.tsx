"use client";

import { useEffect, useMemo, useState, useRef, useContext, memo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Fixture } from "@/schemas/fixture.schema";
import type { Prediction as FixturePrediction } from "@/schemas/predictions.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Trophy } from "lucide-react";
import { Info } from "lucide-react";
import { TeamLogo } from "@/app/components/ui/optimized-image";
import { cn, formatDateLocal, formatTimeLocal } from "@/lib/utils";
import { useDisplaySettings } from "@/app/contexts/DisplaySettingsContext";
import { useLiveScores } from "@/app/hooks/useLiveScores";
// import { useLiveMatches } from '@/lib/hooks/use-live-matches'; // Temporarily disabled
import { LoadingIndicator } from "@/app/components/ui/loading-indicator";
import { FixturesContext } from "@/app/contexts/FixturesContext";
import { useQuery } from "@tanstack/react-query";
import type { Odd } from "@/schemas/odds.schema";
// import { useHeadToHead } from "@/app/hooks/useHeadToHead";
// import H2HModal from "@/app/components/h2h/H2HModal";
import { useValueBet } from "@/app/hooks/useValueBet";
import ValueBetIcon, { type ValueBetState } from "@/app/components/valuebet/ValueBetIcon";
import { FixturePredictionMarkets } from "@/app/components/fixtures/FixturePredictionMarkets";

type MarketKey = string;

type MarketDefinition = {
  key: MarketKey;
  label: string;
  options: { code: string; value: number | null }[];
};

function isThreeWayPred(
  obj: unknown
): obj is { home?: number | null; away?: number | null; draw?: number | null } {
  return (
    !!obj &&
    typeof obj === "object" &&
    "home" in (obj as Record<string, unknown>) &&
    "away" in (obj as Record<string, unknown>) &&
    "draw" in (obj as Record<string, unknown>)
  );
}

function isYesNoPred(
  obj: unknown
): obj is { yes?: number | null; no?: number | null } {
  return (
    !!obj &&
    typeof obj === "object" &&
    "yes" in (obj as Record<string, unknown>) &&
    "no" in (obj as Record<string, unknown>)
  );
}

function isLiveMatch(fixture: Fixture): boolean {
  const status = fixture.state?.short_name?.toLowerCase() || "";
  const statusName = fixture.state?.name?.toLowerCase() || "";

  // Based on real API data: HT, 2nd, INPLAY_2ND_HALF, etc.
  const isLive =
    status === "live" ||
    status === "ht" ||
    status === "2nd" ||
    status === "2h" ||
    status === "1st" ||
    status.includes("inplay") ||
    statusName.includes("live") ||
    statusName.includes("half time") ||
    statusName.includes("second half") ||
    statusName.includes("2nd half") ||
    statusName.includes("first half") ||
    statusName.includes("1st half");

  // Debug logging for live match detection (commented out for production)
  // if (isLive) {
  //   console.log('Live match detected:', {
  //     fixtureId: fixture.id,
  //     status,
  //     statusName,
  //     isLive
  //   });
  // }

  return isLive;
}

// Helper function to get a more accurate match status display
function getMatchStatusDisplay(
  fixture: Fixture,
  liveScore?: { currentMinute?: number | null } | null
): string {
  try {
    const phase = getMatchPhase(fixture);
    const status = fixture.state?.short_name;

    if (phase === "live") {
      // Try to get minutes from the live scores data first
      let mins = liveScore?.currentMinute;

      // Fallback to local calculation if live scores don't have minutes
      if (mins === null || mins === undefined) {
        mins = getMinutesPlayed(fixture);
      }

      if (mins !== null && mins !== undefined) {
        // For 2nd half, show minutes with context
        if (status === "2H" || status === "2nd") {
          return `${mins}' (2nd Half)`;
        }
        // For half time, show HT
        if (status === "HT") {
          return "HT";
        }
        // For live matches, show minutes
        return `${mins}'`;
      }

      // Fallback: try to show some useful info even without minutes
      if (status === "2H" || status === "2nd") {
        return "2nd Half";
      }
      if (status === "HT") {
        return "HT";
      }

      // Final fallback for live matches without minutes
      return "Live";
    }

    if (phase === "scheduled") {
      return "Scheduled";
    }

    if (phase === "finished") {
      return status || "FT";
    }

    return status || "Unknown";
  } catch (error) {
    console.error("Error in getMatchStatusDisplay:", error);
    return "Live";
  }
}

function getMatchPhase(fixture: Fixture): "scheduled" | "live" | "finished" {
  try {
    const status = fixture.state?.short_name?.toLowerCase() || "";
    const statusName = fixture.state?.name?.toLowerCase() || "";

    // Debug logging for phase detection (commented out for production)
    // console.log('Phase detection for fixture', fixture.id, ':', {
    //   status,
    //   statusName,
    //   isLiveMatch: isLiveMatch(fixture)
    // });

    // Based on real API data: HT, 2nd, INPLAY_2ND_HALF, etc.
    if (
      /live|in progress|ht|2nd|2h|inplay|1st/.test(status) ||
      /live|in progress|half time|second half|2nd half|first half|1st half/.test(
        statusName
      )
    )
      return "live";
    if (/finished|ft|ended|suspended|cancelled/.test(status)) return "finished";
    return "scheduled";
  } catch (error) {
    console.error("Error in getMatchPhase:", error);
    return "scheduled";
  }
}

function getMinutesPlayed(fixture: Fixture): number | null {
  try {
    if (getMatchPhase(fixture) === "live" && fixture.starting_at) {
      // Handle both ISO format and "2025-08-26 18:45:00" format
      let start: Date;
      if (fixture.starting_at.includes("T")) {
        // ISO format: "2025-08-26T18:45:00Z"
        start = new Date(fixture.starting_at);
      } else {
        // API format: "2025-08-26 18:45:00"
        start = new Date(fixture.starting_at.replace(" ", "T") + "Z");
      }

      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 60000);

      // Debug logging for minute calculation (commented out for production)
      // console.log('Minute calculation for fixture', fixture.id, ':', {
      //   starting_at: fixture.starting_at,
      //   start: start.toISOString(),
      //   now: now.toISOString(),
      //   diff,
      //   status: fixture.state?.short_name,
      //   phase: getMatchPhase(fixture)
      // });

      // More realistic range: 0-120 minutes (2 hours max for a football match)
      // This prevents matches from getting stuck at unrealistic times
      if (diff >= 0 && diff <= 120) return diff;

      // If diff is negative (future match) or too high, return null
      return null;
    }
    return null;
  } catch (error) {
    console.error("Error calculating minutes for fixture:", fixture.id, error);
    return null;
  }
}

export const FixtureCard = memo(function FixtureCard({
  fixture: propFixture,
  compact = false,
}: {
  fixture: Fixture;
  compact?: boolean;
}) {
  // Use context if available, otherwise fallback to prop
  const context = useContext(FixturesContext);
  const fixture =
    context?.fixtures?.find((f) => f.id === propFixture.id) || propFixture;
  const [expanded, setExpanded] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [selectedMarketKey, setSelectedMarketKey] = useState<MarketKey | null>(
    null
  );
  // const [showH2H, setShowH2H] = useState(false);
  const { settings } = useDisplaySettings();
  const isLive = isLiveMatch(fixture);
  const { getLiveScore, isUpdating } = useLiveScores([fixture], isLive);
  // const { getLiveMatchData } = useLiveMatches([fixture]); // Temporarily disabled
  const [marketFilter, setMarketFilter] = useState("");
  const [showMorePopover, setShowMorePopover] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [showOdds, setShowOdds] = useState(false);
  // Odds modal UI state
  const [selectedOddsMarket, setSelectedOddsMarket] = useState<string | null>(
    null
  );
  const [oddsSearch, setOddsSearch] = useState<string>("");

  // Reusable renderer for odds modal content with tabs
  const renderOddsBody = () => {
    if (oddsLoading) {
      return (
        <div className="py-8 text-center text-gray-600">Loading odds…</div>
      );
    }
    if (oddsError) {
      return (
        <div className="py-8 text-center text-red-600">
          {oddsError instanceof Error ? oddsError.message : String(oddsError)}
        </div>
      );
    }
    if (!odds || odds.length === 0) {
      return (
        <div className="py-8 text-center text-gray-600">
          No odds available for this fixture.
        </div>
      );
    }

    const grouped = (odds || []).reduce(
      (acc: Record<string, Odd[]>, odd: Odd) => {
        const marketKey = odd?.market?.name || odd?.label || "Unknown Market";
        if (!acc[marketKey]) acc[marketKey] = [];
        acc[marketKey].push(odd);
        return acc;
      },
      {} as Record<string, Odd[]>
    );

    const allMarkets = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    const filteredMarkets = oddsSearch
      ? allMarkets.filter((m) =>
          m.toLowerCase().includes(oddsSearch.toLowerCase())
        )
      : allMarkets;

    const active =
      selectedOddsMarket && filteredMarkets.includes(selectedOddsMarket)
        ? selectedOddsMarket
        : filteredMarkets[0] || "";

    return (
      <Tabs
        value={active}
        onValueChange={setSelectedOddsMarket as unknown as (v: string) => void}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <input
              type="text"
              value={oddsSearch}
              onChange={(e) => setOddsSearch(e.target.value)}
              placeholder="Search markets"
              className="flex-1 px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
            />
          </div>
          <TabsList className="w-full overflow-x-auto no-scrollbar flex justify-start gap-1 p-2">
            {filteredMarkets.map((market) => (
              <TabsTrigger
                key={market}
                value={market}
                className="whitespace-nowrap text-xs"
              >
                {market}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {filteredMarkets.map((market) => {
            const sorted = [...(grouped[market] || [])].sort(
              (a: Odd, b: Odd) => {
                const aValue = parseFloat(String(a.value || 0));
                const bValue = parseFloat(String(b.value || 0));
                return aValue - bValue;
              }
            );
            return (
              <TabsContent key={market} value={market} className="m-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sorted.map((odd: Odd, idx: number) => {
                    const value = parseFloat(String(odd.value || 0));
                    const isBest = idx === 0;
                    return (
                      <div
                        key={`${odd.bookmaker?.name}-${odd.label}-${idx}`}
                        className={`px-4 py-3 flex items-center justify-between ${
                          isBest ? "bg-green-50 dark:bg-green-900/20" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {odd.label || "Selection"}
                            </span>
                            {isBest && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Best
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {odd.bookmaker?.name || "Unknown Bookmaker"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              isBest
                                ? "text-green-600 dark:text-green-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {odd.value || "-"}
                          </div>
                          {value > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {((1 / value) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    );
  };

  // Use React Query for odds fetching
  const {
    data: odds,
    isLoading: oddsLoading,
    error: oddsError,
  } = useQuery({
    queryKey: ["odds", fixture.id],
    queryFn: async () => {
      console.log(
        "Fetching odds from:",
        `/api/sportmonks/odds/fixtures/${fixture.id}`
      );
      const res = await fetch(`/api/sportmonks/odds/fixtures/${fixture.id}`);
      console.log("Odds API response status:", res.status);
      const data = await res.json();
      console.log("Odds API response data:", data);
      if (!data?.success)
        throw new Error(data?.message || "Failed to load odds");
      return data.data || [];
    },
    enabled: showOdds, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMorePopover]);

  // React Query automatically handles odds fetching when showOdds is true

  const participantsArray = useMemo(
    () => (Array.isArray(fixture.participants) ? fixture.participants : []),
    [fixture.participants]
  );
  const scoresArray = useMemo(
    () => (Array.isArray(fixture.scores) ? fixture.scores : []),
    [fixture.scores]
  );

  const home = useMemo(
    () => participantsArray.find((p) => p.meta?.location === "home"),
    [participantsArray]
  );
  const away = useMemo(
    () => participantsArray.find((p) => p.meta?.location === "away"),
    [participantsArray]
  );

  // H2H React Query (disabled until endpoint access)
  // const { data: h2hData, isLoading: h2hLoading, error: h2hError } = useHeadToHead({
  //   team1Id: home?.id,
  //   team2Id: away?.id,
  //   enabled: showH2H,
  // });

  // ValueBet React Query
  const { data: valueBetData, isLoading: valueBetLoading, error: valueBetError } = useValueBet({
    fixtureId: fixture.id,
    enabled: true,
  });

  // Determine ValueBet state and extract data
  const { valueBetState, valueBetInfo } = useMemo(() => {
    if (valueBetLoading) return { valueBetState: "loading" as ValueBetState, valueBetInfo: undefined };
    if (valueBetError) return { valueBetState: "error" as ValueBetState, valueBetInfo: undefined };
    if (!valueBetData?.success || !valueBetData.data?.data?.length) {
      return { valueBetState: "unavailable" as ValueBetState, valueBetInfo: undefined };
    }
    
    const valueBets = valueBetData.data.data;
    const valueBetItems = valueBets.filter(vb => vb.predictions.is_value);
    const hasValueBet = valueBetItems.length > 0;
    
    if (hasValueBet) {
      const bestValueBet = valueBetItems.reduce((best, current) => 
        current.predictions.odd > best.predictions.odd ? current : best
      );
      
      return {
        valueBetState: "value" as ValueBetState,
        valueBetInfo: {
          count: valueBetItems.length,
          bestOdd: bestValueBet.predictions.odd,
          fairOdd: bestValueBet.predictions.fair_odd,
          bookmaker: bestValueBet.predictions.bookmaker,
          betName: bestValueBet.predictions.bet,
        }
      };
    }
    
    return { valueBetState: "no-value" as ValueBetState, valueBetInfo: undefined };
  }, [valueBetLoading, valueBetError, valueBetData]);

  const liveScore = getLiveScore(fixture.id);
  
  // Helper function to get the most appropriate score based on match state
  const getScoreForParticipant = useCallback((participant: "home" | "away", scores: typeof scoresArray) => {
    if (!scores || scores.length === 0) return null;
    
    // For finished matches, prioritize FT (Full Time) scores
    if (fixture.state?.short_name === "FT" || fixture.state?.short_name === "AET" || fixture.state?.short_name === "PEN") {
      const ftScore = scores.find(s => 
        s.score?.participant === participant && 
        s.description === "FT"
      );
      if (ftScore?.score?.goals !== null && ftScore?.score?.goals !== undefined) {
        return ftScore.score.goals;
      }
    }
    
    // For live matches, prioritize CURRENT scores
    if (fixture.state?.short_name === "LIVE" || fixture.state?.short_name === "2H") {
      const currentScore = scores.find(s => 
        s.score?.participant === participant && 
        s.description === "CURRENT"
      );
      if (currentScore?.score?.goals !== null && currentScore?.score?.goals !== undefined) {
        return currentScore.score.goals;
      }
    }
    
    // For half-time, prioritize HT scores
    if (fixture.state?.short_name === "HT") {
      const htScore = scores.find(s => 
        s.score?.participant === participant && 
        s.description === "HT"
      );
      if (htScore?.score?.goals !== null && htScore?.score?.goals !== undefined) {
        return htScore.score.goals;
      }
    }
    
    // Fallback: get the most recent score (highest goals count, or last entry)
    const participantScores = scores
      .filter(s => s.score?.participant === participant && s.score?.goals !== null && s.score?.goals !== undefined)
      .sort((a, b) => (b.score?.goals || 0) - (a.score?.goals || 0));
    
    return participantScores[0]?.score?.goals ?? null;
  }, [fixture.state?.short_name]);
  
  const scoreHome = useMemo(
    () =>
      liveScore?.homeScore ??
      getScoreForParticipant("home", scoresArray),
    [scoresArray, liveScore?.homeScore, getScoreForParticipant]
  );
  const scoreAway = useMemo(
    () =>
      liveScore?.awayScore ??
      getScoreForParticipant("away", scoresArray),
    [scoresArray, liveScore?.awayScore, getScoreForParticipant]
  );

  const marketsMap: Record<string, MarketDefinition> | null = useMemo(() => {
    if (!fixture.predictions || fixture.predictions.length === 0) return null;
    const map = {} as Record<string, MarketDefinition>;

    // Process all prediction types
    fixture.predictions.forEach((prediction: FixturePrediction) => {
      const pred = prediction.predictions;
      // Handle case where type might be null, undefined, or have different structure
      const typeName = prediction.type?.name?.toLowerCase() || "";
      const typeCode = prediction.type?.code?.toLowerCase() || "";

      // 1X2 Market (Full Time Result)
      if (
        isThreeWayPred(pred) &&
        (typeName.includes("fulltime") ||
          typeName.includes("fulltime result") ||
          typeCode.includes("fulltime-result"))
      ) {
        map["1x2"] = {
          key: "1x2",
          label: prediction.type?.name || "Full Time Result (1 X 2)",
          options: [
            { code: "1", value: pred.home ?? null },
            { code: "X", value: pred.draw ?? null },
            { code: "2", value: pred.away ?? null },
          ],
        };
      }

      // First Half Winner
      else if (
        isThreeWayPred(pred) &&
        (typeName.includes("first half") ||
          typeCode.includes("first-half-winner"))
      ) {
        map["firsthalf"] = {
          key: "firsthalf",
          label: prediction.type?.name || "First Half Winner",
          options: [
            { code: "1", value: pred.home ?? null },
            { code: "X", value: pred.draw ?? null },
            { code: "2", value: pred.away ?? null },
          ],
        };
      }

      // Team To Score First
      else if (
        isThreeWayPred(pred) &&
        (typeName.includes("score first") ||
          typeCode.includes("team_to_score_first"))
      ) {
        map["teamscorefirst"] = {
          key: "teamscorefirst",
          label: prediction.type?.name || "Team To Score First",
          options: [
            { code: "1", value: pred.home ?? null },
            { code: "X", value: pred.draw ?? null },
            { code: "2", value: pred.away ?? null },
          ],
        };
      }

      // Both Teams To Score
      else if (
        isYesNoPred(pred) &&
        (typeName.includes("both teams to score") ||
          typeCode.includes("both-teams-to-score"))
      ) {
        map["btts"] = {
          key: "btts",
          label: prediction.type?.name || "Both Teams To Score",
          options: [
            { code: "Yes", value: pred.yes ?? null },
            { code: "No", value: pred.no ?? null },
          ],
        };
      }

      // Over/Under Markets (General) - Use unique keys for multiple markets
      else if (
        isYesNoPred(pred) &&
        (typeName.includes("over/under") || typeCode.includes("over-under")) &&
        !typeName.includes("corners") &&
        !typeName.includes("home") &&
        !typeName.includes("away") &&
        !typeCode.includes("corners") &&
        !typeCode.includes("home") &&
        !typeCode.includes("away")
      ) {
        const overUnderValue =
          typeCode.match(/over-under-(\d+(?:\.\d+)?)/)?.[1] || "";
        const key = `overunder_${overUnderValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Over/Under ${overUnderValue}`,
          options: [
            { code: "Over", value: pred.yes ?? null },
            { code: "Under", value: pred.no ?? null },
          ],
        };
      }

      // Home Over/Under Markets - Use unique keys for multiple markets
      else if (
        isYesNoPred(pred) &&
        (typeName.includes("home over/under") ||
          typeCode.includes("home-over-under"))
      ) {
        const overUnderValue =
          typeCode.match(/home-over-under-(\d+(?:\.\d+)?)/)?.[1] || "";
        const key = `homeoverunder_${overUnderValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Home Over/Under ${overUnderValue}`,
          options: [
            { code: "Over", value: pred.yes ?? null },
            { code: "Under", value: pred.no ?? null },
          ],
        };
      }

      // Away Over/Under Markets - Use unique keys for multiple markets
      else if (
        isYesNoPred(pred) &&
        (typeName.includes("away over/under") ||
          typeCode.includes("away-over-under"))
      ) {
        const overUnderValue =
          typeCode.match(/away-over-under-(\d+(?:\.\d+)?)/)?.[1] || "";
        const key = `awayoverunder_${overUnderValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Away Over/Under ${overUnderValue}`,
          options: [
            { code: "Over", value: pred.yes ?? null },
            { code: "Under", value: pred.no ?? null },
          ],
        };
      }

      // Corners Over/Under Markets - Use unique keys for multiple markets
      else if (
        isYesNoPred(pred) &&
        (typeName.includes("corners over/under") ||
          typeCode.includes("corners-over-under"))
      ) {
        const cornersValue =
          typeCode.match(/corners-over-under-(\d+(?:\.\d+)?)/)?.[1] || "";
        const key = `corners_${cornersValue}`;
        map[key] = {
          key,
          label: prediction.type?.name || `Corners Over/Under ${cornersValue}`,
          options: [
            { code: "Over", value: pred.yes ?? null },
            { code: "Under", value: pred.no ?? null },
          ],
        };
      }

      // Half Time / Full Time Market
      else if (
        pred &&
        typeof pred === "object" &&
        "home_home" in pred &&
        (typeName.includes("half time/full time") ||
          typeCode.includes("half-time-full-time"))
      ) {
        const htft = pred as Record<string, number | null>;
        map["htft"] = {
          key: "htft",
          label: prediction.type?.name || "Half Time / Full Time",
          options: [
            { code: "1/1", value: htft.home_home ?? null },
            { code: "1/X", value: htft.home_draw ?? null },
            { code: "1/2", value: htft.home_away ?? null },
            { code: "X/1", value: htft.draw_home ?? null },
            { code: "X/X", value: htft.draw_draw ?? null },
            { code: "X/2", value: htft.draw_away ?? null },
            { code: "2/1", value: htft.away_home ?? null },
            { code: "2/X", value: htft.away_draw ?? null },
            { code: "2/2", value: htft.away_away ?? null },
          ],
        };
      }

      // Double Chance Market
      else if (
        pred &&
        typeof pred === "object" &&
        "draw_home" in pred &&
        (typeName.includes("double chance") ||
          typeCode.includes("double_chance"))
      ) {
        const doubleChance = pred as Record<string, number | null>;
        map["doublechance"] = {
          key: "doublechance",
          label: prediction.type?.name || "Double Chance",
          options: [
            { code: "1X", value: doubleChance.draw_home ?? null },
            { code: "12", value: doubleChance.home_away ?? null },
            { code: "X2", value: doubleChance.draw_away ?? null },
          ],
        };
      }

      // Correct Score Market
      else if (
        pred &&
        typeof pred === "object" &&
        "scores" in pred &&
        (typeName.includes("correct score") ||
          typeCode.includes("correct-score"))
      ) {
        const scorePred = pred as { scores: Record<string, number | null> };
        if (scorePred.scores) {
          const scoreOptions = [];
          // Add common score combinations
          const commonScores = [
            "0-0",
            "1-0",
            "1-1",
            "2-0",
            "2-1",
            "2-2",
            "3-0",
            "3-1",
            "3-2",
            "3-3",
          ];
          commonScores.forEach((score) => {
            if (scorePred.scores[score] !== undefined) {
              scoreOptions.push({
                code: score,
                value: scorePred.scores[score] ?? null,
              });
            }
          });
          // Add other options if they exist
          if (scorePred.scores.Other_1 !== undefined) {
            scoreOptions.push({
              code: "Other 1",
              value: scorePred.scores.Other_1 ?? null,
            });
          }
          if (scorePred.scores.Other_2 !== undefined) {
            scoreOptions.push({
              code: "Other 2",
              value: scorePred.scores.Other_2 ?? null,
            });
          }
          if (scorePred.scores.Other_X !== undefined) {
            scoreOptions.push({
              code: "Other X",
              value: scorePred.scores.Other_X ?? null,
            });
          }

          if (scoreOptions.length > 0) {
            map["correctscore"] = {
              key: "correctscore",
              label: prediction.type?.name || "Correct Score",
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
            { code: "Yes", value: pred.yes ?? null },
            { code: "No", value: pred.no ?? null },
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
            { code: "1", value: pred.home ?? null },
            { code: "X", value: pred.draw ?? null },
            { code: "2", value: pred.away ?? null },
          ],
        };
      }
    });

    // Debug: Log detected markets
    if (Object.keys(map).length > 0) {
      console.log(
        "Detected markets for fixture",
        fixture.id,
        ":",
        Object.keys(map)
      );
      console.log("Market count:", Object.keys(map).length);
      console.log(
        "Available predictions:",
        fixture.predictions?.map((p) => ({
          typeId: p.type_id,
          type: p.type,
          hasThreeWay: isThreeWayPred(p.predictions),
          hasYesNo: isYesNoPred(p.predictions),
          predictions: p.predictions,
        }))
      );
    } else {
      console.log("No markets detected for fixture", fixture.id);
      console.log("Raw predictions:", fixture.predictions);
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
    const preferred = marketKeys.find(
      (key) =>
        key === "1x2" ||
        key === "firsthalf" ||
        key === "teamscorefirst" ||
        key === "btts" ||
        key.startsWith("overunder_") ||
        key === "htft" ||
        key === "correctscore" ||
        key === "doublechance" ||
        key.startsWith("corners_") ||
        key.startsWith("homeoverunder_") ||
        key.startsWith("awayoverunder_") ||
        key.startsWith("yesno_") ||
        key.startsWith("threeway_")
    );

    // If no preferred market found, select the first available market
    if (!preferred && marketKeys.length > 0) {
      console.log(
        "No preferred market found, selecting first available:",
        marketKeys[0]
      );
      setSelectedMarketKey(marketKeys[0]);
    } else {
      console.log("Selected preferred market:", preferred);
      setSelectedMarketKey(preferred || null);
    }
  }, [marketsMap]);

  // Desktop layout (≥640px) - matches the image design
  if (!compact) {
    return (
      <>
        <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-3">
            <div
              className="grid grid-cols-12 gap-2 items-center group"
              style={{ minHeight: "60px" }}
            >
              {/* Column 1: Status/Time */}
              <div className="col-span-2 flex flex-col justify-center">
                {(() => {
                  const phase = getMatchPhase(fixture);

                  if (phase === "live") {
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {(() => {
                            try {
                              const liveScoreData = liveScore
                                ? { currentMinute: liveScore.currentMinute }
                                : null;
                              const status = getMatchStatusDisplay(
                                fixture,
                                liveScoreData
                              );
                              return status;
                            } catch (error) {
                              console.error(
                                "Error in getMatchStatusDisplay:",
                                error
                              );
                              return "Live";
                            }
                          })()}
                        </span>
                      </div>
                    );
                  }
                  if (phase === "scheduled" && fixture.starting_at) {
                    return (
                      <div className="flex items-center gap-1 text-xs">
                        <span>{formatTimeLocal(fixture.starting_at || "")}</span>
                      </div>
                    );
                  }
                  if (fixture.state?.short_name) {
                    return (
                      <div
                        className="flex items-center gap-1"
                        title={fixture.state.name || fixture.state.short_name}
                      >
                        <span className="text-xs font-medium text-gray-500">
                          {fixture.state.short_name}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Column 2: Teams */}
              <div className="col-span-2 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                  {settings.showTeamImages && (
                    <TeamLogo
                      src={home?.image_path ?? undefined}
                      alt={home?.name || "Home"}
                      className="rounded h-4 w-4"
                    />
                  )}
                  <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">
                    {home?.name || "Home"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {settings.showTeamImages && (
                    <TeamLogo
                      src={away?.image_path ?? undefined}
                      alt={away?.name || "Away"}
                      className="rounded h-4 w-4"
                    />
                  )}
                  <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">
                    {away?.name || "Away"}
                  </span>
                </div>
              </div>

              {/* Column 3: Scores */}
              <div className="col-span-1 flex flex-col justify-center gap-1">
                {isLive && isUpdating ? (
                  <LoadingIndicator size="sm" text="Updating..." />
                ) : (
                  <>
                    <div className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {scoreHome !== null && scoreHome !== undefined ? scoreHome : "-"}
                    </div>
                    <div className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {scoreAway !== null && scoreAway !== undefined ? scoreAway : "-"}
                    </div>
                  </>
                )}
              </div>

              {/* Odds button and ValueBet icon positioned below scores */}
              <div className="col-span-2 mt-2 flex justify-center items-center gap-2">
                <ValueBetIcon 
                  state={valueBetState} 
                  size="sm" 
                  showGlow={valueBetState === "value"}
                  valueBetData={valueBetInfo}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-3 text-[11px]"
                  onClick={() => setShowOdds(true)}
                >
                  <Info className="h-3 w-3 mr-1" /> Odds
                </Button>
              </div>

              {/* Column 4: Prediction Probabilities */}
              <div className="col-span-4 flex flex-col justify-center">
                <FixturePredictionMarkets
                  predictions={fixture.predictions || []}
                  variant="desktop"
                  className="w-full"
                  fixture={fixture}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Odds Modal */}
        {showOdds && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowOdds(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-md shadow-xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-between">
                <span>Pre-match Odds</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOdds(false)}
                >
                  Close
                </Button>
              </div>
              <div className="p-4 text-sm">{renderOddsBody()}</div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Mobile layout (compact) - existing design
  return (
    <>
      <Card className="w-full">
        <CardContent className="py-2">
          {/* Header: state/time on left, date on right (mobile spec simplified) */}
          <div className="flex items-center justify-between text-[12px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span className="tabular-nums">
                {formatTimeLocal(fixture.starting_at || "")}
              </span>
            </div>
            {fixture.starting_at && (
              <span className="hidden sm:inline">
                {formatDateLocal(fixture.starting_at || "")}
              </span>
            )}
          </div>

          {/* Teams (mobile stacked, desktop row) */}
          <div
            className="mt-2 grid grid-cols-3 items-center gap-2"
            style={{ minHeight: compact ? 0 : undefined }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {settings.showTeamImages && (
                <TeamLogo
                  src={home?.image_path ?? undefined}
                  alt={home?.name || "Home"}
                  className="rounded h-5 w-5"
                />
              )}
              <span className="font-medium truncate text-[12px] sm:text-[13px] text-gray-800">
                {home?.name || "Home"}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {scoreHome !== null && scoreHome !== undefined && scoreAway !== null && scoreAway !== undefined ? (
                <>
                  <div className="text-lg font-bold text-blue-600 tabular-nums">
                    {scoreHome}
                  </div>
                  <div className="text-xs text-gray-400">-</div>
                  <div className="text-lg font-bold text-blue-600 tabular-nums">
                    {scoreAway}
                  </div>
                </>
              ) : (
                <div className="text-sm font-medium text-gray-700 tabular-nums">
                  {formatTimeLocal(fixture.starting_at || "")}
                </div>
              )}
              <ValueBetIcon 
                state={valueBetState} 
                size="sm" 
                showGlow={valueBetState === "value"}
                valueBetData={valueBetInfo}
              />
            </div>
            <div className="flex items-center gap-2 min-w-0 justify-end">
              <span className="font-medium truncate text-[12px] sm:text-[13px] text-right text-gray-800">
                {away?.name || "Away"}
              </span>
              {settings.showTeamImages && (
                <TeamLogo
                  src={away?.image_path ?? undefined}
                  alt={away?.name || "Away"}
                  className="rounded h-5 w-5"
                />
              )}
            </div>
          </div>

          {/* League */}
          {fixture.league?.name && (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-600">
              <Trophy className="h-3 w-3" />
              <span className="truncate">
                {fixture.league?.country?.name
                  ? `${fixture.league.country.name} - ${fixture.league.name}`
                  : fixture.league.name}
              </span>
            </div>
          )}

          {/* Prediction markets - always show for predictions page */}
          {marketsMap && selectedMarketKey && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  {marketsMap?.[selectedMarketKey!]?.label ||
                    "No predictions available"}
                </div>
                {(() => {
                  const marketCount = marketsMap
                    ? Object.keys(marketsMap).length
                    : 0;
                  console.log("Mobile dropdown condition check:", {
                    marketsMap: !!marketsMap,
                    marketCount,
                    shouldShow: marketCount > 1,
                  });
                  return marketsMap && marketCount > 1;
                })() && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setMarketOpen((v) => !v)}
                    >
                      More
                      <ChevronDown
                        className={cn(
                          "ml-1 h-3 w-3 transition-transform",
                          marketOpen && "rotate-180"
                        )}
                      />
                    </Button>
                    {marketOpen && (
                      <div className="absolute right-0 mt-1 w-60 max-h-60 rounded-md border bg-white shadow-md z-10 overflow-y-auto">
                        <div className="p-2 border-b border-gray-100">
                          <input
                            type="text"
                            value={marketFilter}
                            onChange={(e) => setMarketFilter(e.target.value)}
                            placeholder="Search markets..."
                            className="w-full px-2 py-1 text-xs rounded bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none"
                          />
                        </div>
                        {Object.values(marketsMap)
                          .filter((m) =>
                            m.label
                              .toLowerCase()
                              .includes(marketFilter.toLowerCase())
                          )
                          .map((m) => (
                            <button
                              type="button"
                              key={m.key}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm hover:bg-gray-50",
                                selectedMarketKey === m.key && "bg-gray-50"
                              )}
                              onClick={() => {
                                setSelectedMarketKey(m.key);
                                setMarketOpen(false);
                              }}
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
                  const market =
                    selectedMarketKey && marketsMap
                      ? marketsMap[selectedMarketKey]
                      : null;
                  return market?.options?.map((opt) => (
                    <div
                      key={opt.code}
                      className="bg-gray-50 rounded-md p-2 text-center border"
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        {opt.code}
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {opt.value != null
                          ? `${Number(opt.value).toFixed(1)}%`
                          : "-"}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Expand details (placeholder for H2H etc.) */}
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setExpanded((v) => !v)}
            >
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
        {/* H2H modal (disabled until endpoint access) */}
        {/* <H2HModal
          open={showH2H}
          onClose={() => setShowH2H(false)}
          team1Name={home?.name}
          team2Name={away?.name}
          isLoading={h2hLoading}
          error={h2hError ? (h2hError instanceof Error ? h2hError.message : String(h2hError)) : null}
          fixtures={h2hData?.data || []}
          onViewFull={undefined}
        /> */}
      </Card>
      {showOdds && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowOdds(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-md shadow-xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-between">
              <span>Pre-match Odds</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOdds(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 text-sm">{renderOddsBody()}</div>
          </div>
        </div>
      )}
    </>
  );
});
