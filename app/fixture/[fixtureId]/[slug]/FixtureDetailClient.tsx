'use client';

import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Trophy,
  TrendingUp,
  Users,
  CloudSun,
  BarChart3,
  Target,
  Coins,
} from 'lucide-react';
import type { Fixture } from '@/schemas/fixture.schema';
import type { PlayerEvent } from '@/schemas/player-events.schema';
import type { Prediction } from '@/schemas/predictions.schema';
import type { Participant } from '@/schemas/participant.schema';
import { generateLeagueUrl } from '@/lib/utils/routing';
import { format } from 'date-fns';
import { FixtureMatchHeader } from './components/FixtureMatchHeader';
import { FixtureTimeline } from './components/FixtureTimeline';
import { FixtureStatistics } from './components/FixtureStatistics';
import { FixtureLineups } from './components/FixtureLineups';
import { FixturePredictions } from './components/FixturePredictions';
import { FixtureOdds } from './components/FixtureOdds';
import { FixtureWeather } from './components/FixtureWeather';
import { StandingsTable, formatStandingsMeta, type StandingsGroup } from '@/app/components/standings/StandingsTable';
import type { WeatherReport } from '@/schemas/weather-report.schema';
import type { Standing } from '@/schemas/standing.schema';

interface FixtureDetailClientProps {
  fixture: Fixture;
  statistics?: unknown;
  lineups?: unknown;
  odds?: unknown;
  weatherReport?: WeatherReport | null;
  standings?: unknown;
}

type TabType = 'overview' | 'statistics' | 'lineups' | 'weather' | 'predictions' | 'standings' | 'odds';

function TimelineSection({
  events,
  participants,
}: {
  events: PlayerEvent[];
  participants: Participant[] | null;
}): JSX.Element | null {
  if (!events.length) {
    return null;
  }

  return (
    <FixtureTimeline
      events={events}
      participants={participants}
    />
  );
}

