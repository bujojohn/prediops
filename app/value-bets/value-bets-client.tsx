'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ValueBetCard } from '../components/value-bets/ValueBetCard';
import { ValueBet } from '@/schemas/valuebet.schema';
import type { Fixture } from '@/schemas/fixture.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  SortAsc,
  SortDesc,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePredictionsWithQuery } from '../predictions/hooks/usePredictionsWithQuery';

interface ValueBetsClientProps {
  initialFixtures: Fixture[];
  initialDate: string;
}

export function ValueBetsClient({ initialFixtures, initialDate }: ValueBetsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    fixtures,
    isLoadingDateFixtures,
    isLoadingMore,
    hasMore,
    error,
    loadFixturesForDate,
    loadNextPage,
  } = usePredictionsWithQuery({ 
    initialFixtures
  });

  const [valueBets, setValueBets] = useState<ValueBet[]>([]);
  const [isLoadingValueBets, setIsLoadingValueBets] = useState(false);
  const [valueBetFixtures, setValueBetFixtures] = useState<Map<string, Fixture>>(new Map());

  // Fetch value bets for all fixtures
  useEffect(() => {
    const fetchValueBets = async () => {
      if (fixtures.length === 0) {
        setValueBets([]);
        setValueBetFixtures(new Map());
        return;
      }

      setIsLoadingValueBets(true);
      const allValueBets: ValueBet[] = [];
      const fixtureMap = new Map<string, Fixture>();

      try {
        // Fetch value bets for each fixture in parallel
        const valueBetPromises = fixtures.map(async (fixture) => {
          try {
            const response = await fetch(`/api/sportmonks/value-bets/fixture/${fixture.id}`);
            if (!response.ok) {
              console.warn(`Failed to fetch value bets for fixture ${fixture.id}`);
              return null;
            }
            const data = await response.json();
            if (data.success && data.data?.data) {
              const fixtureValueBets: ValueBet[] = data.data.data;
              fixtureValueBets.forEach(vb => {
                allValueBets.push(vb);
                fixtureMap.set(vb.fixture_id.toString(), fixture);
              });
            }
          } catch (err) {
            console.error(`Error fetching value bets for fixture ${fixture.id}:`, err);
          }
        });

        await Promise.all(valueBetPromises);
        setValueBets(allValueBets);
        setValueBetFixtures(fixtureMap);
      } catch (err) {
        console.error('Error fetching value bets:', err);
      } finally {
        setIsLoadingValueBets(false);
      }
    };

    fetchValueBets();
  }, [fixtures]);

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
    loadFixturesForDate(date);
  }, [router, searchParams, loadFixturesForDate]);

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
    loadFixturesForDate(selectedDate);
  }, [loadFixturesForDate, selectedDate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState<'all' | 'value' | 'high-value'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'odds' | 'stake'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  return (
    <div className="space-y-8">
      {/* Date Navigation */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              disabled={!canGoPrevious || isLoadingDateFixtures}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={limits.minPast}
                max={limits.maxFuture}
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoadingDateFixtures}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                disabled={isLoadingDateFixtures}
              >
                Today
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              disabled={!canGoNext || isLoadingDateFixtures}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            View value bets from {limits.minPast} to {limits.maxFuture}
          </p>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Find the best value betting opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by bet type or bookmaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Value Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterValue === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterValue('all')}
              >
                All ({stats.totalBets})
              </Button>
              <Button
                variant={filterValue === 'value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterValue('value')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Value ({stats.valueBetsCount})
              </Button>
              <Button
                variant={filterValue === 'high-value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterValue('high-value')}
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
              >
                High Value ({stats.highValueBets})
              </Button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value' | 'odds' | 'stake')}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="value">Value</option>
                <option value="odds">Odds</option>
                <option value="stake">Stake</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Value Bets
          </h2>
          <Badge variant="secondary" className="text-sm">
            {filteredAndSortedBets.length} results
          </Badge>
          {(isLoadingDateFixtures || isLoadingValueBets) && (
            <Badge variant="outline" className="text-sm">
              Loading...
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={isLoadingDateFixtures || isLoadingValueBets}
        >
          <RefreshCw className={`h-4 w-4 ${(isLoadingDateFixtures || isLoadingValueBets) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Value Bets Grid */}
      {isLoadingDateFixtures || isLoadingValueBets ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Loading value bets...
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Fetching fixtures and value bet data for {selectedDate}
            </p>
          </CardContent>
        </Card>
      ) : filteredAndSortedBets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBets.map((valueBet: ValueBet) => {
            const fixture = valueBetFixtures.get(valueBet.fixture_id.toString());
            return (
              <ValueBetCard 
                key={`${valueBet.fixture_id}-${valueBet.predictions.bet}-${valueBet.predictions.bookmaker}`}
                valueBet={valueBet}
                name={fixture?.name}
                starting_at={fixture?.starting_at}
                participants={fixture?.participants}
              />
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
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
                : `No value betting opportunities found for ${selectedDate}. Try selecting a different date.`
              }
            </p>
            {(searchQuery || filterValue !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterValue('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {filteredAndSortedBets.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredAndSortedBets.length}</div>
                <div className="text-sm text-blue-600">Filtered Bets</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredAndSortedBets.filter(bet => bet.predictions.is_value).length}
                </div>
                <div className="text-sm text-green-600">Value Bets</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {filteredAndSortedBets.filter(bet => bet.predictions.stake > 0.1).length}
                </div>
                <div className="text-sm text-emerald-600">High Value</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredAndSortedBets.length > 0 
                    ? (filteredAndSortedBets.reduce((sum, bet) => sum + bet.predictions.stake, 0) / filteredAndSortedBets.length).toFixed(2)
                    : '0.00'
                  }
                </div>
                <div className="text-sm text-purple-600">Avg Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
