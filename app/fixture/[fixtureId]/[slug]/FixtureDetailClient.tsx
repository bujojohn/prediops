'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Trophy,
  TrendingUp,
  Users,
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

interface FixtureDetailClientProps {
  fixture: Fixture;
  statistics?: unknown;
  lineups?: unknown;
  odds?: unknown;
}

type TabType = 'overview' | 'statistics' | 'lineups' | 'predictions' | 'odds';

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
  const hasLineups = lineups != null;
  const hasOdds = odds != null;

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

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'statistics', label: 'Statistics', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'lineups', label: 'Lineups', icon: <Users className="h-4 w-4" /> },
    { id: 'predictions', label: 'Predictions', icon: <Target className="h-4 w-4" /> },
    { id: 'odds', label: 'Odds', icon: <Coins className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

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

          {activeTab === 'predictions' && (
            <FixturePredictions 
              predictions={fixturePredictions}
              fixture={fixture} 
            />
          )}

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


