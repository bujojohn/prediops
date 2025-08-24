'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Trophy, Calendar, ChevronRight, Users, MapPin } from 'lucide-react';
import { 
  DatePickerProvider, 
  HorizontalDatePicker, 
  useDatePickerWithFixtures 
} from '@/app/components/date-picker';

interface Country {
  id: number;
  name: string;
  image_path: string;
  leagues: League[];
}

interface League {
  id: number;
  name: string;
  type: string;
  country_id: number;
  season_id: number;
  fixtures: Fixture[];
}

interface Fixture {
  id: number;
  name: string;
  starting_at: string;
  state: {
    short_name: string;
    name: string;
  };
  participants: Array<{
    id: number;
    name: string;
    image_path: string;
  }>;
}

interface CountriesClientProps {
  initialFixtures: Fixture[];
}

function CountriesContent({ initialFixtures }: CountriesClientProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());

  const {
    selectedDate,
    selectDate,
    fixtures: selectedDateFixtures,
    isLoading: fixturesLoading,
    error: fixturesError,
    refreshFixtures,
  } = useDatePickerWithFixtures();

  // Load countries and leagues
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sportmonks/countries?include=leagues');
        
        if (!response.ok) {
          throw new Error('Failed to load countries');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setCountries(data.data);
        } else {
          throw new Error(data.error || 'No countries found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load countries');
        console.error('Error loading countries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Load fixtures for selected date or use initial fixtures
  useEffect(() => {
    if (selectedDate) {
      if (initialFixtures.length > 0 && selectedDate === new Date().toISOString().split('T')[0]) {
        // Use SSR-loaded fixtures for today
        const fixturesByCountry = groupFixturesByCountry(initialFixtures);
        setCountries(prevCountries => 
          prevCountries.map(country => ({
            ...country,
            leagues: country.leagues.map(league => ({
              ...league,
              fixtures: fixturesByCountry[league.id] || []
            }))
          }))
        );
      } else {
        // Load fixtures for other dates
        loadFixturesForDate(selectedDate);
      }
    }
  }, [selectedDate, initialFixtures]);

  const loadFixturesForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/sportmonks/fixtures/date/${date}?include=participants,state&limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to load fixtures');
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Group fixtures by country and league
        const fixturesByCountry = groupFixturesByCountry(data.data);
        setCountries(prevCountries => 
          prevCountries.map(country => ({
            ...country,
            leagues: country.leagues.map(league => ({
              ...league,
              fixtures: fixturesByCountry[league.id] || []
            }))
          }))
        );
      }
    } catch (err) {
      console.error('Error loading fixtures for date:', date, err);
    }
  };

  const groupFixturesByCountry = (fixtures: Fixture[]) => {
    const grouped: Record<number, Fixture[]> = {};
    fixtures.forEach(fixture => {
      // This would need to be enhanced based on your actual API structure
      // For now, we'll use a placeholder approach
      if (fixture.id) {
        grouped[fixture.id] = [fixture];
      }
    });
    return grouped;
  };

  const toggleCountryExpansion = (countryId: number) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
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

  if (isLoading) {
    return <CountriesLoading />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Picker Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Select Date</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <HorizontalDatePicker
            onDateSelect={selectDate}
            className="mb-4"
          />
          
          <div className="text-sm text-gray-600">
            <p><strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            {fixturesLoading && <p className="text-blue-600">Loading fixtures...</p>}
            {fixturesError && <p className="text-red-600">Error: {fixturesError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Countries Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <Card key={country.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                {country.image_path ? (
                  <img 
                    src={country.image_path} 
                    alt={country.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <Globe className="w-8 h-8 text-blue-600" />
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{country.name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {country.leagues?.length || 0} leagues
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCountryExpansion(country.id)}
                  className="p-1"
                >
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${
                      expandedCountries.has(country.id) ? 'rotate-90' : ''
                    }`} 
                  />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {expandedCountries.has(country.id) && (
                <div className="space-y-3 mt-3">
                  {country.leagues?.map((league) => (
                    <div key={league.id} className="border-l-2 border-blue-200 pl-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-sm">{league.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {league.type}
                        </Badge>
                      </div>
                      
                      {/* League Fixtures */}
                      {league.fixtures && league.fixtures.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">
                            {league.fixtures.length} fixture{league.fixtures.length !== 1 ? 's' : ''} on {new Date(selectedDate).toLocaleDateString()}
                          </p>
                          {league.fixtures.slice(0, 3).map((fixture) => (
                            <div key={fixture.id} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{fixture.name}</span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getFixtureStatusColor(fixture.state?.short_name)}`}
                                >
                                  {fixture.state?.short_name || 'NS'}
                                </Badge>
                              </div>
                              <div className="text-gray-600">
                                {new Date(fixture.starting_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          ))}
                          {league.fixtures.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{league.fixtures.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Countries Message */}
      {countries.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Found</h3>
            <p className="text-gray-600">No countries are currently available.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export function CountriesClient({ initialFixtures }: CountriesClientProps) {
  return (
    <DatePickerProvider>
      <CountriesContent initialFixtures={initialFixtures} />
    </DatePickerProvider>
  );
}
