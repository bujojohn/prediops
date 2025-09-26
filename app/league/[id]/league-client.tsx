'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, BarChart3, Target } from 'lucide-react';
import { LeagueFixturesDisplay } from '@/app/components/league/LeagueFixturesDisplay';
import { LoadingButton } from '@/app/components/ui/loading-button';
import { NavigationFeedback } from '@/app/components/ui/navigation-feedback';

interface LeagueClientProps {
  league: {
    id: number;
    name: string;
    country: string;
    season: string;
    image_path: string;
    fixture_count: number;
    team_count: number;
  };
}

export function LeagueClient({ league }: LeagueClientProps) {
  const [activeTab, setActiveTab] = useState('fixtures');

  const handleTabChange = useCallback(async (value: string) => {
    if (value === activeTab) return;
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setActiveTab(value);
  }, [activeTab]);

  const handleRefresh = useCallback(async () => {
    // Simulate refresh action
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      {/* League Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Trophy className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
            <p className="text-gray-600">{league.country} • {league.season}</p>
          </div>
          <div className="ml-auto">
            <LoadingButton
              onClick={handleRefresh}
              loadingText="Refreshing..."
              variant="outline"
              size="sm"
            >
              Refresh Data
            </LoadingButton>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{league.fixture_count} fixtures</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>{league.team_count} teams</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <NavigationFeedback
            onClick={() => handleTabChange('fixtures')}
            className="w-full"
          >
            <TabsTrigger value="fixtures" className="flex items-center gap-2 w-full">
              <Calendar className="h-4 w-4" />
              Fixtures
            </TabsTrigger>
          </NavigationFeedback>
          
          <NavigationFeedback
            onClick={() => handleTabChange('standings')}
            className="w-full"
          >
            <TabsTrigger value="standings" className="flex items-center gap-2 w-full">
              <BarChart3 className="h-4 w-4" />
              Standings
            </TabsTrigger>
          </NavigationFeedback>
          
          <NavigationFeedback
            onClick={() => handleTabChange('predictions')}
            className="w-full"
          >
            <TabsTrigger value="predictions" className="flex items-center gap-2 w-full">
              <Target className="h-4 w-4" />
              Predictions
            </TabsTrigger>
          </NavigationFeedback>
          
          <NavigationFeedback
            onClick={() => handleTabChange('teams')}
            className="w-full"
          >
            <TabsTrigger value="teams" className="flex items-center gap-2 w-full">
              <Trophy className="h-4 w-4" />
              Teams
            </TabsTrigger>
          </NavigationFeedback>
        </TabsList>

        <TabsContent value="fixtures" className="space-y-4">
          <LeagueFixturesDisplay
            leagueId={league.id.toString()}
            variant="detailed"
            showSearchAndFilter={true}
            searchAndFilterVariant="compact"
            searchAndFilterOptions={{
              showSearch: true,
              showLeagueFilter: false, // Not needed on league page
              showTeamFilter: true,
              showStatusFilter: true,
              showDateFilter: true,
              showPredictionsFilter: true,
              showValueBetsFilter: true,
            }}
          />
        </TabsContent>

        <TabsContent value="standings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>League Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Pos</th>
                      <th className="text-left p-2">Team</th>
                      <th className="text-center p-2">P</th>
                      <th className="text-center p-2">W</th>
                      <th className="text-center p-2">D</th>
                      <th className="text-center p-2">L</th>
                      <th className="text-center p-2">GD</th>
                      <th className="text-center p-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{i}</td>
                        <td className="p-2">Team {i}</td>
                        <td className="p-2 text-center">38</td>
                        <td className="p-2 text-center">25</td>
                        <td className="p-2 text-center">8</td>
                        <td className="p-2 text-center">5</td>
                        <td className="p-2 text-center">+45</td>
                        <td className="p-2 text-center font-medium">83</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <LeagueFixturesDisplay
            leagueId={league.id.toString()}
            variant="detailed"
            showSearchAndFilter={true}
            searchAndFilterVariant="compact"
            searchAndFilterOptions={{
              showSearch: true,
              showLeagueFilter: false, // Not needed on league page
              showTeamFilter: true,
              showStatusFilter: true,
              showDateFilter: true,
              showPredictionsFilter: true,
              showValueBetsFilter: true,
            }}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>League Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">T{i}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Team {i}</div>
                      <div className="text-xs text-gray-500">Position: {i}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LeagueClient;
