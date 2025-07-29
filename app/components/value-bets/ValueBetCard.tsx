'use client';

import { useState } from 'react';
import type { ValueBet } from '../../../schemas/valuebet.schema';

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
}

export function ValueBetCard({ valueBet, name, starting_at, participants }: ValueBetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // These props (name, starting_at, participants) are for mock/demo data compatibility
  // In real API, you may want to join fixture/team info by fixture_id
  const homeTeam = participants?.find(p => p.meta.location === 'home')?.name || 'Home';
  const awayTeam = participants?.find(p => p.meta.location === 'away')?.name || 'Away';
  
  const getValueColor = (value: number) => {
    if (value > 0.1) return 'text-green-600 bg-green-50 border-green-200';
    if (value > 0.05) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div 
      className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">
          {name || `${homeTeam} vs ${awayTeam}`}
        </h3>
        {starting_at && (
          <span className="text-xs text-gray-500">
            {new Date(starting_at).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <div className={`border rounded-lg p-3 mb-3 ${getValueColor(valueBet.predictions.stake)}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Bet</span>
          <span className="font-bold">{valueBet.predictions.bet}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Bookmaker:</span>
            <div className="font-semibold">{valueBet.predictions.bookmaker}</div>
          </div>
          <div>
            <span className="text-gray-600">Odds:</span>
            <div className="font-semibold">{valueBet.predictions.odd.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-600">Fair Odd:</span>
            <div className="font-semibold">{valueBet.predictions.fair_odd.toFixed(2)}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div>
            <span className="text-gray-600">Stake:</span>
            <div className="font-semibold">{valueBet.predictions.stake}</div>
          </div>
          <div>
            <span className="text-gray-600">Value:</span>
            <div className="font-semibold">{valueBet.predictions.is_value ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">Detailed Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Value:</span>
              <span className="font-medium">
                {valueBet.predictions.is_value ? 'Positive' : 'Negative'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium">
                {valueBet.predictions.is_value ? 'High' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className="font-medium">
                {valueBet.predictions.stake > 0.1 ? 'High' : 'Medium'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <span className="text-xs text-gray-500">
          {valueBet.predictions.is_value ? 'Profitable Value Bet' : 'Not a Value Bet'}
        </span>
      </div>
    </div>
  );
} 