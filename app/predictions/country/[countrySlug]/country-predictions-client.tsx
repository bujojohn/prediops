'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  ChevronRight, 
  ChevronDown,
  Globe,
  Target
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { FixtureCard } from '@/app/components/fixtures/FixtureCard';
import { getCountryPredictionsUrl, generateCountrySlug } from '@/lib/utils/country-utils';

interface CountryPredictionsClientProps {
  country: Country;
  leagues: League[];
  fixtures: Fixture[];
}

export function CountryPredictionsClient({ 
  country, 
  leagues, 
  fixtures
}: CountryPredictionsClientProps) {
  const [expandedLeagues, setExpandedLeagues] = useState<Set<number>>(new Set());

  // Group fixtures by league
  const fixturesByLeague = useMemo(() => {
    const grouped = fixtures.reduce((acc, fixture) => {
      const leagueId = (fixture as { league?: { id: number } }).league?.id;
      if (leagueId) {
        if (!acc[leagueId]) {
          acc[leagueId] = [];
        }
        acc[leagueId].push(fixture);
      }
      return acc;
    }, {} as Record<number, Fixture[]>);

    return grouped;
  }, [fixtures]);

  const toggleLeagueExpansion = (leagueId: number) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(leagueId)) {
      newExpanded.delete(leagueId);
    } else {
      newExpanded.add(leagueId);
    }
    setExpandedLeagues(newExpanded);
  };



  const getActiveLeaguesCount = () => {
    return leagues.filter(league => league.active).length;
  };

  const getTotalFixturesCount = () => {
    return Object.values(fixturesByLeague).reduce((total, leagueFixtures) => total + leagueFixtures.length, 0);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Country Header */}
      <div className="mb-8">
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
              {country.name || 'Unknown Country'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {getActiveLeaguesCount()} active leagues • {getTotalFixturesCount()} fixtures today
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Today&apos;s Fixtures</p>
                <p className="text-2xl font-bold">{getTotalFixturesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leagues</p>
                <p className="text-2xl font-bold">{leagues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leagues Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Leagues & Fixtures
          </h2>
          <Link 
            href={`/predictions/country/${generateCountrySlug(country)}/all-fixtures?id=${country.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Fixtures →
          </Link>
        </div>

        {leagues.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Leagues Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No leagues are currently available for {country.name}.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {leagues.map((league) => {
              const leagueFixtures = fixturesByLeague[league.id] || [];
              const isExpanded = expandedLeagues.has(league.id);
              const hasFixtures = leagueFixtures.length > 0;

              return (
                <Card key={league.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {league.image_path ? (
                          <Image 
                            src={league.image_path} 
                            alt={league.name || 'League logo'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <Trophy className="h-8 w-8 text-yellow-600" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{league.name || 'Unknown League'}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={league.active ? "default" : "secondary"}>
                              {league.active ? 'Active' : 'Inactive'}
                            </Badge>
                            {hasFixtures && (
                              <Badge variant="outline">
                                {leagueFixtures.length} fixtures today
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {hasFixtures && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLeagueExpansion(league.id)}
                            className="p-1"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                                                 <Link 
                           href={`/predictions/league/${league.id}`}
                         >
                          <Button variant="outline" size="sm">
                            View League
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && hasFixtures && (
                    <CardContent>
                      <div className="space-y-4">
                        {leagueFixtures.map((fixture) => (
                          <FixtureCard key={fixture.id} fixture={fixture} />
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
