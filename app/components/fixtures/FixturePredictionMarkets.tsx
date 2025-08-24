'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prediction } from '@/schemas/predictions.schema';

/**
 * Represents a single prediction option with its code and probability value
 */
interface PredictionOption {
  /** The option code (e.g., '1', 'X', '2', 'Yes', 'No') */
  code: string;
  /** The probability value as a percentage (0-100) or null if not available */
  value: number | null;
}

/**
 * Represents a prediction market with multiple options
 */
interface PredictionMarket {
  /** Unique identifier for the market */
  key: string;
  /** Human-readable label for the market */
  label: string;
  /** Array of prediction options for this market */
  options: PredictionOption[];
}

/**
 * Props for the FixturePredictionMarkets component
 */
interface FixturePredictionMarketsProps {
  /** Array of prediction data from the API */
  predictions: Prediction[];
  /** Optional CSS class name for styling */
  className?: string;
  /** Layout variant - mobile for compact layout, desktop for expanded layout */
  variant?: 'mobile' | 'desktop';
}

/**
 * FixturePredictionMarkets Component
 * 
 * A responsive component that displays prediction markets for football fixtures.
 * Supports multiple market types including 1X2, Both Teams to Score, Over/Under,
 * Double Chance, and Correct Score predictions.
 * 
 * Features:
 * - Responsive design with mobile and desktop variants
 * - Search functionality for markets and options
 * - Popover-based market selection
 * - Cached search results for performance
 * - Smooth animations and transitions
 * - Accessibility features (ARIA labels, keyboard navigation)
 * 
 * @param props - Component props
 * @param props.predictions - Array of prediction data from the API
 * @param props.className - Optional CSS class name for styling
 * @param props.variant - Layout variant ('mobile' | 'desktop')
 * 
 * @example
 * ```tsx
 * <FixturePredictionMarkets 
 *   predictions={fixture.predictions} 
 *   variant="desktop" 
 *   className="my-custom-class" 
 * />
 * ```
 */
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  // Performance monitoring
  const renderStartTime = useRef<number>(0);
  const searchCount = useRef<number>(0);
  const cacheHitCount = useRef<number>(0);
  
  // Search result caching
  const searchCache = useRef<Map<string, PredictionMarket[]>>(new Map());
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  const cacheTimestamps = useRef<Map<string, number>>(new Map());
  
  /**
   * Performs cached search on prediction markets
   * @param query - Search query string
   * @param items - Array of prediction markets to search
   * @returns Filtered array of markets matching the query
   */
  const getCachedSearchResults = (query: string, items: PredictionMarket[]): PredictionMarket[] => {
    searchCount.current++;
    const cacheKey = `${query}-${items.length}`;
    const now = Date.now();
    const timestamp = cacheTimestamps.current.get(cacheKey);
    
    // Check if cache is valid
    if (timestamp && (now - timestamp) < CACHE_EXPIRY) {
      const cached = searchCache.current.get(cacheKey);
      if (cached) {
        cacheHitCount.current++;
        return cached;
      }
    }
    
    // Perform search and cache results
    const results = items.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    
    searchCache.current.set(cacheKey, results);
    cacheTimestamps.current.set(cacheKey, now);
    
    return results;
  };

  /**
   * Process raw prediction data into organized markets
   * Supports multiple market types: 1X2, BTTS, Over/Under, Double Chance, Correct Score
   */
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
        } else if (typeName.includes('over') || typeCode.includes('over')) {
          map['overunder'] = {
            key: 'overunder',
            label: prediction.type?.name || 'Over/Under',
            options: [
              { code: 'Over', value: pred.yes },
              { code: 'Under', value: pred.no },
            ],
          };
        } else if (typeName.includes('clean sheet') || typeCode.includes('clean-sheet')) {
          map['cleansheet'] = {
            key: 'cleansheet',
            label: prediction.type?.name || 'Clean Sheet',
            options: [
              { code: 'Yes', value: pred.yes },
              { code: 'No', value: pred.no },
            ],
          };
        } else if (typeName.includes('win to nil') || typeCode.includes('win-to-nil')) {
          map['wintonil'] = {
            key: 'wintonil',
            label: prediction.type?.name || 'Win to Nil',
            options: [
              { code: 'Yes', value: pred.yes },
              { code: 'No', value: pred.no },
            ],
          };
        }
      }
      
      // Half Time/Full Time predictions
      else if (pred && typeof pred === 'object' && 'home_home' in pred && 'away_away' in pred && 'draw_draw' in pred) {
        const htft = pred as { 
          home_home: number | null; home_away: number | null; home_draw: number | null;
          away_home: number | null; away_away: number | null; away_draw: number | null;
          draw_draw: number | null; draw_home: number | null; draw_away: number | null;
        };
        map['htft'] = {
          key: 'htft',
          label: prediction.type?.name || 'Half Time/Full Time',
          options: [
            { code: '1/1', value: htft.home_home },
            { code: '1/X', value: htft.home_draw },
            { code: '1/2', value: htft.home_away },
            { code: 'X/1', value: htft.draw_home },
            { code: 'X/X', value: htft.draw_draw },
            { code: 'X/2', value: htft.draw_away },
            { code: '2/1', value: htft.away_home },
            { code: '2/X', value: htft.away_draw },
            { code: '2/2', value: htft.away_away },
          ],
        };
      }
      
      // Correct score predictions
      else if (pred && typeof pred === 'object' && 'scores' in pred && 'score' in pred) {
        const scorePred = pred as { scores: Record<string, number>; score: Record<string, number> };
        
        // Use the scores object for display
        const scoreOptions = Object.entries(scorePred.scores)
          .filter(([, value]) => value !== null)
          .sort(([, a], [, b]) => (b || 0) - (a || 0))
          .slice(0, 8) // Limit to top 8 scores
          .map(([key, value]) => ({
            code: key,
            value
          }));
        
        if (scoreOptions.length > 0) {
          map['correctscore'] = {
            key: 'correctscore',
            label: prediction.type?.name || 'Correct Score',
            options: scoreOptions,
          };
        }
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

  // Calculate popover position with improved positioning logic
  useEffect(() => {
    if (marketOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popoverWidth = 256; // w-64 = 16rem = 256px
      const popoverHeight = 320; // max-h-80 = 20rem = 320px
      
      // Calculate if popover would go off-screen to the right
      const wouldGoOffScreenRight = rect.left + popoverWidth > viewportWidth - 16;
      
      // Calculate if popover would go off-screen to the bottom
      const wouldGoOffScreenBottom = rect.bottom + popoverHeight > viewportHeight - 16;
      
      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + 4;
      
      // Adjust horizontal position - prefer right alignment if possible
      if (wouldGoOffScreenRight) {
        left = rect.right + window.scrollX - popoverWidth;
      }
      
      // Adjust vertical position if it would go off-screen at the bottom
      if (wouldGoOffScreenBottom) {
        top = rect.top + window.scrollY - popoverHeight - 4;
      }
      
      // Ensure popover doesn't go off-screen to the left
      if (left < 16) {
        left = 16;
      }
      
      // Ensure popover doesn't go off-screen to the top
      if (top < 16) {
        top = 16;
      }
      
      // Ensure popover doesn't go off-screen to the right
      if (left + popoverWidth > viewportWidth - 16) {
        left = viewportWidth - popoverWidth - 16;
      }
      
      // Ensure popover doesn't go off-screen to the right
      if (left + popoverWidth > viewportWidth - 16) {
        left = viewportWidth - popoverWidth - 16;
      }
      
      setPopoverPosition({ top, left });
    }
  }, [marketOpen]);

  // Close popover when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsTransitioning(true);
        setMarketOpen(false);
        setMarketFilter(''); // Clear search when closing
        setTimeout(() => setIsTransitioning(false), 200); // Match animation duration
      }
      if (moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) {
        setIsTransitioning(true);
        setShowMorePopover(false);
        setOptionFilter(''); // Clear search when closing
        setTimeout(() => setIsTransitioning(false), 200); // Match animation duration
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTransitioning(true);
        setMarketOpen(false);
        setShowMorePopover(false);
        setMarketFilter('');
        setOptionFilter('');
        setTimeout(() => setIsTransitioning(false), 200); // Match animation duration
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

  // Performance monitoring - track render time
  useEffect(() => {
    renderStartTime.current = performance.now();
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 16) { // Log slow renders (>16ms = 60fps)
        console.warn(`FixturePredictionMarkets render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  if (!marketsMap || Object.keys(marketsMap).length === 0) {
    return null;
  }

  const selectedMarket = marketsMap[selectedMarketKey];
  const options = selectedMarket?.options || [];

  /**
   * Market selection popover component
   * Renders a searchable list of available prediction markets
   */
  const MarketPopover = () => {
    if (!marketOpen) return null;

    const filteredMarkets = getCachedSearchResults(marketFilter, Object.values(marketsMap));

    return createPortal(
      <div 
        className={cn(
          "fixed z-[9999] w-64 max-w-[calc(100vw-2rem)] max-h-80 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg transition-all duration-200",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
        style={{
          top: popoverPosition.top,
          left: popoverPosition.left,
        }}
      >
        {/* Search header - always visible */}
        <div className="p-1.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-md">
          <input
            type="text"
            value={marketFilter}
            onChange={e => setMarketFilter(e.target.value)}
            placeholder="Search markets..."
            className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        {/* Scrollable content area */}
        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
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
        </div>
      </div>,
      document.body
    );
  };

  /**
   * More options popover component
   * Displays additional prediction options when there are many available
   */
  const MoreOptionsPopover = () => {
    if (!showMorePopover || !moreButtonRef.current) return null;

    const rect = moreButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popoverWidth = 256; // w-64 = 16rem = 256px
    const popoverHeight = 320; // max-h-80 = 20rem = 320px
    
    // Calculate if popover would go off-screen to the right
    const wouldGoOffScreenRight = rect.left + popoverWidth > viewportWidth - 16;
    
    // Calculate if popover would go off-screen to the bottom
    const wouldGoOffScreenBottom = rect.bottom + popoverHeight > viewportHeight - 16;
    
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 4;
    
    // Adjust horizontal position
    if (wouldGoOffScreenRight) {
      left = rect.right + window.scrollX - popoverWidth;
    }
    
    // Adjust vertical position if it would go off-screen at the bottom
    if (wouldGoOffScreenBottom) {
      top = rect.top + window.scrollY - popoverHeight - 4;
    }
    
    // Ensure popover doesn't go off-screen to the left
    if (left < 16) {
      left = 16;
    }
    
    // Ensure popover doesn't go off-screen to the top
    if (top < 16) {
      top = 16;
    }
    
    const restOptions = options
      .filter(opt => opt.value !== null)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(3);

    const filteredOptions = restOptions.filter(opt => opt.code.toLowerCase().includes(optionFilter.toLowerCase()));

    return createPortal(
      <div 
        className={cn(
          "fixed z-[9999] w-64 max-w-[calc(100vw-2rem)] max-h-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg transition-all duration-200",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
        style={{
          top,
          left
        }}
      >
        {/* Search header - always visible */}
        <div className="p-1.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-md">
          <input
            type="text"
            value={optionFilter}
            onChange={e => setOptionFilter(e.target.value)}
            placeholder="Search options..."
            className="w-full px-2 py-1 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        {/* Scrollable content area */}
        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 p-1.5">
          {filteredOptions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {filteredOptions.map((opt) => (
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
          ) : (
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
            // For markets with more than 3 options, show top 3 + expand option
            if (options.length > 3) {
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
            
            // For markets with 3 or fewer options, show all
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
