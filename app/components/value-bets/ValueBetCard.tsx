'use client';

import { useState } from 'react';
import type { ValueBet } from '../../../schemas/valuebet.schema';
import type { Team } from '@/schemas/team.schema';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FixtureTeamLink } from '@/components/ui/TeamLink';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  BookOpen,
  Percent
} from 'lucide-react';

interface ValueBetCardProps {
  valueBet: ValueBet;
  name?: string;
  starting_at?: string;
  participants?: Array<{
    name: string;
    meta: {
      location: 'home' | 'away';
    };
  }>;
  // Team objects for team linking (converted from Participant)
  homeTeam?: Team;
  awayTeam?: Team;
}

export function ValueBetCard({ valueBet, name, starting_at, participants, homeTeam: homeTeamProp, awayTeam: awayTeamProp }: ValueBetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // These props (name, starting_at, participants) are for mock/demo data compatibility
  // In real API, you may want to join fixture/team info by fixture_id
  const homeTeamName = participants?.find(p => p.meta.location === 'home')?.name || homeTeamProp?.name || 'Home';
  const awayTeamName = participants?.find(p => p.meta.location === 'away')?.name || awayTeamProp?.name || 'Away';
  
  const getValueColor = (value: number) => {
    if (value > 0.1) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
    if (value > 0.05) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
  };

  const getValueBadgeVariant = (isValue: boolean, stake: number) => {
    if (!isValue) return 'outline';
    if (stake > 0.1) return 'default';
    if (stake > 0.05) return 'secondary';
    return 'outline';
  };

  const getValueBadgeColor = (isValue: boolean, stake: number) => {
    // Not Value bets should always be neutral/gray
    if (!isValue) {
      return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600';
    }
    // Value bets get green/emerald based on stake
    if (stake > 0.1) return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-700';
    if (stake > 0.05) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-100 dark:border-green-700';
    return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {/* Always render team links if we have team props, otherwise fall back to name */}
              {(homeTeamProp || awayTeamProp) ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {homeTeamProp ? (
                    <FixtureTeamLink 
                      team={homeTeamProp}
                      fixtureId={valueBet.fixture_id?.toString()}
                      className="text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors hover:underline cursor-pointer font-semibold"
                    >
                      {homeTeamName}
                    </FixtureTeamLink>
                  ) : (
                    <span className="text-slate-900 dark:text-white">{homeTeamName}</span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400">vs</span>
                  {awayTeamProp ? (
                    <FixtureTeamLink 
                      team={awayTeamProp}
                      fixtureId={valueBet.fixture_id?.toString()}
                      className="text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors hover:underline cursor-pointer font-semibold"
                    >
                      {awayTeamName}
                    </FixtureTeamLink>
                  ) : (
                    <span className="text-slate-900 dark:text-white">{awayTeamName}</span>
                  )}
                </div>
              ) : (
                name || `${homeTeamName} vs ${awayTeamName}`
              )}
            </div>
            {starting_at && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                {new Intl.DateTimeFormat('en-GB', { 
                  timeZone: 'UTC', 
                  year: 'numeric', 
                  month: 'short', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(starting_at))}
              </div>
            )}
          </div>
          <Badge 
            variant={getValueBadgeVariant(valueBet.predictions.is_value, valueBet.predictions.stake)}
            className={`${getValueBadgeColor(valueBet.predictions.is_value, valueBet.predictions.stake)} font-medium border`}
          >
            {valueBet.predictions.is_value ? 'Value Bet' : 'Not Value'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Bet Info */}
        <div className={`border-2 rounded-xl p-4 ${getValueColor(valueBet.predictions.stake)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-600" />
              <span className="font-semibold text-slate-900 dark:text-white">Bet</span>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {valueBet.predictions.bet}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Bookmaker</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {valueBet.predictions.bookmaker}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Odds</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {valueBet.predictions.odd.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Fair Odds</div>
            <div className="font-bold text-slate-900 dark:text-white">
              {valueBet.predictions.fair_odd.toFixed(2)}
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Value</div>
            <div className="font-bold text-slate-900 dark:text-white">
              {valueBet.predictions.stake.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show Details
            </>
          )}
        </Button>
        
        {isExpanded && (
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Detailed Analysis
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Expected Value:</span>
                <Badge variant={valueBet.predictions.is_value ? 'default' : 'secondary'}>
                  {valueBet.predictions.is_value ? 'Positive' : 'Negative'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Confidence:</span>
                <Badge variant={valueBet.predictions.is_value ? 'default' : 'outline'}>
                  {valueBet.predictions.is_value ? 'High' : 'Low'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Risk Level:</span>
                <Badge 
                  variant={valueBet.predictions.stake > 0.1 ? 'destructive' : 'secondary'}
                >
                  {valueBet.predictions.stake > 0.1 ? 'High' : 'Medium'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Value Percentage:</span>
                <div className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  <span className="font-medium">
                    {(valueBet.predictions.stake * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Status */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className={`text-xs font-medium ${valueBet.predictions.is_value ? 'text-green-600' : 'text-slate-500'}`}>
            {valueBet.predictions.is_value ? '✅ Profitable Value Bet' : '❌ Not a Value Bet'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 