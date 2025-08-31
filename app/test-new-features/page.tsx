import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Globe, ArrowRight } from 'lucide-react';

export default function TestNewFeatures() {
  // Test with Poland (ID: 2) and Premier League (ID: 8)
  const testCountry = {
    id: 2,
    name: 'Poland',
    slug: 'poland'
  };

  const testLeague = {
    id: 8,
    name: 'Premier League'
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test New Features</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing the new "View All Fixtures" and "View League" functionality
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Test View All Fixtures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Test View All Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                This will show all fixtures for {testCountry.name} grouped by active leagues
              </p>
              <Badge variant="outline">Country: {testCountry.name} (ID: {testCountry.id})</Badge>
            </div>
            
            <div className="space-y-2">
              <Link href={`/predictions/country/${testCountry.slug}/all-fixtures?id=${testCountry.id}`}>
                <Button className="w-full">
                  View All Fixtures for {testCountry.name}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500">
                Expected: Shows all fixtures for next 7 days, grouped by active leagues
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test View League */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Test View League
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                This will show all fixtures for a specific league
              </p>
              <Badge variant="outline">League: {testLeague.name} (ID: {testLeague.id})</Badge>
            </div>
            
            <div className="space-y-2">
              <Link href={`/predictions/league/${testLeague.id}`}>
                <Button className="w-full">
                  View All Fixtures for {testLeague.name}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500">
                Expected: Shows all fixtures for the league in next 7 days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Test Links */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Additional Test Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/predictions/country/poland?id=2">
                <Button variant="outline" className="w-full">
                  Poland Country Page
                </Button>
              </Link>
              
              <Link href="/predictions/country/poland/all-fixtures?id=2">
                <Button variant="outline" className="w-full">
                  Poland All Fixtures
                </Button>
              </Link>
              
              <Link href="/predictions/league/8">
                <Button variant="outline" className="w-full">
                  Premier League Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Summary */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Feature Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">✅ View All Fixtures</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Shows all fixtures for next 7 days</li>
                  <li>• Grouped by active leagues</li>
                  <li>• Similar to live/predictions pages</li>
                  <li>• Includes prediction probabilities</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">✅ View League</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Shows all fixtures for specific league</li>
                  <li>• Next 7 days of matches</li>
                  <li>• Includes prediction probabilities</li>
                  <li>• Sorted by date/time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
