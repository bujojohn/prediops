'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Team } from '@/schemas/team.schema';
import { formatFoundedYear, getTeamTypeDisplay } from '@/lib/utils/team-utils';

interface TeamsClientProps {
  initialTeams: Team[];
  initialPagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  initialSearchParams: {
    search?: string;
    country?: string;
    league?: string;
    founded?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  };
}

export function TeamsClient({ 
  initialTeams, 
  initialPagination, 
  initialSearchParams 
}: TeamsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for search and filters
  const [search, setSearch] = useState(initialSearchParams.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(initialSearchParams.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSearchParams.sortOrder || 'asc');

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
    
    router.push(`/teams?${params.toString()}`);
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

  // Filter and sort teams
  const filteredTeams = useMemo(() => {
    let filtered = [...initialTeams];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(team => 
        team.name?.toLowerCase().includes(searchLower) ||
        team.short_code?.toLowerCase().includes(searchLower) ||
        team.country?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'founded':
          aValue = a.founded || 0;
          bValue = b.founded || 0;
          break;
        case 'country':
          aValue = a.country?.name || '';
          bValue = b.country?.name || '';
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
  }, [initialTeams, search, sortBy, sortOrder]);

  // Pagination
  const itemsPerPage = initialPagination.per_page;
  const currentPage = initialPagination.current_page;
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search teams..."
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
                <SelectItem value="founded">Founded</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="type">Type</SelectItem>
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
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
          Showing {paginatedTeams.length} of {filteredTeams.length} teams
        </p>
      </div>

      {/* Teams Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedTeams.map((team) => (
            <TeamListItem key={team.id} team={team} />
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

// Team Card Component
function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Team Logo */}
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            {team.image_path ? (
              <img
                src={team.image_path}
                alt={team.name || 'Team'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-gray-400">
                {team.name?.charAt(0) || 'T'}
              </span>
            )}
          </div>

          {/* Team Info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {team.name || 'Unknown Team'}
            </h3>
            
            {team.short_code && (
              <Badge variant="secondary" className="text-xs">
                {team.short_code}
              </Badge>
            )}
            
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {team.country && (
                <p>📍 {team.country.name}</p>
              )}
              {team.founded && (
                <p>🏛️ {formatFoundedYear(team.founded)}</p>
              )}
              {team.type && (
                <p>🏆 {getTeamTypeDisplay(team.type)}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Team List Item Component
function TeamListItem({ team }: { team: Team }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Team Logo */}
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {team.image_path ? (
              <img
                src={team.image_path}
                alt={team.name || 'Team'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-lg font-bold text-gray-400">
                {team.name?.charAt(0) || 'T'}
              </span>
            )}
          </div>

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {team.name || 'Unknown Team'}
              </h3>
              {team.short_code && (
                <Badge variant="secondary" className="text-xs">
                  {team.short_code}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {team.country && (
                <span>📍 {team.country.name}</span>
              )}
              {team.founded && (
                <span>🏛️ {formatFoundedYear(team.founded)}</span>
              )}
              {team.type && (
                <span>🏆 {getTeamTypeDisplay(team.type)}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
