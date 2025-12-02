'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Grid, List, SortAsc, SortDesc, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { League } from '@/schemas/league.schema';
import { generateLeagueUrl } from '@/lib/utils/routing';
import { useEntityFavorites } from '@/app/hooks/useEntityFavorites';

interface LeaguesClientProps {
  initialLeagues: League[];
  initialPagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  initialSearchParams: {
    search?: string;
    country?: string;
    active?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

export function LeaguesClient({ 
  initialLeagues, 
  initialPagination, 
  initialSearchParams 
}: LeaguesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for search and filters
  const [search, setSearch] = useState(initialSearchParams.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(initialSearchParams.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSearchParams.sortOrder || 'asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Favorites hook
  const { favorites, toggleFavorite, isFavorite } = useEntityFavorites('leagues');

  // Update URL when search params change
  const updateUrl = useCallback((newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to first page when filters change
    if (Object.keys(newParams).some(key => key !== 'page')) {
      params.delete('page');
    }
    
    router.push(`/leagues?${params.toString()}`);
  }, [router, searchParams]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    updateUrl({ search: value || undefined });
  }, [updateUrl]);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
    updateUrl({ sortBy: newSortBy });
  }, [updateUrl]);

  const handleSortOrderToggle = useCallback(() => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    updateUrl({ sortOrder: newOrder });
  }, [sortOrder, updateUrl]);

  // Filter and sort leagues
  const filteredLeagues = useMemo(() => {
    let filtered = [...initialLeagues];

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(league => favorites.has(league.id));
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(league => 
        league.name?.toLowerCase().includes(searchLower) ||
        league.short_code?.toLowerCase().includes(searchLower) ||
        league.country?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Handle favorites sorting first
      if (sortBy === 'favorites') {
        const aIsFav = favorites.has(a.id) ? 1 : 0;
        const bIsFav = favorites.has(b.id) ? 1 : 0;
        if (bIsFav !== aIsFav) {
          return sortOrder === 'asc' ? aIsFav - bIsFav : bIsFav - aIsFav;
        }
        // If both have same favorite status, sort by name
        return (a.name || '').localeCompare(b.name || '');
      }

      let aValue: string | number | boolean = '';
      let bValue: string | number | boolean = '';

      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'country':
          aValue = a.country?.name || '';
          bValue = b.country?.name || '';
          break;
        case 'active':
          aValue = a.active ? 1 : 0;
          bValue = b.active ? 1 : 0;
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [initialLeagues, search, sortBy, sortOrder, showFavoritesOnly, favorites]);

  // Pagination
  const itemsPerPage = initialPagination.per_page;
  // Get current page from URL params, defaulting to 1 if not present or invalid
  const urlPageParam = searchParams.get('page');
  const urlPage = urlPageParam ? (() => {
    const parsed = parseInt(urlPageParam, 10);
    // Return 1 if parsing failed (NaN) or if result is not a positive integer
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  })() : 1;
  // Reset to page 1 if current page exceeds total pages after filtering
  const totalPages = Math.ceil(filteredLeagues.length / itemsPerPage);
  const currentPage = urlPage > totalPages && totalPages > 0 ? 1 : Math.max(1, urlPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeagues = filteredLeagues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search leagues..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="active">Status</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortOrderToggle}
              className="px-2"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* View Mode Toggle and Favorites Filter */}
          <div className="flex items-center gap-2">
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
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedLeagues.length} of {filteredLeagues.length} leagues
          {favorites.size > 0 && (
            <span className="ml-2">
              ({favorites.size} favorite{favorites.size !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      {/* Leagues Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedLeagues.map((league) => (
            <LeagueCard 
              key={league.id} 
              league={league}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedLeagues.map((league) => (
            <LeagueListItem 
              key={league.id} 
              league={league}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => updateUrl({ page: (currentPage - 1).toString() })}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateUrl({ page: page.toString() })}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => updateUrl({ page: (currentPage + 1).toString() })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// League Card Component
function LeagueCard({ 
  league, 
  isFavorite, 
  toggleFavorite 
}: { 
  league: League;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}) {
  const leagueUrl = generateLeagueUrl(league);
  
  return (
    <Card className="hover:shadow-lg transition-shadow group relative">
      <CardContent className="p-4">
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(league.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-150 hover:scale-110 active:scale-95 z-10 ${
            isFavorite(league.id)
              ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30'
              : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20'
          }`}
          title={isFavorite(league.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite(league.id) ? (
            <Star className="h-4 w-4 fill-current" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>

        <Link href={leagueUrl} className="block">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* League Logo */}
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {league.image_path ? (
                <Image
                  src={league.image_path}
                  alt={league.name || 'League'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {league.name?.charAt(0) || 'L'}
                </span>
              )}
            </div>

            {/* League Info */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {league.name || 'Unknown League'}
              </h3>
              
              {league.short_code && (
                <Badge variant="secondary" className="text-xs">
                  {league.short_code}
                </Badge>
              )}
              
              <div className="flex items-center justify-center gap-2">
                {league.active !== false && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Active
                  </Badge>
                )}
                {league.active === false && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {league.country && (
                  <p>📍 {league.country.name}</p>
                )}
                {league.type && (
                  <p>🏆 {league.type}</p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

// League List Item Component
function LeagueListItem({ 
  league, 
  isFavorite, 
  toggleFavorite 
}: { 
  league: League;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}) {
  const leagueUrl = generateLeagueUrl(league);
  
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* League Logo */}
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {league.image_path ? (
              <Image
                src={league.image_path}
                alt={league.name || 'League'}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-lg font-bold text-gray-400">
                {league.name?.charAt(0) || 'L'}
              </span>
            )}
          </div>

          {/* League Info */}
          <Link href={leagueUrl} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {league.name || 'Unknown League'}
              </h3>
              {league.short_code && (
                <Badge variant="secondary" className="text-xs">
                  {league.short_code}
                </Badge>
              )}
              {league.active !== false && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {league.country && (
                <span>📍 {league.country.name}</span>
              )}
              {league.type && (
                <span>🏆 {league.type}</span>
              )}
            </div>
          </Link>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(league.id);
            }}
            className={`p-1.5 rounded-md transition-all duration-150 hover:scale-110 active:scale-95 flex-shrink-0 ${
              isFavorite(league.id)
                ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30'
                : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20'
            }`}
            title={isFavorite(league.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(league.id) ? (
              <Star className="h-4 w-4 fill-current" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

