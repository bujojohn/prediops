'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Globe,
  Calendar,
  Target,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { FixtureList, type FixtureGroup } from '@/app/components/fixtures/FixtureList';
import { getCountryPredictionsUrl } from '@/lib/utils/country-utils';

interface AllFixturesClientProps {
  country: Country;
  leagues: League[];
  fixtures: Fixture[];
}

function groupByLeague(fixtures: Fixture[]): FixtureGroup[] {
  const map = new Map<string, Fixture[]>();
  for (const fixture of fixtures) {
    const leagueName = fixture.league?.name || 'Unknown League';
    const leagueId = fixture.league?.id?.toString() || 'unknown';
    const key = `${leagueName} (${leagueId})`;
    const arr = map.get(key) || [];
    arr.push(fixture);
    map.set(key, arr);
  }
  
  // Sort fixtures within each group by starting time
  const sortedGroups = Array.from(map.entries()).map(([title, fixtures]) => ({
    id: title,
    title,
    fixtures: fixtures.sort((a, b) => {
      const timeA = a.starting_at ? new Date(a.starting_at).getTime() : 0;
      const timeB = b.starting_at ? new Date(b.starting_at).getTime() : 0;
      return timeA - timeB;
    })
  }));

  // Sort groups by fixture count (most fixtures first)
  return sortedGroups.sort((a, b) => b.fixtures.length - a.fixtures.length);
}

export function AllFixturesClient({ 
  country, 
  leagues, 
  fixtures
}: AllFixturesClientProps) {
  const groups = useMemo(() => groupByLeague(fixtures), [fixtures]);

  const getActiveLeaguesCount = () => {
    return leagues.filter(league => league.active).length;
  };

  const getTotalFixturesCount = () => {
    return fixtures.length;
  };

  const getUpcomingFixturesCount = () => {
    const now = new Date();
    return fixtures.filter(fixture => {
      if (!fixture.starting_at) return false;
      return new Date(fixture.starting_at) > now;
    }).length;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={getCountryPredictionsUrl(country)}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Country
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          {country.image_path ? (
            <Image 
              src={country.image_path} 
              alt={country.name || 'Country flag'}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <Globe className="w-16 h-16 text-blue-600" />
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {country.name || 'Unknown Country'} - All Fixtures
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {getActiveLeaguesCount()} active leagues • {getTotalFixturesCount()} total fixtures • {getUpcomingFixturesCount()} upcoming
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Leagues</p>
                <p className="text-2xl font-bold">{getActiveLeaguesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Fixtures</p>
                <p className="text-2xl font-bold">{getTotalFixturesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold">{getUpcomingFixturesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next 7 Days</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixtures by League */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Fixtures by League
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {groups.length} leagues
            </Badge>
            <Badge variant="outline">
              {getTotalFixturesCount()} fixtures
            </Badge>
          </div>
        </div>

        {groups.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Fixtures Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No fixtures are currently available for {country.name} in the next 7 days.
              </p>
            </div>
          </Card>
        ) : (
          <FixtureList 
            groups={groups}
            compact={false}
            renderHeader={({ group, collapsed, toggle, count }) => (
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={toggle}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {collapsed ? (
                      <Trophy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    )}
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      {count}
                    </Button>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{group.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {count} fixtures
                  </Badge>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
