'use client';

/* eslint-disable @next/next/no-img-element */

import type { JSX } from 'react';
import Link from 'next/link';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Participant } from '@/schemas/participant.schema';
import { generateTeamUrl } from '@/lib/utils/routing';

type FixtureParticipant = Participant;

interface FixtureMatchHeaderProps {
  fixture: Fixture;
  homeTeam?: FixtureParticipant;
  awayTeam?: FixtureParticipant;
  state?: Fixture['state'] | null;
  homeScore: number;
  awayScore: number;
}

export function FixtureMatchHeader({
  fixture,
  homeTeam,
  awayTeam,
  state,
  homeScore,
  awayScore,
}: FixtureMatchHeaderProps): JSX.Element {
  const stateName = state?.name?.toLowerCase() || '';
  const isLive = stateName === 'inprogress' || stateName === 'live' || stateName === 'paused';
  const isFinished = stateName === 'finished' || stateName === 'ft' || stateName === 'full time';
  const isUpcoming = !isLive && !isFinished;

  // Get current minute if live
  const activePeriod = fixture.periods?.find((period) => period?.ticking);
  const currentMinute = isLive
    ? activePeriod?.minutes != null
      ? `${activePeriod.minutes}'`
      : activePeriod?.description || null
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Live Indicator */}
      {isLive && (
        <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE {currentMinute && `- ${currentMinute}`}
        </div>
      )}

      {/* Match Content */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-right">
            <Link
              href={homeTeam ? generateTeamUrl(homeTeam) : '#'}
              className="block hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <div className="text-xl sm:text-2xl font-bold mb-2">
                {homeTeam?.name || 'Team 1'}
              </div>
              {homeTeam?.image_path && (
                <img
                  src={homeTeam.image_path}
                  alt={homeTeam.name || 'Home team'}
                  className="h-16 w-16 mx-auto object-contain"
                />
              )}
            </Link>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 px-4 sm:px-8">
            <div className="text-center">
              {(isLive || isFinished) && (
                <div className="text-4xl sm:text-5xl font-bold mb-2">
                  {homeScore} - {awayScore}
                </div>
              )}
              {isUpcoming && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  VS
                </div>
              )}
              {state?.name && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {state.name}
                </div>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-left">
            <Link
              href={awayTeam ? generateTeamUrl(awayTeam) : '#'}
              className="block hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <div className="text-xl sm:text-2xl font-bold mb-2">
                {awayTeam?.name || 'Team 2'}
              </div>
              {awayTeam?.image_path && (
                <img
                  src={awayTeam.image_path}
                  alt={awayTeam.name || 'Away team'}
                  className="h-16 w-16 mx-auto object-contain"
                />
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


