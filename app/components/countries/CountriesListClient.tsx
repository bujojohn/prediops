'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Globe, Trophy, Star, StarOff } from 'lucide-react';
import { FlagImage } from '@/app/components/ui/optimized-image';
import { useEntityFavorites } from '@/app/hooks/useEntityFavorites';

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
  const [countries] = useState<Country[]>(initialCountries);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Favorites hook
  const { favorites, toggleFavorite, isFavorite } = useEntityFavorites('countries');

  // Filter countries
  const filteredCountries = useMemo(() => {
    let filtered = [...countries];

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(country => favorites.has(country.id));
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(searchLower) ||
        country.official_name.toLowerCase().includes(searchLower) ||
        country.iso2.toLowerCase().includes(searchLower)
      );
    }

    // Sort: favorites first, then by name
    filtered.sort((a, b) => {
      const aIsFav = favorites.has(a.id) ? 1 : 0;
      const bIsFav = favorites.has(b.id) ? 1 : 0;
      if (bIsFav !== aIsFav) {
        return bIsFav - aIsFav;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [countries, searchQuery, showFavoritesOnly, favorites]);

  const handleCountryClick = (country: Country) => {
    onCountrySelect?.(country);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Countries
          </CardTitle>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={showFavoritesOnly ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            title="Show favorites only"
          >
            {showFavoritesOnly ? (
              <Star className="w-4 h-4 fill-current" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </Button>
        </div>
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
              {searchQuery || showFavoritesOnly ? 'No countries found' : 'No countries available'}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(country.id);
                      }}
                      className={`p-1.5 rounded-md transition-all duration-150 hover:scale-110 active:scale-95 ${
                        isFavorite(country.id)
                          ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30'
                          : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20'
                      }`}
                      title={isFavorite(country.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite(country.id) ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </button>
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
        {favorites.size > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            {favorites.size} favorite{favorites.size !== 1 ? 's' : ''} saved
          </div>
        )}
      </CardContent>
    </Card>
  );
}

