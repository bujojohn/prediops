'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Calendar, 
  Globe,
  Target,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { FixtureCard } from '@/app/components/fixtures/FixtureCard';

interface LeaguePredictionsClientProps {
  league: League;
  fixtures: Fixture[];
}

export function LeaguePredictionsClient({ 
  league, 
  fixtures 
}: LeaguePredictionsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Group fixtures by date
  const fixturesByDate = useMemo(() => {
    const grouped = fixtures.reduce((acc, fixture) => {
      const date = fixture.starting_at ? new Date(fixture.starting_at).toISOString().split('T')[0] : 'unknown';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(fixture);
      return acc;
    }, {} as Record<string, Fixture[]>);

    // Sort fixtures within each date by starting time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.starting_at ? new Date(a.starting_at).getTime() : 0;
        const timeB = b.starting_at ? new Date(b.starting_at).getTime() : 0;
        return timeA - timeB;
      });
    });

    return grouped;
  }, [fixtures]);

  const getLiveFixturesCount = () => {
    return fixtures.filter(fixture => {
      const status = fixture.state?.short_name?.toLowerCase() || '';
      return status === 'live' || status === 'ht' || status === '2nd' || status.includes('inplay');
    }).length;
  };

  const getUpcomingFixturesCount = () => {
    return fixtures.filter(fixture => {
      const status = fixture.state?.short_name?.toLowerCase() || '';
      return status === 'ns' || status === 'scheduled';
    }).length;
  };

  const getFinishedFixturesCount = () => {
    return fixtures.filter(fixture => {
      const status = fixture.state?.short_name?.toLowerCase() || '';
      return status === 'ft' || status === 'finished';
    }).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* League Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {league.image_path ? (
            <Image 
              src={league.image_path} 
              alt={league.name || 'League logo'}
              width={64}
              height={64}
              className="w-16 h-16 rounded object-cover"
            />
          ) : (
            <Trophy className="w-16 h-16 text-yellow-600" />
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {league.name || 'Unknown League'}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {league.country && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {league.country.name}
                  </span>
                </div>
              )}
              <Badge variant={league.active ? "default" : "secondary"}>
                {league.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Fixtures</p>
                <p className="text-2xl font-bold">{fixtures.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live Matches</p>
                <p className="text-2xl font-bold">{getLiveFixturesCount()}</p>
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
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Finished</p>
                <p className="text-2xl font-bold">{getFinishedFixturesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixtures Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Fixtures & Predictions
          </h2>
          {league.country && (
            <Link 
              href={`/predictions/country/${league.country.name?.toLowerCase().replace(/\s+/g, '-')}?id=${league.country.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All {league.country.name} Leagues →
            </Link>
          )}
        </div>

        {fixtures.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Fixtures Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No fixtures are scheduled for today in {league.name}.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(fixturesByDate).map(([date, dateFixtures]) => (
              <Card key={date} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {formatDate(date)}
                    </CardTitle>
                    <Badge variant="outline">
                      {dateFixtures.length} fixture{dateFixtures.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {dateFixtures.map((fixture) => (
                      <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
