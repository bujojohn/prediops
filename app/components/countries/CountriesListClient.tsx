'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Trophy } from 'lucide-react';
import { FlagImage } from '@/app/components/ui/optimized-image';

interface Country {
  id: number;
  name: string;
  official_name: string;
  fifa_name: string;
  iso2: string;
  iso3: string;
  image_path?: string;
  continent?: {
    id: number;
    name: string;
    code: string;
  };
  leagues?: Array<{
    id: number;
    name: string;
    type: string;
  }>;
}

interface CountriesListClientProps {
  initialCountries: Country[];
  onCountrySelect?: (country: Country) => void;
  selectedCountryId?: number;
}

export function CountriesListClient({ 
  initialCountries, 
  onCountrySelect, 
  selectedCountryId 
}: CountriesListClientProps) {
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.official_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.iso2.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery, countries]);

  const handleCountryClick = (country: Country) => {
    onCountrySelect?.(country);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Countries
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCountries.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {searchQuery ? 'No countries found' : 'No countries available'}
            </div>
          ) : (
            filteredCountries.map((country) => (
              <div
                key={country.id}
                onClick={() => handleCountryClick(country)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedCountryId === country.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {country.image_path ? (
                      <FlagImage
                        src={country.image_path}
                        alt={`${country.name} flag`}
                      />
                    ) : (
                      <div className="w-6 h-4 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">{country.iso2}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.official_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {country.leagues && country.leagues.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        {country.leagues.length}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {country.iso2}
                    </Badge>
                  </div>
                </div>
                {country.continent && (
                  <div className="mt-2 text-xs text-gray-500">
                    {country.continent.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

