import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Search, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Countries - Prediops',
  description: 'Browse football leagues and competitions by country.',
};

export default function CountriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Countries</h1>
        <p className="text-muted-foreground">
          Browse football leagues and competitions by country
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              All Countries
            </CardTitle>
            <CardDescription>
              Select a country to view its leagues and competitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Use the sidebar to browse countries and their leagues.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Popular Leagues
            </CardTitle>
            <CardDescription>
              Top football leagues from around the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Popular leagues will be displayed here. Use the sidebar to explore.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
