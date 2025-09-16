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
  Target,
  Calendar,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { FixtureCard } from '@/app/components/fixtures/FixtureCard';
import { generateCountrySlug, generateLeagueSlug } from '@/lib/utils/country-utils';
import { 
  DatePickerProvider, 
  EnhancedDatePicker, 
  useCountryDatePicker 
} from '@/app/components/date-picker';

interface CountryPredictionsClientProps {
  country: Country;
  leagues: League[];
  fixtures: Fixture[];
}

function CountryPredictionsContent({ 
  country, 
  leagues, 
  fixtures: initialFixtures
}: CountryPredictionsClientProps) {
  // All hooks must be called unconditionally at the top level
  const [expandedLeagues, setExpandedLeagues] = useState<Set<number>>(new Set());
  
  // Use the enhanced date picker hook - ALWAYS call this
  const datePickerResult = useCountryDatePicker({ 
    country, 
    initialDate: new Date().toISOString().split('T')[0],
    initialFixtures
  });

  // Destructure after the hook call to ensure consistent order
  const {
    selectedDate,
    fixtures,
    isLoading,
    error,
    selectDate,
    refreshFixtures,
  } = datePickerResult;

  // Use date-specific fixtures if available, otherwise use initial fixtures
  const currentFixtures = fixtures.length > 0 ? fixtures : initialFixtures;
  
  // Memoize the fixtures grouping - ALWAYS call this
  const currentFixturesByLeague = useMemo(() => {
    if (!currentFixtures || currentFixtures.length === 0) {
      return {} as Record<number, Fixture[]>;
    }
    
    const grouped = currentFixtures.reduce((acc, fixture) => {
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
  }, [currentFixtures]);

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
    return Object.values(currentFixturesByLeague).reduce((total, leagueFixtures) => total + leagueFixtures.length, 0);
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

             {/* Enhanced Date Picker */}
       <div className="mb-6">
         <EnhancedDatePicker
           onDateSelect={selectDate}
           variant="minimal"
           showStats={false}
           showQuickActions={false}
           maxPastDays={7}
           maxFutureDays={14}
           className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
         />
       </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-8 p-8">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Loading Fixtures...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Loading fixtures for {country.name} on {selectedDate}
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-8 p-8">
          <div className="text-center">
            <div className="w-16 h-16 text-red-400 mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Fixtures
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refreshFixtures} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      )}

             {/* Stats Cards */}
       <div className="grid md:grid-cols-3 gap-4 mb-6">
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <Trophy className="h-6 w-6 text-yellow-600" />
               <div>
                 <p className="text-xs text-gray-600 dark:text-gray-400">Active Leagues</p>
                 <p className="text-lg font-bold">{getActiveLeaguesCount()}</p>
               </div>
             </div>
           </CardContent>
         </Card>

         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <Calendar className="h-6 w-6 text-blue-600" />
               <div>
                 <p className="text-xs text-gray-600 dark:text-gray-400">
                   {selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : "Selected Date's"} Fixtures
                 </p>
                 <p className="text-lg font-bold">{getTotalFixturesCount()}</p>
               </div>
             </div>
           </CardContent>
         </Card>

         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <Target className="h-6 w-6 text-green-600" />
               <div>
                 <p className="text-xs text-gray-600 dark:text-gray-400">Total Leagues</p>
                 <p className="text-lg font-bold">{leagues.length}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>

             {/* Leagues Section */}
       <div className="space-y-4">
         <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
             Leagues & Fixtures
           </h2>
           <Link 
             href={`/predictions/country/${generateCountrySlug(country)}/all-fixtures?id=${country.id}&date=${selectedDate}`}
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
           <div className="space-y-3">
            {leagues.map((league) => {
              const leagueFixtures = currentFixturesByLeague[league.id] || [];
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
                                {leagueFixtures.length} fixture{leagueFixtures.length !== 1 ? 's' : ''} {selectedDate === new Date().toISOString().split('T')[0] ? 'today' : 'on selected date'}
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
                           href={`/predictions/league/${generateLeagueSlug(league)}?id=${league.id}`}
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

// Wrapper component that provides the DatePickerProvider
export function CountryPredictionsClient({ 
  country, 
  leagues, 
  fixtures 
}: CountryPredictionsClientProps) {
  return (
    <DatePickerProvider initialDate={new Date().toISOString().split('T')[0]}>
      <CountryPredictionsContent 
        country={country} 
        leagues={leagues} 
        fixtures={fixtures} 
      />
    </DatePickerProvider>
  );
}
