'use client';

import { useState, useMemo } from 'react';
import { ValueBetCard } from '../components/value-bets/ValueBetCard';
import { ValueBet } from '@/schemas/valuebet.schema';
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
  RefreshCw
} from 'lucide-react';

interface ValueBetsClientProps {
  valueBets: ValueBet[];
}

export function ValueBetsClient({ valueBets }: ValueBetsClientProps) {
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

  return (
    <div className="space-y-8">
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
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Value Bets Grid */}
      {filteredAndSortedBets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBets.map((valueBet: ValueBet) => (
            <ValueBetCard 
              key={valueBet.fixture_id} 
              valueBet={valueBet} 
            />
          ))}
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
                : 'Check back later for updated value betting opportunities'
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