export function FixtureDetailClient({
  fixture,
  statistics,
  lineups,
  odds,
  weatherReport,
  standings,
}: FixtureDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home');
  const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away');
  const league = fixture.league;
  const state = fixture.state;
  const fixtureEvents: PlayerEvent[] = Array.isArray(fixture.events)
    ? (fixture.events as PlayerEvent[])
    : [];
  const fixturePredictions: Prediction[] = Array.isArray(fixture.predictions)
    ? (fixture.predictions as Prediction[])
    : [];

  const timelineParticipants: Participant[] | null = Array.isArray(fixture.participants)
    ? fixture.participants
    : null;
  const hasStatistics = statistics != null;
  const lineupEntries = useMemo(() => extractLineupEntries(lineups), [lineups]);
  const hasLineups = lineupEntries.length > 0;
  const hasOdds = odds != null;
  const normalizedWeather = useMemo(() => extractWeatherReport(weatherReport), [weatherReport]);
  const hasWeather = normalizedWeather != null;
  const standingsGroups = useMemo(() => extractStandingGroups(standings), [standings]);
  const hasStandings = standingsGroups.length > 0;

  // Get current score
  let homeScore = 0;
  let awayScore = 0;
  if (fixture.scores && fixture.scores.length > 0) {
    const homeScoreData = fixture.scores.find(
      (score) => score.participant_id === homeTeam?.id && score.description === 'CURRENT'
    );
    const awayScoreData = fixture.scores.find(
      (score) => score.participant_id === awayTeam?.id && score.description === 'CURRENT'
    );
    homeScore = homeScoreData?.score?.goals ?? 0;
    awayScore = awayScoreData?.score?.goals ?? 0;
  }

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = useMemo(() => {
    const list: { id: TabType; label: string; icon: JSX.Element }[] = [
      { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    ];

    if (hasStatistics) {
      list.push({ id: 'statistics', label: 'Statistics', icon: <TrendingUp className="h-4 w-4" /> });
    }

    if (hasLineups) {
      list.push({ id: 'lineups', label: 'Lineups', icon: <Users className="h-4 w-4" /> });
    }

    if (hasWeather) {
      list.push({ id: 'weather', label: 'Weather', icon: <CloudSun className="h-4 w-4" /> });
    }

    list.push({ id: 'predictions', label: 'Predictions', icon: <Target className="h-4 w-4" /> });

    if (hasStandings) {
      list.push({ id: 'standings', label: 'Standings', icon: <Trophy className="h-4 w-4" /> });
    }

    list.push({ id: 'odds', label: 'Odds', icon: <Coins className="h-4 w-4" /> });

    return list;
  }, [hasStatistics, hasLineups, hasWeather, hasStandings]);

  const availableTabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);

  useEffect(() => {
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [availableTabIds, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Match Header */}
        <FixtureMatchHeader
          fixture={fixture}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          state={state}
          homeScore={homeScore}
          awayScore={awayScore}
        />

        {/* Match Info Bar */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {fixture.starting_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(fixture.starting_at), 'EEEE, MMMM d, yyyy')}</span>
              </div>
            )}
            {fixture.starting_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(fixture.starting_at), 'h:mm a')}</span>
              </div>
            )}
            {league && (
              <Link
                href={generateLeagueUrl(league)}
                className="flex items-center gap-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>{league.name}</span>
                {league.country?.name && (
                  <span className="text-gray-500">({league.country.name})</span>
                )}
              </Link>
            )}
            {fixture.venue?.name && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{fixture.venue.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Match Timeline */}
              <TimelineSection events={fixtureEvents} participants={timelineParticipants} />
              
              {/* Quick Stats */}
              {hasStatistics ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <FixtureStatistics statistics={statistics} fixture={fixture} compact />
                </div>
              ) : null}

              {/* Predictions Callout */}
              {hasWeather && normalizedWeather ? (
                <div className="rounded-lg border border-dashed border-border/60 p-6 dark:border-border/40">
                  <FixtureWeather weatherReport={normalizedWeather} />
                </div>
              ) : null}

              {fixturePredictions.length > 0 ? (
                <OverviewCallout
                  title="AI Predictions"
                  description="Detailed probability breakdowns are available for this match."
                  actionLabel="View predictions"
                  onAction={() => setActiveTab('predictions')}
                  meta={`${fixturePredictions.length} prediction markets`}
                />
              ) : null}

              {/* Odds Callout */}
              {hasOdds ? (
                <OverviewCallout
                  title="Pre-match Odds"
                  description="Compare bookmaker odds and implied probabilities across markets."
                  actionLabel="View odds"
                  onAction={() => setActiveTab('odds')}
                  meta={formatOddsMeta(odds)}
                />
              ) : null}

              {hasStandings ? (
                <OverviewCallout
                  title="Standings Snapshot"
                  description="See the latest table heading into this fixture."
                  actionLabel="View standings"
                  onAction={() => setActiveTab('standings')}
                  meta={formatStandingsMeta(standingsGroups)}
                />
              ) : null}
            </div>
          )}

          {activeTab === 'statistics' ? (
            hasStatistics ? (
              <FixtureStatistics statistics={statistics} fixture={fixture} />
            ) : null
          ) : null}

          {activeTab === 'lineups' ? (
            hasLineups ? (
              <FixtureLineups lineups={lineups} fixture={fixture} />
            ) : null
          ) : null}

          {activeTab === 'weather' ? (
            hasWeather && normalizedWeather ? (
              <FixtureWeather weatherReport={normalizedWeather} />
            ) : null
          ) : null}

          {activeTab === 'predictions' && (
            <FixturePredictions 
              predictions={fixturePredictions}
              fixture={fixture} 
            />
          )}

          {activeTab === 'standings' ? (
            hasStandings ? (
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-foreground">Standings</h3>
                <p className="text-sm text-muted-foreground">
                  Current table positions heading into this fixture.
                </p>
                <StandingsTable
                  groups={standingsGroups}
                  highlightParticipantIds={
                    timelineParticipants?.map((p) => p.id).filter((id): id is number => typeof id === 'number') ?? []
                  }
                  variant="compact"
                  showGroupLabels={true}
                  className="mt-6"
                  emptyState={{
                    title: 'Standings not available',
                    description: 'Standings data is not available for this competition.',
                  }}
                />
              </div>
            ) : null
          ) : null}

          {activeTab === 'odds' && (
            hasOdds ? <FixtureOdds odds={odds} /> : null
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewCallout({
  title,
  description,
  actionLabel,
  onAction,
  meta,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  meta?: string | null;
}): JSX.Element {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {meta ? <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{meta}</p> : null}
        </div>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function formatOddsMeta(odds: unknown): string | null {
  const summary = summarizeOdds(odds);
  if (!summary) {
    return null;
  }

  const parts: string[] = [];
  if (summary.bookmakers > 0) {
    parts.push(`${summary.bookmakers} bookmaker${summary.bookmakers > 1 ? 's' : ''}`);
  }
  if (summary.markets > 0) {
    parts.push(`${summary.markets} market${summary.markets > 1 ? 's' : ''}`);
  }

  return parts.length ? parts.join(' • ') : null;
}

function summarizeOdds(
  odds: unknown
): { bookmakers: number; markets: number } | null {
  const response = odds as {
    data?: Array<{
      bookmaker?: { name?: string | null } | null;
      market?: { name?: string | null } | null;
      name?: string | null;
    }>;
  } | null;
  const entries = response?.data;

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const bookmakerSet = new Set<string>();
  const marketSet = new Set<string>();

  entries.forEach((entry) => {
    const bookmakerName = entry.bookmaker?.name?.trim();
    if (bookmakerName) {
      bookmakerSet.add(bookmakerName);
    }

    const marketName = entry.market?.name?.trim() || entry.name?.toString()?.trim();
    if (marketName) {
      marketSet.add(marketName);
    }
  });

  return {
    bookmakers: bookmakerSet.size,
    markets: marketSet.size,
  };
}

function extractLineupEntries(rawLineups: unknown): unknown[] {
  if (!rawLineups) {
    return [];
  }

  if (Array.isArray(rawLineups)) {
    return rawLineups;
  }

  if (typeof rawLineups === 'object') {
    const obj = rawLineups as { data?: unknown };
    if (Array.isArray(obj.data)) {
      return obj.data;
    }

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as { data?: unknown };
      if (Array.isArray(nested.data)) {
        return nested.data;
      }
    }
  }

  return [];
}

function extractWeatherReport(raw: unknown): WeatherReport | null {
  if (!raw) {
    return null;
  }

  if (Array.isArray(raw)) {
    const first = raw.find((entry) => entry && typeof entry === 'object');
    return (first as WeatherReport) ?? null;
  }

  if (typeof raw === 'object') {
    const obj = raw as { data?: unknown };
    if (Array.isArray(obj.data)) {
      const first = obj.data.find((entry) => entry && typeof entry === 'object');
      return (first as WeatherReport) ?? null;
    }

    if (obj.data && typeof obj.data === 'object') {
      return extractWeatherReport(obj.data);
    }
  }

  return raw as WeatherReport;
}

function extractStandingGroups(raw: unknown): StandingsGroup[] {
  const groups: StandingsGroup[] = [];
  const visited = new WeakSet<object>();

  function collect(candidate: unknown, inheritedName: string | null = null) {
    if (candidate == null) return;

    if (Array.isArray(candidate)) {
      const standingEntries = candidate.filter(isStandingLike) as Standing[];
      if (standingEntries.length > 0) {
        groups.push({
          name: inheritedName,
          standings: standingEntries,
        });
        return;
      }

      candidate.forEach((item) => collect(item, inheritedName));
      return;
    }

    if (typeof candidate !== 'object') {
      return;
    }

    if (visited.has(candidate as object)) {
      return;
    }
    visited.add(candidate as object);

    const obj = candidate as Record<string, unknown>;
    const groupName =
      typeof obj.name === 'string' && obj.name.trim().length > 0
        ? obj.name
        : inheritedName;

    const standingsProp = obj.standings;
    if (Array.isArray(standingsProp) && standingsProp.some(isStandingLike)) {
      groups.push({
        name: groupName ?? null,
        standings: standingsProp.filter(isStandingLike) as Standing[],
      });
    } else if (standingsProp) {
      collect(standingsProp, groupName ?? null);
    }

    const dataProp = obj.data;
    if (dataProp !== undefined) {
      collect(dataProp, groupName ?? null);
    }

    const nestedCollections = [
      obj.groups,
      obj.group,
      obj.response,
      obj.results,
      obj.table,
      obj.league,
      obj.round,
    ];
    nestedCollections.forEach((nested) => collect(nested, groupName ?? null));
  }

  collect(raw, null);

  if (!groups.length) {
    return [];
  }

  const seen = new Set<string>();
  return groups.filter((group) => {
    const keyParts = [
      group.name ?? '',
      group.standings.length.toString(),
      group.standings
        .map((standing) =>
          standing.participant_id ?? standing.id ?? standing.participant?.id ?? ''
        )
        .join(','),
    ];
    const key = keyParts.join('|');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function isStandingLike(value: unknown): value is Standing {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const standing = value as Standing;
  return (
    typeof standing.position === 'number' ||
    typeof standing.points === 'number' ||
    typeof standing.participant_id === 'number' ||
    Boolean(standing.participant?.name) ||
    hasNameDetail(standing)
  );
}

function hasNameDetail(standing: Standing): boolean {
  if (!standing.details?.length) {
    return false;
  }

  return standing.details.some((detail) => {
    const rawType =
      detail.standing_type ??
      detail.type?.code ??
      detail.type?.name ??
      '';
    const normalized = typeof rawType === 'string' ? rawType.toLowerCase().replace(/\s+/g, '_') : '';
    return normalized.includes('name') && detail.value != null && String(detail.value).trim().length > 0;
  });
}


