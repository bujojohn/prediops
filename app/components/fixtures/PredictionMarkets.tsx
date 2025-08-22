'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prediction } from '@/schemas/predictions.schema';

interface PredictionOption {
  code: string;
  value: number | null;
}

interface PredictionMarket {
  key: string;
  label: string;
  options: PredictionOption[];
}

interface PredictionMarketsProps {
  predictions: Prediction[];
  className?: string;
  variant?: 'compact' | 'desktop' | 'mobile';
}

export function PredictionMarkets({ predictions, className, variant = 'desktop' }: PredictionMarketsProps) {
  const [selectedMarketKey, setSelectedMarketKey] = useState<string>('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState('');
  const [showMorePopover, setShowMorePopover] = useState(false);

  // Process predictions into markets
  const marketsMap = useMemo(() => {
    const map: Record<string, PredictionMarket> = {};
    
    predictions.forEach((prediction) => {
      const pred = prediction.predictions;
      const typeName = prediction.type?.name?.toLowerCase() || '';
      const typeCode = prediction.type?.code?.toLowerCase() || '';

      // Helper function to check if prediction has yes/no structure
      const isYesNoPred = (p: unknown): p is { yes: number | null; no: number | null } => {
        return p !== null && typeof p === 'object' && 'yes' in p && 'no' in p;
      };

      // Three-way predictions (1X2, etc.)
      if (pred && typeof pred === 'object' && 'home' in pred && 'away' in pred && 'draw' in pred) {
        const threeWay = pred as { home: number | null; away: number | null; draw: number | null };
        
        if (typeName.includes('fulltime result') || typeCode.includes('fulltime-result')) {
          map['1x2'] = {
            key: '1x2',
            label: prediction.type?.name || 'Fulltime Result',
            options: [
              { code: '1', value: threeWay.home },
              { code: 'X', value: threeWay.draw },
              { code: '2', value: threeWay.away },
            ],
          };
        } else if (typeName.includes('first half winner') || typeCode.includes('first-half-winner')) {
          map['firsthalf'] = {
            key: 'firsthalf',
            label: prediction.type?.name || 'First Half Winner',
            options: [
              { code: '1', value: threeWay.home },
              { code: 'X', value: threeWay.draw },
              { code: '2', value: threeWay.away },
            ],
          };
        } else if (typeName.includes('team to score first') || typeCode.includes('team_to_score_first')) {
          map['teamscorefirst'] = {
            key: 'teamscorefirst',
            label: prediction.type?.name || 'Team To Score First',
            options: [
              { code: '1', value: threeWay.home },
              { code: 'X', value: threeWay.draw },
              { code: '2', value: threeWay.away },
            ],
          };
        }
      }
      
      // Yes/No predictions (BTTS, Over/Under, etc.)
      else if (isYesNoPred(pred)) {
        if (typeName.includes('both teams to score') || typeCode.includes('both-teams-to-score')) {
          map['btts'] = {
            key: 'btts',
            label: prediction.type?.name || 'Both Teams To Score',
            options: [
              { code: 'Yes', value: pred.yes },
              { code: 'No', value: pred.no },
            ],
          };
        }
        // Add other yes/no markets as needed...
      }
      
      // Add more market types as needed...
    });
    
    return map;
  }, [predictions]);

  // Set default selected market
  useMemo(() => {
    if (!selectedMarketKey && Object.keys(marketsMap).length > 0) {
      setSelectedMarketKey(Object.keys(marketsMap)[0]);
    }
  }, [marketsMap, selectedMarketKey]);

  if (!marketsMap || Object.keys(marketsMap).length === 0) {
    return null;
  }

  const selectedMarket = marketsMap[selectedMarketKey];
  const options = selectedMarket?.options || [];

  if (variant === 'mobile') {
    return (
      <div className={cn("mt-3", className)}>
        <div className="flex items-start gap-2 flex-wrap">
          <div className="text-sm font-medium text-gray-700 shrink-0" title={selectedMarket?.label || 'No predictions available'}>
            <span className="inline-block max-w-[8rem] truncate">{selectedMarket?.label || 'No predictions available'}</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {options.map((opt) => (
              <div key={opt.code} className="bg-gray-50 rounded-md p-2 text-center border min-w-0 overflow-hidden">
                <div className="text-xs text-gray-600 mb-1 truncate">{opt.code}</div>
                <div className="text-sm font-semibold text-blue-600">
                  {opt.value != null ? `${Number(opt.value).toFixed(1)}%` : '-'}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(marketsMap).length > 1 && (
            <div className="relative shrink-0 ml-auto">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setMarketOpen((v) => !v)}>
                More
                <ChevronDown className={cn('ml-1 h-3 w-3 transition-transform', marketOpen && 'rotate-180')} />
              </Button>
              {marketOpen && (
                <div className="absolute right-0 mt-1 w-[calc(100vw-2rem)] sm:w-60 max-w-[calc(100vw-2rem)] max-h-60 rounded-md border bg-white shadow-md z-10 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={marketFilter}
                      onChange={e => setMarketFilter(e.target.value)}
                      placeholder="Search markets..."
                      className="w-full px-2 py-1 text-xs rounded bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none"
                    />
                  </div>
                  {Object.values(marketsMap)
                    .filter(m => m.label.toLowerCase().includes(marketFilter.toLowerCase()))
                    .map((m) => (
                      <button
                        type="button"
                        key={m.key}
                        className={cn('w-full text-left px-3 py-2 text-sm hover:bg-gray-50', selectedMarketKey === m.key && 'bg-gray-50')}
                        onClick={() => { setSelectedMarketKey(m.key); setMarketOpen(false); }}
                      >
                        {m.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop/Compact variant
  return (
    <div className={cn("space-y-1", className)}>
      {/* Market description */}
      <div className="text-[12px] text-gray-700 dark:text-gray-300 truncate">
        {selectedMarket?.label || 'No predictions available'}
      </div>
      
      {/* Prediction buttons with market selector */}
      <div className="flex items-center gap-1 flex-wrap">
        <div className="flex gap-1 flex-1 relative flex-wrap">
          {(() => {
            // For markets with many options, show top 3 + expand option
            if (options.length > 6) {
              const topOptions = options
                .filter(opt => opt.value !== null)
                .sort((a, b) => (b.value || 0) - (a.value || 0))
                .slice(0, 3);
              const restOptions = options
                .filter(opt => opt.value !== null)
                .sort((a, b) => (b.value || 0) - (a.value || 0))
                .slice(3);
              return (
                <>
                  {topOptions.map((opt) => (
                    <Button
                      key={opt.code}
                      variant="outline"
                      size="sm"
                      className="h-6 px-1 sm:px-2 text-[10px] sm:text-[12px] min-w-0 flex-1"
                      aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                    >
                      <span className="font-medium">{opt.code}</span>
                      <span className="ml-1 text-blue-600">
                        {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                      </span>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-1 sm:px-2 text-[10px] sm:text-[12px] relative"
                    onClick={() => setShowMorePopover((v) => !v)}
                    aria-label="Show more options"
                  >
                    +{options.length - 3} more
                  </Button>
                  {showMorePopover && (
                    <div className="absolute top-full right-0 z-50 w-[calc(100vw-2rem)] sm:w-56 max-w-[calc(100vw-2rem)] max-h-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-2 overflow-y-auto">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {restOptions.map((opt) => (
                          <Button
                            key={opt.code}
                            variant="outline"
                            size="sm"
                            className="h-6 px-1 text-[10px]"
                            aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                          >
                            <span className="font-medium">{opt.code}</span>
                            <span className="ml-1 text-blue-600">
                              {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            }
            
            // For markets with 6 or fewer options, show all
            return options.map((opt) => (
              <Button
                key={opt.code}
                variant="outline"
                size="sm"
                className="h-6 px-1 sm:px-2 text-[10px] sm:text-[12px] min-w-0 flex-1"
                aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
              >
                <span className="font-medium">{opt.code}</span>
                <span className="ml-1 text-blue-600">
                  {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                </span>
              </Button>
            ));
          })()}
        </div>

        {/* Market selector dropdown */}
        {Object.keys(marketsMap).length > 1 && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setMarketOpen((v) => !v)}
              aria-label="Select prediction market"
              aria-expanded={marketOpen}
            >
              <ChevronDown className={cn('h-3 w-3 text-gray-700 dark:text-gray-300 transition-transform', marketOpen && 'rotate-180')} />
            </Button>
            {marketOpen && (
              <div className="absolute right-0 mt-1 w-[calc(100vw-2rem)] sm:w-60 max-w-[calc(100vw-2rem)] max-h-60 rounded-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-md z-10 overflow-y-auto">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    value={marketFilter}
                    onChange={e => setMarketFilter(e.target.value)}
                    placeholder="Search markets..."
                    className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none"
                  />
                </div>
                {Object.values(marketsMap)
                  .filter(m => m.label.toLowerCase().includes(marketFilter.toLowerCase()))
                  .map((m) => (
                    <button
                      type="button"
                      key={m.key}
                      className={cn('w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100', selectedMarketKey === m.key && 'bg-gray-50 dark:bg-gray-700')}
                      onClick={() => { setSelectedMarketKey(m.key); setMarketOpen(false); }}
                    >
                      {m.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
