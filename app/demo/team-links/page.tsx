'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixtureTeamLink, NavigationTeamLink } from '@/components/ui/TeamLink';
import { ROUTES, generateFixtureUrl } from '@/lib/utils/routing';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockTeam = {
  id: 1,
  name: 'Manchester United',
  short_code: 'MUN',
  image_path: 'https://example.com/logo.png',
  country_id: 462,
  sport_id: 1,
  venue_id: 1,
  gender: 'male',
  founded: 1878,
  type: 'club',
  placeholder: false,
  last_played_at: '2025-01-15T15:00:00Z',
  national_team: false,
  meta: {
    location: 'home',
    winner: false,
    position: 1
  }
};

const mockAwayTeam = {
  id: 2,
  name: 'Liverpool FC',
  short_code: 'LIV',
  image_path: 'https://example.com/logo2.png',
  country_id: 462,
  sport_id: 1,
  venue_id: 2,
  gender: 'male',
  founded: 1892,
  type: 'club',
  placeholder: false,
  last_played_at: '2025-01-15T17:30:00Z',
  national_team: false,
  meta: {
    location: 'away',
    winner: false,
    position: 2
  }
};

const mockFixture = {
  id: 12345,
  participants: [mockTeam, mockAwayTeam]
};

export default function TeamLinksDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'fixture-context'>('default');

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Team Links Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating the scalable team linking system with different variants
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variant Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Link Variants</CardTitle>
            <CardDescription>Choose between different link behaviors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={selectedVariant === 'default' ? 'default' : 'outline'}
                onClick={() => setSelectedVariant('default')}
                size="sm"
              >
                Default
              </Button>
              <Button
                variant={selectedVariant === 'fixture-context' ? 'default' : 'outline'}
                onClick={() => setSelectedVariant('fixture-context')}
                size="sm"
              >
                Fixture Context
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Default:</strong> Links to team page<br />
              <strong>Fixture Context:</strong> Links to team page with fixture tab
            </div>
          </CardContent>
        </Card>

        {/* Link Behavior Info */}
        <Card>
          <CardHeader>
            <CardTitle>Link Behavior</CardTitle>
            <CardDescription>How the links behave when clicked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant="outline">Opens in New Tab</Badge>
              <Badge variant="outline">SEO-Friendly URLs</Badge>
              <Badge variant="outline">Accessible</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              All team links open in new tabs for better UX and preserve the current page context.
            </div>
          </CardContent>
        </Card>

        {/* Fixture Card Demo */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Fixture Card Demo</CardTitle>
            <CardDescription>Team names are now clickable links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FixtureTeamLink
                    team={mockTeam}
                    fixtureId={mockFixture.id.toString()}
                    className="font-semibold text-lg hover:text-blue-600"
                  >
                    {mockTeam.name}
                  </FixtureTeamLink>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">vs</div>
                  <div className="text-xs text-gray-400">Jan 15, 2025</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FixtureTeamLink
                    team={mockAwayTeam}
                    fixtureId={mockFixture.id.toString()}
                    className="font-semibold text-lg hover:text-blue-600"
                  >
                    {mockAwayTeam.name}
                  </FixtureTeamLink>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Click on any team name to open their team page in a new tab
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Links</CardTitle>
            <CardDescription>Team links in navigation context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <NavigationTeamLink team={mockTeam}>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                  <span>{mockTeam.name}</span>
                </div>
              </NavigationTeamLink>
              
              <NavigationTeamLink team={mockAwayTeam}>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                  <span>{mockAwayTeam.name}</span>
                </div>
              </NavigationTeamLink>
            </div>
            <div className="text-sm text-muted-foreground">
              Navigation links open in the same tab for better navigation flow.
            </div>
          </CardContent>
        </Card>

        {/* URL Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Generated URLs</CardTitle>
            <CardDescription>Examples of the URLs that are generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <strong>Team Page:</strong>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {ROUTES.TEAM_DETAIL(mockTeam.id.toString(), 'manchester-united')}
                </code>
              </div>
              
              <div>
                <strong>Team with Fixtures:</strong>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {ROUTES.TEAM_FIXTURES(mockTeam.id.toString(), 'manchester-united')}
                </code>
              </div>
              
              <div>
                <strong>Fixture with Team Context:</strong>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {generateFixtureUrl(mockFixture)}?team={mockTeam.id}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>How to use the team linking system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Usage</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { FixtureTeamLink } from '@/components/ui/TeamLink';

<FixtureTeamLink team={team} fixtureId={fixture.id}>
  <span>{team.name}</span>
</FixtureTeamLink>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Navigation Links</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { NavigationTeamLink } from '@/components/ui/TeamLink';

<NavigationTeamLink team={team}>
  <div>{team.name}</div>
</NavigationTeamLink>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">URL Generation</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { generateTeamUrl } from '@/lib/utils/routing';

const teamUrl = generateTeamUrl(team);
// Returns: /team/1/manchester-united`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
