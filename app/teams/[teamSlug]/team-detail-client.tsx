'use client';

import { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MapPin, 
  Calendar as CalendarIcon,
  Clock,
  Award,
  Star,
  Activity,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { TeamDetailed } from '@/schemas/team-detailed.schema';
import { formatFoundedYear, getTeamTypeDisplay } from '@/lib/utils/team-utils';

interface TeamDetailClientProps {
  team: TeamDetailed;
}

export function TeamDetailClient({ team }: TeamDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Helper functions
  const getActiveCoach = () => {
    return team.coaches?.find(coach => coach.active) || team.coaches?.[0];
  };

  const getCurrentPlayers = () => {
    return team.players?.filter(player => !player.end || new Date(player.end) > new Date()) || [];
  };

  const getSidelinedPlayers = () => {
    return team.sidelined?.filter(player => !player.end_date || new Date(player.end_date) > new Date()) || [];
  };

  const getUpcomingFixtures = () => {
    return team.upcoming?.slice(0, 5) || [];
  };

  const getRecentFixtures = () => {
    return team.latest?.slice(0, 5) || [];
  };

  const getTrophies = () => {
    return team.trophies || [];
  };

  const getRivals = () => {
    return team.rivals || [];
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Team Logo and Basic Info */}
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            {team.image_path ? (
              <img
                src={team.image_path}
                alt={team.name || 'Team'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-4xl font-bold text-gray-400">
                {team.name?.charAt(0) || 'T'}
              </span>
            )}
          </div>
          
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {team.name || 'Unknown Team'}
            </h1>
            
            {team.short_code && (
              <Badge variant="secondary" className="text-sm">
                {team.short_code}
              </Badge>
            )}
            
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {team.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{team.country.name}</span>
                </div>
              )}
              
              {team.founded && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{formatFoundedYear(team.founded)}</span>
                </div>
              )}
              
              {team.type && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>{getTeamTypeDisplay(team.type)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getCurrentPlayers().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Players</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getTrophies().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trophies</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getUpcomingFixtures().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getRivals().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rivals</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="rivals">Rivals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coach Info */}
            {getActiveCoach() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Current Coach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Coach #{getActiveCoach()?.coach_id}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getActiveCoach()?.start && `Since ${new Date(getActiveCoach()!.start!).getFullYear()}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sidelined Players */}
            {getSidelinedPlayers().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="w-5 h-5" />
                    Sidelined Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getSidelinedPlayers().slice(0, 3).map((player) => (
                      <div key={player.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Player #{player.player_id}</span>
                        <Badge variant="outline" className="text-xs">
                          {player.category || 'Injured'}
                        </Badge>
                      </div>
                    ))}
                    {getSidelinedPlayers().length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{getSidelinedPlayers().length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent and Upcoming Fixtures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Fixtures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentFixtures().map((fixture) => (
                    <div key={fixture.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{fixture.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {fixture.starting_at ? new Date(fixture.starting_at).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {fixture.result_info || 'No result'}
                      </div>
                    </div>
                  ))}
                  {getRecentFixtures().length === 0 && (
                    <p className="text-center text-gray-500 text-sm">No recent matches</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Fixtures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Upcoming Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingFixtures().map((fixture) => (
                    <div key={fixture.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{fixture.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {fixture.starting_at ? new Date(fixture.starting_at).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {fixture.starting_at ? new Date(fixture.starting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </div>
                    </div>
                  ))}
                  {getUpcomingFixtures().length === 0 && (
                    <p className="text-center text-gray-500 text-sm">No upcoming matches</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Squad Tab */}
        <TabsContent value="squad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Squad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentPlayers().map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {player.jersey_number || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Player #{player.player_id}
                        {player.captain && (
                          <Badge variant="secondary" className="ml-2 text-xs">Captain</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Position: {player.position_id}
                      </div>
                    </div>
                  </div>
                ))}
                {getCurrentPlayers().length === 0 && (
                  <p className="text-center text-gray-500 col-span-full">No players available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Fixtures */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Fixtures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentFixtures().map((fixture) => (
                    <div key={fixture.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">{fixture.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {fixture.starting_at ? new Date(fixture.starting_at).toLocaleDateString() : 'TBD'}
                      </div>
                      {fixture.result_info && (
                        <Badge variant="outline" className="text-xs">
                          {fixture.result_info}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Fixtures */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Fixtures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingFixtures().map((fixture) => (
                    <div key={fixture.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">{fixture.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {fixture.starting_at ? new Date(fixture.starting_at).toLocaleDateString() : 'TBD'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                        <Clock className="w-3 h-3" />
                        {fixture.starting_at ? new Date(fixture.starting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trophies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Trophies & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTrophies().map((trophy) => (
                    <div key={trophy.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="font-medium text-sm">Trophy #{trophy.trophy_id}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Season: {trophy.season_id}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getTrophies().length === 0 && (
                    <p className="text-center text-gray-500 text-sm">No trophies available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seasons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Seasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.seasons?.slice(0, 5).map((season) => (
                    <div key={season.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{season.name || `Season ${season.id}`}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {season.is_current ? 'Current Season' : 'Past Season'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!team.seasons || team.seasons.length === 0) && (
                    <p className="text-center text-gray-500 text-sm">No seasons available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Team statistics will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rivals Tab */}
        <TabsContent value="rivals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Rival Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRivals().map((rival) => (
                  <div key={rival.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {rival.image_path ? (
                        <img
                          src={rival.image_path}
                          alt={rival.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">
                          {rival.name?.charAt(0) || 'R'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{rival.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {rival.short_code} • Founded {rival.founded}
                      </div>
                    </div>
                  </div>
                ))}
                {getRivals().length === 0 && (
                  <p className="text-center text-gray-500 col-span-full">No rivals available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
