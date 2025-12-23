'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ValueBetCard } from '../components/value-bets/ValueBetCard';
import { ValueBet } from '@/schemas/valuebet.schema';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Team } from '@/schemas/team.schema';
import type { Participant } from '@/schemas/participant.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { 
  Search, 
  TrendingUp, 
  SortAsc,
  SortDesc,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface ValueBetsClientProps {
  initialValueBets: ValueBet[];
  initialValueBetFixtures: Array<{ id: string; fixture: Fixture }>;
  initialDate: string;
}

export function ValueBetsClient({ 
  initialValueBets, 
  initialValueBetFixtures,
  initialDate 
}: ValueBetsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Create fixture map from initial data
  const valueBetFixtures = useMemo(() => {
    const map = new Map<string, Fixture>();
    initialValueBetFixtures.forEach(({ id, fixture }) => {
      map.set(id, fixture);
    });
    return map;
  }, [initialValueBetFixtures]);

  // Use initial value bets (all data is pre-fetched on server)
  const valueBets = initialValueBets;

  // Get current selected date
  const selectedDate = searchParams.get('date') || initialDate;

  // Date navigation helpers
  const getDateLimits = useCallback(() => {
    const today = new Date();
    const maxFuture = new Date(today);
    maxFuture.setDate(today.getDate() + 21); // 3 weeks
    const minPast = new Date(today);
    minPast.setDate(today.getDate() - 5); // 5 days
    
    return {
      today: today.toISOString().split('T')[0],
      maxFuture: maxFuture.toISOString().split('T')[0],
      minPast: minPast.toISOString().split('T')[0],
    };
  }, []);

  const handleDateChange = useCallback((date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', date);
    router.push(`/value-bets?${params.toString()}`);
    // Page will reload with new data from server
  }, [router, searchParams]);

  const handlePreviousDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = currentDate.toISOString().split('T')[0];
    const limits = getDateLimits();
    if (newDate >= limits.minPast) {
      handleDateChange(newDate);
    }
  }, [selectedDate, getDateLimits, handleDateChange]);

  const handleNextDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = currentDate.toISOString().split('T')[0];
    const limits = getDateLimits();
    if (newDate <= limits.maxFuture) {
      handleDateChange(newDate);
    }
  }, [selectedDate, getDateLimits, handleDateChange]);

  const handleToday = useCallback(() => {
    const limits = getDateLimits();
    handleDateChange(limits.today);
  }, [getDateLimits, handleDateChange]);

  const handleRefresh = useCallback(() => {
    // Refresh by reloading the page with current date
    router.refresh();
  }, [router]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState<'all' | 'value' | 'high-value'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'odds' | 'stake'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter and sort value bets
  const filteredAndSortedBets = useMemo(() => {
    let filtered = valueBets;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(bet => 
        bet.predictions.bet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bet.predictions.bookmaker.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply value filter
    if (filterValue === 'value') {
      filtered = filtered.filter(bet => bet.predictions.is_value);
    } else if (filterValue === 'high-value') {
      filtered = filtered.filter(bet => bet.predictions.stake > 0.1);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'value':
          aValue = a.predictions.stake;
          bValue = b.predictions.stake;
          break;
        case 'odds':
          aValue = a.predictions.odd;
          bValue = b.predictions.odd;
          break;
        case 'stake':
          aValue = a.predictions.stake;
          bValue = b.predictions.stake;
          break;
        default:
          aValue = a.predictions.stake;
          bValue = b.predictions.stake;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [valueBets, searchQuery, filterValue, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBets = valueBets.length;
    const valueBetsCount = valueBets.filter(bet => bet.predictions.is_value).length;
    const highValueBets = valueBets.filter(bet => bet.predictions.stake > 0.1).length;
    const averageValue = totalBets > 0 
      ? valueBets.reduce((sum, bet) => sum + bet.predictions.stake, 0) / totalBets 
      : 0;

    return { totalBets, valueBetsCount, highValueBets, averageValue };
  }, [valueBets]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const limits = getDateLimits();
  const canGoPrevious = selectedDate > limits.minPast;
  const canGoNext = selectedDate < limits.maxFuture;

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filterValue !== 'all';

  // Format date for display
  // Parse date string as local date (not UTC) to match HTML date input behavior
  const formatDisplayDate = useCallback((dateString: string) => {
    // Append 'T00:00:00' to parse as local midnight instead of UTC
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Date Navigation with Search Icon */}
      <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              disabled={!canGoPrevious}
              className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={limits.minPast}
                  max={limits.maxFuture}
                  className="px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:[color-scheme:dark] cursor-pointer hover:border-green-400 dark:hover:border-green-500 transition-colors"
                  title={formatDisplayDate(selectedDate)}
                />
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap pointer-events-none">
                  {formatDisplayDate(selectedDate)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(true)}
                className={`relative dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 ${
                  hasActiveFilters ? 'border-green-500 dark:border-green-400' : ''
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDay}
                disabled={!canGoNext}
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-8">
            View value bets from {formatDisplayDate(limits.minPast)} to {formatDisplayDate(limits.maxFuture)}
          </p>
        </CardContent>
      </Card>

      {/* Filters and Search Modal */}
      <Modal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        title="Filters & Search"
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <Input
                placeholder="Search by bet type or bookmaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Value Filter */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
              Value Bet Filter
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterValue === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterValue('all')}
                className="dark:border-slate-600 dark:text-slate-300"
              >
                All ({stats.totalBets})
              </Button>
              <Button
                variant={filterValue === 'value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterValue('value')}
                className={`${
                  filterValue === 'value'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:text-green-400 dark:border-green-500'
                }`}
              >
                Value ({stats.valueBetsCount})
              </Button>
              <Button
                variant={filterValue === 'high-value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterValue('high-value')}
                className={`${
                  filterValue === 'high-value'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500'
                }`}
              >
                High Value ({stats.highValueBets})
              </Button>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
              Sort Options
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value' | 'odds' | 'stake')}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <option value="value">Value</option>
                <option value="odds">Odds</option>
                <option value="stake">Stake</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-3 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <span className="ml-2 text-xs">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterValue('all');
                }}
                className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Value Bets
          </h2>
          <Badge variant="secondary" className="text-sm">
            {filteredAndSortedBets.length} results
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Value Bets Grid */}
      {filteredAndSortedBets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBets.map((valueBet: ValueBet) => {
            const fixture = valueBetFixtures.get(valueBet.fixture_id.toString());
            
            // Transform participants to match ValueBetCard expected format
            const transformedParticipants = fixture?.participants
              ?.filter(p => p.name && p.meta?.location && (p.meta.location === 'home' || p.meta.location === 'away'))
              .map(p => ({
                name: p.name!,
                meta: {
                  location: p.meta!.location! as 'home' | 'away'
                }
              }))
              ?? undefined;
            
            // Extract home and away participants and convert to Team for linking
            const homeParticipant = fixture?.participants?.find(p => p.meta?.location === 'home');
            const awayParticipant = fixture?.participants?.find(p => p.meta?.location === 'away');
            
            // Debug logging - development only
            if (process.env.NODE_ENV === 'development') {
              console.log(`[ValueBetsClient] ⚡ Extracting participants for fixture ${fixture?.id}:`, {
                hasFixture: !!fixture,
                totalParticipants: fixture?.participants?.length ?? 0,
                homeParticipant: homeParticipant ? { id: homeParticipant.id, name: homeParticipant.name, location: homeParticipant.meta?.location } : null,
                awayParticipant: awayParticipant ? { id: awayParticipant.id, name: awayParticipant.name, location: awayParticipant.meta?.location } : null,
                allParticipants: fixture?.participants?.map(p => ({ id: p.id, name: p.name, location: p.meta?.location }))
              });
            }
            
            // Convert Participant to Team for team linking
            // Team requires: id, sport_id, country_id, venue_id, name
            // Participant has these as optional, so we provide defaults
            const convertParticipantToTeam = (participant: Participant | undefined): Team | undefined => {
              if (process.env.NODE_ENV === 'development') {
                console.log('[ValueBetsClient] convertParticipantToTeam called:', {
                  hasParticipant: !!participant,
                  participant: participant ? { id: participant.id, name: participant.name } : null
                });
              }
              
              if (!participant) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ValueBetsClient] convertParticipantToTeam returning undefined (no participant)');
                }
                return undefined;
              }
              
              const team = {
                id: participant.id,
                sport_id: participant.sport_id ?? 0,
                country_id: participant.country_id ?? 0,
                venue_id: participant.venue_id ?? 0,
                name: participant.name ?? `Team ${participant.id}`,
                gender: participant.gender ?? null,
                short_code: participant.short_code ?? null,
                image_path: participant.image_path ?? null,
                founded: participant.founded ?? null,
                type: participant.type ?? null,
                placeholder: participant.placeholder ?? null,
                last_played_at: participant.last_played_at ?? null,
              } as Team;
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[ValueBetsClient] convertParticipantToTeam returning team:', {
                  id: team.id,
                  name: team.name,
                  sport_id: team.sport_id
                });
              }
              
              return team;
            };
            
            const homeTeam = convertParticipantToTeam(homeParticipant);
            const awayTeam = convertParticipantToTeam(awayParticipant);
            
            // Debug logging - development only
            if (process.env.NODE_ENV === 'development') {
              console.log(`[ValueBetsClient] ⚡⚡⚡ Team conversion result for fixture ${fixture?.id}:`, {
                homeTeam: homeTeam ? { id: homeTeam.id, name: homeTeam.name } : null,
                awayTeam: awayTeam ? { id: awayTeam.id, name: awayTeam.name } : null,
                hasHomeTeam: !!homeTeam,
                hasAwayTeam: !!awayTeam,
                homeTeamType: typeof homeTeam,
                awayTeamType: typeof awayTeam,
                homeTeamKeys: homeTeam ? Object.keys(homeTeam) : [],
                awayTeamKeys: awayTeam ? Object.keys(awayTeam) : []
              });
              
              console.log(`[ValueBetsClient] ⚡ Rendering ValueBetCard for fixture ${fixture?.id}:`, {
                valueBetId: valueBet.fixture_id,
                hasHomeTeam: !!homeTeam,
                hasAwayTeam: !!awayTeam,
                homeTeam: homeTeam ? { id: homeTeam.id, name: homeTeam.name } : null,
                awayTeam: awayTeam ? { id: awayTeam.id, name: awayTeam.name } : null
              });
              
              console.log(`[ValueBetsClient] 🔥🔥🔥 FINAL CHECK before return for fixture ${fixture?.id}:`, {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeTeamStringified: JSON.stringify(homeTeam),
                awayTeamStringified: JSON.stringify(awayTeam),
                willPassHomeTeam: !!homeTeam,
                willPassAwayTeam: !!awayTeam
              });
            }
            
            return (
              <ValueBetCard 
                key={`${valueBet.fixture_id}-${valueBet.predictions.bet}-${valueBet.predictions.bookmaker}`}
                valueBet={valueBet}
                name={fixture?.name ?? undefined}
                starting_at={fixture?.starting_at ?? undefined}
                participants={transformedParticipants}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {searchQuery || filterValue !== 'all' 
                ? 'No matching value bets found' 
                : 'No value bets available'
              }
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || filterValue !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : `No value betting opportunities found for ${formatDisplayDate(selectedDate)}. Try selecting a different date.`
              }
            </p>
            {(searchQuery || filterValue !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterValue('all');
                }}
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {filteredAndSortedBets.length > 0 && (
        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-slate-200">
              <TrendingUp className="h-5 w-5" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredAndSortedBets.length}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Filtered Bets</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredAndSortedBets.filter(bet => bet.predictions.is_value).length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Value Bets</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {filteredAndSortedBets.filter(bet => bet.predictions.stake > 0.1).length}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">High Value</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {filteredAndSortedBets.length > 0 
                    ? (filteredAndSortedBets.reduce((sum, bet) => sum + bet.predictions.stake, 0) / filteredAndSortedBets.length).toFixed(2)
                    : '0.00'
                  }
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Avg Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
