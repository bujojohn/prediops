import { formatTimeLocal } from '@/lib/utils';
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, ChevronRight, Globe } from 'lucide-react';
import Image from 'next/image';
// Temporarily removed DatePicker to resolve serialization issues
// import { 
//   DatePickerProvider, 
//   HorizontalDatePicker 
// } from '@/app/components/date-picker';
import { Country } from '@/schemas/country.schema';
import { Fixture } from '@/schemas/fixture.schema';

interface CountryPageClientProps {
  country: Country;
  initialFixtures: Fixture[];
  countryId: number;
}

export function CountryPageClient({ country, initialFixtures }: CountryPageClientProps) {
  const [fixtures] = useState<Fixture[]>(initialFixtures);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<number>>(new Set());
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load fixtures for a specific date - temporarily disabled
  // const loadFixturesForDate = useCallback(async (date: string) => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // TODO: use ReactQuery instead in place of the following fetch call unless you have a good reason to use fetch
  //     const response = await fetch(`/api/sportmonks/fixtures/date/${date}?include=participants,state,scores,league.country&limit=200`);
      
  //     if (!response.ok) {
  //       throw new Error('Failed to load fixtures');
  //     }

  //     const data = await response.json();
  //     if (data.success && data.data) {
  //       // Filter fixtures for this country
  //       const countryFixtures = data.data.filter((fixture: unknown) => {
  //         const f = fixture as {
  //           league?: {
  //               country?: {
  //                 id?: number;
  //               };
  //             };
  //           };
  //           return f.league?.country?.id === countryId;
  //         });
  //         setFixtures(countryFixtures);
  //       } else {
  //         throw new Error(data.error || 'No fixtures found for this date');
  //       }
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to load fixtures');
  //       console.error('Error loading fixtures for date:', date, err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, [countryId]);

  // Handle date selection - temporarily disabled
  // const handleDateSelect = useCallback((date: string) => {
  //   setSelectedDate(date);
  //   loadFixturesForDate(date);
  // }, [loadFixturesForDate]);

  // Group fixtures by league (using included league data)
  const fixturesByLeague = fixtures.reduce((acc, fixture) => {
    const leagueId = (fixture as unknown as { league?: { id?: number } }).league?.id ?? fixture.id;
    if (!acc[leagueId]) {
      acc[leagueId] = [] as Fixture[];
    }
    (acc[leagueId] as Fixture[]).push(fixture);
    return acc;
  }, {} as Record<number, Fixture[]>);

  const toggleLeagueExpansion = (leagueId: number) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(leagueId)) {
      newExpanded.delete(leagueId);
    } else {
      newExpanded.add(leagueId);
    }
    setExpandedLeagues(newExpanded);
  };

  const getFixtureStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'ht': return 'bg-yellow-100 text-yellow-800';
      case 'ft': return 'bg-green-100 text-green-800';
      case 'ns': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
               <h1 className="text-4xl font-bold text-gray-900">{country.name || 'Unknown Country'}</h1>
               <p className="text-lg text-gray-600">
                 {country.leagues?.length || 0} leagues available
               </p>
             </div>
          </div>
        </div>

                 {/* Date Picker Section - Temporarily Disabled */}
         <Card className="mb-6">
           <CardHeader>
             <div className="flex items-center gap-2">
               <Calendar className="h-5 w-5 text-blue-600" />
               <CardTitle>Date Selection</CardTitle>
             </div>
           </CardHeader>
           <CardContent>
             <div className="text-sm text-gray-600">
               <p><strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                 weekday: 'long',
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric'
               })}</p>
               <p className="text-gray-500">Date picker temporarily disabled for build testing</p>
             </div>
           </CardContent>
         </Card>

        {/* Fixtures by League */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Fixtures for {selectedDate}</h2>
          
          {Object.entries(fixturesByLeague).map(([leagueId, leagueFixtures]) => (
            <Card key={leagueId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg">
                      {(leagueFixtures[0] as unknown as { league?: { name?: string } }).league?.name || `League ${leagueId}`}
                    </CardTitle>
                    <Badge variant="outline">{leagueFixtures.length} fixtures</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLeagueExpansion(parseInt(leagueId))}
                    className="p-1"
                  >
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        expandedLeagues.has(parseInt(leagueId)) ? 'rotate-90' : ''
                      }`} 
                    />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {expandedLeagues.has(parseInt(leagueId)) && (
                  <div className="space-y-3">
                    {leagueFixtures.map((fixture) => (
                      <div key={fixture.id} className="border-l-2 border-blue-200 pl-3">
                        <div className="flex items-center justify-between mb-2">
                                                   <div className="flex-1">
                           <div className="font-medium">{fixture.name || 'Unknown Fixture'}</div>
                           <div className="text-sm text-gray-600">
                             {fixture.starting_at ? formatTimeLocal(fixture.starting_at) : 'Time TBD'}
                           </div>
                         </div>
                                                     <div className="flex items-center gap-2">
                             {fixture.scores && fixture.scores.length >= 2 && (
                               <div className="text-lg font-bold">
                                 {fixture.scores[0]?.score?.goals || 0} - {fixture.scores[1]?.score?.goals || 0}
                               </div>
                             )}
                             <Badge 
                               variant="secondary" 
                               className={getFixtureStatusColor(fixture.state?.short_name || 'NS')}
                             >
                               {fixture.state?.short_name || 'NS'}
                             </Badge>
                           </div>
                        </div>
                        
                                                 {/* Participants */}
                         {fixture.participants && fixture.participants.length >= 2 && (
                           <div className="text-sm text-gray-600">
                             {fixture.participants[0]?.name || 'Home Team'} vs {fixture.participants[1]?.name || 'Away Team'}
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

                     {/* No Fixtures Message */}
           {fixtures.length === 0 && (
             <Card className="p-8">
               <div className="text-center">
                 <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Fixtures Found</h3>
                 <p className="text-gray-600">No fixtures are scheduled for {selectedDate} in {country.name || 'this country'}.</p>
               </div>
             </Card>
           )}
                 </div>
       </div>
   );
 }
