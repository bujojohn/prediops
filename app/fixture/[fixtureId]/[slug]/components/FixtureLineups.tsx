'use client';

/* eslint-disable @next/next/no-img-element */

import type { JSX } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

interface FixtureLineupsProps {
  lineups: unknown;
  fixture: Fixture;
}

export function FixtureLineups({ lineups, fixture }: FixtureLineupsProps): JSX.Element {
  // Parse lineups data structure from SportMonks API
  const lineupsData = lineups as {
    data?: Array<{
      participant_id?: number;
      formation?: { name?: string };
      lineups?: Array<{
        player?: { name?: string; image_path?: string };
        position?: { name?: string };
        jersey_number?: number;
      }>;
    }>;
  } | null;

  if (!lineupsData?.data || lineupsData.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Lineups</h3>
        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
          Lineups not available yet
        </p>
      </div>
    );
  }

  const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home');
  const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away');

  const homeLineup = lineupsData.data.find(l => l.participant_id === homeTeam?.id);
  const awayLineup = lineupsData.data.find(l => l.participant_id === awayTeam?.id);

  const renderLineup = (lineup: typeof homeLineup) => {
    if (!lineup?.lineups || lineup.lineups.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Lineup not available
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lineup.formation?.name && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Formation: {lineup.formation.name}
          </div>
        )}
        <div className="space-y-2">
          {lineup.lineups.map((player, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {player.player?.image_path && (
                <img
                  src={player.player.image_path}
                  alt={player.player.name || 'Player'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {player.jersey_number && (
                    <span className="text-gray-500 dark:text-gray-400 mr-2">
                      #{player.jersey_number}
                    </span>
                  )}
                  {player.player?.name || 'Unknown Player'}
                </div>
                {player.position?.name && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {player.position.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6">Lineups</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Home Team */}
        <div>
          <h4 className="text-base font-semibold mb-4 text-orange-600 dark:text-orange-400">
            {homeTeam?.name || 'Home Team'}
          </h4>
          {renderLineup(homeLineup)}
        </div>

        {/* Away Team */}
        <div>
          <h4 className="text-base font-semibold mb-4 text-blue-600 dark:text-blue-400">
            {awayTeam?.name || 'Away Team'}
          </h4>
          {renderLineup(awayLineup)}
        </div>
      </div>
    </div>
  );
}


