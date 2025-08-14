import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, BarChart3, Target } from 'lucide-react';

interface LeaguePageProps {
  params: {
    id: string;
  };
}

// Mock data - replace with actual API call
const getLeagueData = async (id: string) => {
  const leagues = {
    '1': {
      id: 1,
      name: 'Premier League',
      country: 'England',
      season: '2024/25',
      image_path: '/leagues/premier-league.png',
      fixture_count: 380,
      team_count: 20
    },
    '2': {
      id: 2,
      name: 'La Liga',
      country: 'Spain',
      season: '2024/25',
      image_path: '/leagues/la-liga.png',
      fixture_count: 380,
      team_count: 20
    }
  };

  return leagues[id as keyof typeof leagues] || null;
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const league = await getLeagueData(params.id);

  if (!league) {
    notFound();
  }

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
      <Tabs defaultValue="fixtures" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fixtures" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fixtures
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Standings
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock fixtures */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">Today 15:00</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Team A</span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium">Team B</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Match Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">Tomorrow 20:00</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Team A</span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium">Team B</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">1 (45%)</Button>
                      <Button variant="outline" size="sm">X (28%)</Button>
                      <Button variant="outline" size="sm">2 (27%)</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>League Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
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
