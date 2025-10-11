'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
import type { Fixture } from '@/schemas/fixture.schema';
import { formatFoundedYear, getTeamTypeDisplay } from '@/lib/utils/team-utils';
import { TeamMatchesContent } from './team-matches-content';

interface TeamDetailClientProps {
  team: TeamDetailed;
  initialFixtures?: Fixture[];
}

export function TeamDetailClient({ team, initialFixtures = [] }: TeamDetailClientProps) {
  const [isClient, setIsClient] = useState(false);

  // Get active tab from hash or default to 'overview'
  const [activeTab, setActiveTab] = useState('overview');

  // Handle hash-based tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
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

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe date formatting utility to prevent hydration issues
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      return date.toLocaleDateString();
    } catch {
      return 'TBD';
    }
  };

  const formatTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBD';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'TBD';
    }
  };

  const formatYear = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      return date.getFullYear().toString();
    } catch {
      return 'Unknown';
    }
  };

  // Helper functions
  const getActiveCoach = () => {
    return team.coaches?.find(coach => coach.active) || team.coaches?.[0];
  };

  const getCurrentPlayers = () => {
    return team.players?.filter(player => {
      if (!player.end) return true;
      try {
        const endDate = new Date(player.end);
        return !isNaN(endDate.getTime()) && endDate > new Date();
      } catch {
        return true;
      }
    }) || [];
  };

  const getSidelinedPlayers = () => {
    return team.sidelined?.filter(player => {
      if (!player.end_date) return true;
      try {
        const endDate = new Date(player.end_date);
        return !isNaN(endDate.getTime()) && endDate > new Date();
      } catch {
        return true;
      }
    }) || [];
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
              <Image
                src={team.image_path}
                alt={team.name || 'Team'}
                width={96}
                height={96}
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
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Players</div>
              <div className="text-xs text-gray-500 mt-1">
                {getSidelinedPlayers().length > 0 && `${getSidelinedPlayers().length} sidelined`}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getRecentFixtures().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recent Matches</div>
              <div className="text-xs text-gray-500 mt-1">Last 5 results</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getUpcomingFixtures().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
              <div className="text-xs text-gray-500 mt-1">Next 5 fixtures</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{getTrophies().length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
              <div className="text-xs text-gray-500 mt-1">Total trophies</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs - Only render on client to prevent hydration issues */}
      {isClient ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="squad">Squad</TabsTrigger>
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
                        {getActiveCoach()?.start && `Since ${formatYear(getActiveCoach()!.start)}`}
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
                          {formatDate(fixture.starting_at)}
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
                          {formatDate(fixture.starting_at)}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatTime(fixture.starting_at)}
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
          {/* Squad Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{getCurrentPlayers().length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {getCurrentPlayers().filter(p => p.captain).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Captains</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserX className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{getSidelinedPlayers().length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sidelined</div>
              </CardContent>
            </Card>
          </div>

          {/* Key Players Section */}
          {getCurrentPlayers().filter(p => p.captain || p.jersey_number <= 11).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Key Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentPlayers()
                    .filter(p => p.captain || (p.jersey_number && p.jersey_number <= 11))
                    .slice(0, 6)
                    .map((player) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-2 border-blue-200 dark:border-blue-700">
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                          {player.jersey_number || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Player #{player.player_id}
                          {player.captain && (
                            <Badge variant="default" className="ml-2 text-xs bg-yellow-500">Captain</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Position: {player.position_id}
                        </div>
                        {player.start && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Since {formatYear(player.start)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Squad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Complete Squad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentPlayers().map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                      {player.start && (
                        <div className="text-xs text-gray-500">
                          Joined: {formatYear(player.start)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {getCurrentPlayers().length === 0 && (
                  <p className="text-center text-gray-500 col-span-full">No players available</p>
                )}
              </div>
            </CardContent>
          </Card>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSidelinedPlayers().map((player) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Player #{player.player_id}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {player.category || 'Injured'}
                        </div>
                        {player.start_date && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Since: {formatDate(player.start_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Matches Tab - Merged Fixtures + Predictions */}
        <TabsContent value="matches" className="space-y-6">
          <TeamMatchesContent
            teamId={team.id.toString()}
            teamName={team.name || 'Team'}
            initialFixtures={initialFixtures}
          />
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
                        <Image
                          src={rival.image_path}
                          alt={rival.name}
                          width={40}
                          height={40}
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
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading team details...</p>
          </div>
        </div>
      )}
    </div>
  );
}
