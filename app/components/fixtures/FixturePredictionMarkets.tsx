'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

interface FixturePredictionMarketsProps {
  predictions: Prediction[];
  className?: string;
  variant?: 'mobile' | 'desktop';
}

export function FixturePredictionMarkets({ 
  predictions, 
  className, 
  variant = 'desktop' 
}: FixturePredictionMarketsProps) {
  const [selectedMarketKey, setSelectedMarketKey] = useState<string>('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState('');
  const [optionFilter, setOptionFilter] = useState('');
  const [showMorePopover, setShowMorePopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

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

  // Calculate popover position
  useEffect(() => {
    if (marketOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popoverWidth = 256; // w-64 = 16rem = 256px
      
      // Calculate if popover would go off-screen to the right
      const wouldGoOffScreen = rect.left + popoverWidth > viewportWidth - 16; // 16px margin
      
      setPopoverPosition({
        top: rect.bottom + window.scrollY + 4,
        left: wouldGoOffScreen 
          ? rect.right + window.scrollX - popoverWidth // Position to the left of button
          : rect.left + window.scrollX // Position to the right of button
      });
    }
  }, [marketOpen]);

  // Close popover when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setMarketOpen(false);
        setMarketFilter(''); // Clear search when closing
      }
      if (moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) {
        setShowMorePopover(false);
        setOptionFilter(''); // Clear search when closing
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMarketOpen(false);
        setShowMorePopover(false);
        setMarketFilter('');
        setOptionFilter('');
      }
    };

    if (marketOpen || showMorePopover) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [marketOpen, showMorePopover]);

  // Clear search filters when popovers close
  useEffect(() => {
    if (!marketOpen) {
      setMarketFilter('');
    }
  }, [marketOpen]);

  useEffect(() => {
    if (!showMorePopover) {
      setOptionFilter('');
    }
  }, [showMorePopover]);

  if (!marketsMap || Object.keys(marketsMap).length === 0) {
    return null;
  }

  const selectedMarket = marketsMap[selectedMarketKey];
  const options = selectedMarket?.options || [];

  // Popover component for market selection
  const MarketPopover = () => {
    if (!marketOpen) return null;

    const filteredMarkets = Object.values(marketsMap)
      .filter(m => m.label.toLowerCase().includes(marketFilter.toLowerCase()));

    return createPortal(
      <div 
        className="fixed z-[9999] w-64 max-w-[calc(100vw-2rem)] max-h-80 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto"
        style={{
          top: popoverPosition.top,
          left: popoverPosition.left,
        }}
      >
        <div className="p-1.5 border-b border-gray-100 dark:border-gray-700">
          <input
            type="text"
            value={marketFilter}
            onChange={e => setMarketFilter(e.target.value)}
            placeholder="Search markets..."
            className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((m) => (
            <button
              type="button"
              key={m.key}
              className={cn(
                'w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 truncate transition-colors',
                selectedMarketKey === m.key && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              )}
              onClick={() => { 
                setSelectedMarketKey(m.key); 
                setMarketOpen(false); 
                setMarketFilter(''); // Clear search when selecting
              }}
              title={m.label}
            >
              {m.label}
            </button>
          ))
        ) : (
          <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
            No markets found
          </div>
        )}
      </div>,
      document.body
    );
  };

  // More options popover component
  const MoreOptionsPopover = () => {
    if (!showMorePopover || !moreButtonRef.current) return null;

    const rect = moreButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const popoverWidth = 256; // w-64 = 16rem = 256px
    
    // Calculate if popover would go off-screen to the right
    const wouldGoOffScreen = rect.left + popoverWidth > viewportWidth - 16; // 16px margin
    
    const restOptions = options
      .filter(opt => opt.value !== null)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(3);

    return createPortal(
      <div 
        className="fixed z-[9999] w-64 max-w-[calc(100vw-2rem)] max-h-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg overflow-y-auto"
        style={{
          top: rect.bottom + window.scrollY + 4,
          left: wouldGoOffScreen 
            ? rect.right + window.scrollX - popoverWidth // Position to the left of button
            : rect.left + window.scrollX // Position to the right of button
        }}
      >
        <div className="p-1.5 border-b border-gray-100 dark:border-gray-700">
          <input
            type="text"
            value={optionFilter}
            onChange={e => setOptionFilter(e.target.value)}
            placeholder="Search options..."
            className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="p-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {restOptions
              .filter(opt => opt.code.toLowerCase().includes(optionFilter.toLowerCase()))
              .map((opt) => (
                <Button
                  key={opt.code}
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 py-2 text-center border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-300">{opt.code}</span>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                    </span>
                  </div>
                </Button>
              ))}
          </div>
          {restOptions.filter(opt => opt.code.toLowerCase().includes(optionFilter.toLowerCase())).length === 0 && (
            <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
              No options found
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  if (variant === 'mobile') {
    return (
      <div className={cn("mt-3", className)}>
        {/* Row 1: Title and Dropdown Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-900 dark:text-gray-300">
            <span 
              className="inline-block cursor-help" 
              title={selectedMarket?.label || 'No predictions available'}
              aria-label={`Market: ${selectedMarket?.label || 'No predictions available'}`}
            >
              {selectedMarket?.label || 'No predictions available'}
            </span>
          </div>
          {Object.keys(marketsMap).length > 1 && (
            <div className="relative shrink-0">
              <Button 
                ref={buttonRef}
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={() => setMarketOpen((v) => !v)}
              >
                More
                <ChevronDown className={cn('ml-1 h-3 w-3 text-gray-600 dark:text-gray-400 transition-transform', marketOpen && 'rotate-180')} />
              </Button>
            </div>
          )}
        </div>
        
        {/* Row 2: Prediction Buttons */}
        <div className="flex gap-1.5 overflow-x-auto">
          {options.map((opt) => (
            <Button
              key={opt.code}
              variant="outline"
              size="sm"
              className="h-10 px-3 py-2 text-center shrink-0 min-w-[4.5rem] cursor-help border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`${opt.code}: ${opt.value != null ? `${Number(opt.value).toFixed(1)}%` : 'No data'}`}
              aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(1)}%` : 'No data'}`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className="text-[10px] font-medium text-gray-900 dark:text-gray-300 leading-tight">{opt.code}</div>
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-tight">
                  {opt.value != null ? `${Number(opt.value).toFixed(1)}%` : '-'}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Render popovers */}
        <MarketPopover />
      </div>
    );
  }

  // Desktop variant
  return (
    <div className={cn("space-y-1", className)}>
      {/* Market description */}
      <div 
        className="text-[12px] text-gray-900 dark:text-gray-300 cursor-help"
        title={selectedMarket?.label || 'No predictions available'}
        aria-label={`Market: ${selectedMarket?.label || 'No predictions available'}`}
      >
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
              return (
                <>
                  {topOptions.map((opt) => (
                    <Button
                      key={opt.code}
                      variant="outline"
                      size="sm"
                      className="h-10 px-3 py-2 text-center min-w-0 flex-1 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-300">{opt.code}</span>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                        </span>
                      </div>
                    </Button>
                  ))}
                  <Button
                    ref={moreButtonRef}
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 py-2 text-center relative border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowMorePopover((v) => !v)}
                    aria-label="Show more options"
                  >
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-300">+{options.length - 3} more</span>
                  </Button>
                </>
              );
            }
            
            // For markets with 6 or fewer options, show all
            return options.map((opt) => (
              <Button
                key={opt.code}
                variant="outline"
                size="sm"
                className="h-10 px-3 py-2 text-center min-w-0 flex-1 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-300">{opt.code}</span>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                  </span>
                </div>
              </Button>
            ));
          })()}
        </div>

        {/* Market selector dropdown */}
        {Object.keys(marketsMap).length > 1 && (
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setMarketOpen((v) => !v)}
              aria-label="Select prediction market"
              aria-expanded={marketOpen}
            >
              <ChevronDown className={cn('h-3 w-3 text-gray-600 dark:text-gray-400 transition-transform', marketOpen && 'rotate-180')} />
            </Button>
          </div>
        )}
      </div>

      {/* Render popovers */}
      <MarketPopover />
      <MoreOptionsPopover />
    </div>
  );
}
