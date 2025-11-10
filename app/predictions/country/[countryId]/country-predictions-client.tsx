'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Globe,
  Target,
  Calendar,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { generateLeagueSlug } from '@/lib/utils/slug-utils';
import { ReusableFixtureDisplay } from '@/app/components/fixtures/ReusableFixtureDisplay';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

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
  const searchParams = useSearchParams();
  
  // Get current date from URL or default to today
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  // Get active tab from hash or default to 'fixtures'
  const [activeTab, setActiveTab] = useState('fixtures');

  // Handle hash-based tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'fixtures';
      setActiveTab(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle tab change with hash update
  const handleTabChange = useCallback((value: string) => {
    window.location.hash = value;
    setActiveTab(value);
  }, []);

  // Handle date change with URL update
  const handleDateChange = useCallback((date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', date);
    window.history.pushState(null, '', `?${params.toString()}${window.location.hash}`);
  }, [searchParams]);

  // Refresh handler for reloading fixtures
  const handleRefresh = useCallback(() => {
    // Refresh the current page to reload fixtures
    window.location.reload();
  }, []);

  const getActiveLeaguesCount = () => {
    return leagues.filter(league => league.active).length;
  };

  const getTotalFixturesCount = () => {
    return initialFixtures.length;
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
              {getActiveLeaguesCount()} active leagues • {getTotalFixturesCount()} fixtures available
            </p>
          </div>
        </div>
      </div>

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
                <p className="text-xs text-gray-600 dark:text-gray-400">Available Fixtures</p>
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fixtures">
            <Calendar className="w-4 h-4 mr-2" />
            Fixtures
          </TabsTrigger>
          <TabsTrigger value="leagues">
            <Trophy className="w-4 h-4 mr-2" />
            Leagues
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures" className="space-y-4">
          <ReusableFixtureDisplay
            fixtures={initialFixtures}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onRefresh={handleRefresh}
            variant="league"
            showDateHeaders={true}
            showLeagueHeaders={true}
            showEmptyState={true}
            showSearchAndFilter={true}
            autoCollapseNonSelectedDates={true}
            searchAndFilterOptions={{
              showSearch: true,
              showLeagueFilter: true,
              showTeamFilter: true,
              showStatusFilter: true,
              showDateFilter: true,
              showPredictionsFilter: true,
              showValueBetsFilter: true,
            }}
            emptyStateTitle={`No Fixtures Found for ${country.name}`}
            emptyStateMessage={`No fixtures found for ${country.name}. Use the date filter above to search different time periods.`}
          />
        </TabsContent>

        {/* Leagues Tab */}
        <TabsContent value="leagues" className="space-y-4">
          <div className="grid gap-4">
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
              leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/predictions/league/${league.id}/${generateLeagueSlug(league)}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
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
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {league.name || 'Unknown League'}
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={league.active ? "default" : "secondary"}>
                                {league.active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline">
                                {league.type || 'League'}
                              </Badge>
                              {league.short_code && (
                                <Badge variant="outline" className="text-xs">
                                  {league.short_code}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  League Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Leagues</span>
                    <Badge variant="default">{getActiveLeaguesCount()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactive Leagues</span>
                    <Badge variant="secondary">{leagues.length - getActiveLeaguesCount()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Leagues</span>
                    <Badge variant="outline">{leagues.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Fixture Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available Fixtures</span>
                    <Badge variant="default">{getTotalFixturesCount()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Selected Date</span>
                    <Badge variant="outline">{selectedDate}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main component export
export function CountryPredictionsClient({ 
  country, 
  leagues, 
  fixtures 
}: CountryPredictionsClientProps) {
  return (
      <CountryPredictionsContent 
        country={country} 
        leagues={leagues} 
      fixtures={fixtures} 
      />
  );
}
