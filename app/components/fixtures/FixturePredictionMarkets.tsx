/**
 * Fixture Prediction Markets Component
 * 
 * This component displays prediction markets for football fixtures with dynamic styling
 * based on prediction accuracy. It supports multiple market types and provides a
 * searchable dropdown for market selection.
 * 
 * Key Features:
 * - Dynamic market mapping for all prediction types from SportMonks API
 * - Visual styling based on prediction success (green/red/blue themes)
 * - Responsive design with mobile and desktop variants
 * - Searchable market dropdown
 * - Real-time status updates for live matches
 * 
 * @author Prediops Team
 * @version 1.0.0
 */

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prediction } from '@/schemas/predictions.schema';
import type { Fixture } from '@/schemas/fixture.schema';
import { getPredictionButtonStyle } from '@/lib/utils/prediction-status';

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
  /** The source prediction this market is derived from (used for status styling) */
  sourcePrediction?: Prediction;
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
  /** Optional fixture for live/finished status-based styling */
  fixture?: Fixture;
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
  variant = 'desktop',
  fixture
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
   * 
   * This function dynamically maps all prediction types from the SportMonks API into
   * a standardized format. It handles various prediction structures:
   * - Three-way predictions (1X2, First Half Winner, etc.)
   * - Yes/No predictions (BTTS, Over/Under, Clean Sheet, etc.)
   * - Half Time/Full Time predictions
   * - Correct Score predictions
   * - Any other prediction structure dynamically
   * 
   * The function creates unique keys for each market and preserves the original
   * prediction data for styling calculations.
   * 
   * @returns Record mapping market keys to PredictionMarket objects
   */
  const marketsMap = useMemo(() => {
    const map: Record<string, PredictionMarket> = {};
    
    if (process.env.NODE_ENV === 'development' && predictions.length > 0) {
      console.log(`[FixturePredictionMarkets] Processing ${predictions.length} predictions for fixture ${fixture?.id}`);
    }
    
    predictions.forEach((prediction, index) => {
      const pred = prediction.predictions;
      const typeName = prediction.type?.name || 'Unknown Market';
      const typeCode = prediction.type?.code || '';
      
      // Generate a unique key for this market
      const marketKey = typeCode || typeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Debug first few predictions
      if (process.env.NODE_ENV === 'development' && index < 3) {
        console.log(`[FixturePredictionMarkets] Prediction ${index}:`, {
          typeId: prediction.type_id,
          typeName,
          predStructure: pred ? Object.keys(pred) : null,
          hasHome: pred && 'home' in pred,
          hasYes: pred && 'yes' in pred,
        });
      }
      
      // Helper function to check if prediction has yes/no structure
      const isYesNoPred = (p: unknown): p is { yes: number | null; no: number | null } => {
        return p !== null && typeof p === 'object' && 'yes' in p && 'no' in p;
      };

      // Three-way predictions (1X2, First Half Winner, etc.)
      if (pred && typeof pred === 'object' && 'home' in pred && 'away' in pred && 'draw' in pred) {
        const threeWay = pred as { home: number | null; away: number | null; draw: number | null };
        
        map[marketKey] = {
          key: marketKey,
          label: typeName,
          options: [
            { code: '1', value: threeWay.home },
            { code: 'X', value: threeWay.draw },
            { code: '2', value: threeWay.away },
          ],
          sourcePrediction: prediction,
        };
      }
      
      // Yes/No predictions (BTTS, Over/Under, Clean Sheet, etc.)
      else if (isYesNoPred(pred)) {
        map[marketKey] = {
          key: marketKey,
          label: typeName,
          options: [
            { code: 'Yes', value: pred.yes },
            { code: 'No', value: pred.no },
          ],
          sourcePrediction: prediction,
        };
      }
      
      // Half Time/Full Time predictions
      else if (pred && typeof pred === 'object' && 'home_home' in pred && 'away_away' in pred && 'draw_draw' in pred) {
        const htft = pred as { 
          home_home: number | null; home_away: number | null; home_draw: number | null;
          away_home: number | null; away_away: number | null; away_draw: number | null;
          draw_draw: number | null; draw_home: number | null; draw_away: number | null;
        };
        
        map[marketKey] = {
          key: marketKey,
          label: typeName,
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
          sourcePrediction: prediction,
        };
      }
      
      // Correct score predictions
      else if (pred && typeof pred === 'object' && 'scores' in pred) {
        const scorePred = pred as { scores: Record<string, number> };
        
        // Use the scores object for display
        const scoreOptions = Object.entries(scorePred.scores)
          .filter(([, value]) => value !== null && value !== undefined)
          .sort(([, a], [, b]) => (b || 0) - (a || 0))
          .slice(0, 8) // Limit to top 8 scores
          .map(([key, value]) => ({
            code: key,
            value
          }));
        
        if (scoreOptions.length > 0) {
          map[marketKey] = {
            key: marketKey,
            label: typeName,
            options: scoreOptions,
            sourcePrediction: prediction,
          };
        }
      }
      
      // Handle any other prediction structure dynamically
      else if (pred && typeof pred === 'object') {
        const options = Object.entries(pred as Record<string, number | null>)
          .filter(([, value]) => value !== null && value !== undefined)
          .sort(([, a], [, b]) => (b || 0) - (a || 0))
          .slice(0, 10) // Limit to top 10 options
          .map(([key, value]) => ({
            code: key,
            value
          }));
        
        if (options.length > 0) {
          map[marketKey] = {
            key: marketKey,
            label: typeName,
            options,
            sourcePrediction: prediction,
          };
        }
      }
    });
    
    return map;
  }, [predictions]);

  // Set default selected market; prefer Full Time Result if available
  useMemo(() => {
    if (!selectedMarketKey && Object.keys(marketsMap).length > 0) {
      // Look for Full Time Result market by name or code
      const ftrMarket = Object.values(marketsMap).find(market => 
        market.label.toLowerCase().includes('full time result') ||
        market.label.toLowerCase().includes('fulltime result') ||
        market.key === '1x2' ||
        market.key === 'fulltime_result'
      );
      
      const preferred = ftrMarket ? ftrMarket.key : Object.keys(marketsMap)[0];
      setSelectedMarketKey(preferred);
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
    // Debug: Log why predictions aren't showing (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[FixturePredictionMarkets] No markets to display:', {
        predictions: predictions?.length || 0,
        marketsMap: marketsMap ? Object.keys(marketsMap).length : 0,
        fixtureId: fixture?.id,
        samplePrediction: predictions?.[0] ? {
          typeId: predictions[0].type_id,
          typeName: predictions[0].type?.name,
          predictions: predictions[0].predictions
        } : null
      });
    }
    
    // Return null (old behavior) - no fallback UI
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
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={() => setMarketOpen((v) => !v)}
              >
                Market
                <ChevronDown className={cn('ml-1 h-3 w-3 text-gray-600 dark:text-gray-400 transition-transform', marketOpen && 'rotate-180')} />
              </Button>
            </div>
          )}
        </div>
        
        {/* Row 2: Prediction Buttons */}
        <div className="flex gap-1.5 overflow-x-auto">
          {options.map((opt) => {
            const mkt = selectedMarket;
            const style = fixture && mkt?.sourcePrediction
              ? getPredictionButtonStyle(mkt.sourcePrediction, fixture, opt.code, opt.value)
              : null;
            const bg = style?.backgroundColor ?? 'bg-white dark:bg-transparent';
            const txt = style?.textColor ?? 'text-gray-900 dark:text-gray-300';
            const brd = style?.borderColor ?? 'border-gray-200 dark:border-gray-600';
            return (
              <Button
                key={opt.code}
                variant="outline"
                size="sm"
                className={cn(
                  'h-10 px-3 py-2 text-center shrink-0 min-w-[4.5rem] cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border',
                  bg, txt, brd,
                  style?.isHighest && 'font-semibold'
                )}
                title={`${opt.code}: ${opt.value != null ? `${Number(opt.value).toFixed(1)}%` : 'No data'}`}
                aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(1)}%` : 'No data'}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className={cn('text-[10px] font-medium leading-tight', txt)}>{opt.code}</div>
                  <div className={cn('text-xs font-semibold leading-tight', style ? '' : 'text-blue-700 dark:text-blue-400')}>
                    {opt.value != null ? `${Number(opt.value).toFixed(1)}%` : '-'}
                  </div>
                </div>
              </Button>
            );
          })}
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
                  {topOptions.map((opt) => {
                    const mkt = selectedMarket;
                    const style = fixture && mkt?.sourcePrediction
                      ? getPredictionButtonStyle(mkt.sourcePrediction, fixture, opt.code, opt.value)
                      : null;
                    const bg = style?.backgroundColor ?? 'bg-white dark:bg-transparent';
                    const txt = style?.textColor ?? 'text-gray-900 dark:text-gray-300';
                    const brd = style?.borderColor ?? 'border-gray-200 dark:border-gray-600';
                    return (
                      <Button
                        key={opt.code}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-10 px-3 py-2 text-center min-w-0 flex-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border',
                          bg, txt, brd,
                          style?.isHighest && 'font-semibold'
                        )}
                        aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={cn('text-xs font-medium', txt)}>{opt.code}</span>
                          <span className={cn('text-xs font-semibold', style ? '' : 'text-blue-700 dark:text-blue-400')}>
                            {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
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
            return options.map((opt) => {
              const mkt = selectedMarket;
              const style = fixture && mkt?.sourcePrediction
                ? getPredictionButtonStyle(mkt.sourcePrediction, fixture, opt.code, opt.value)
                : null;
              const bg = style?.backgroundColor ?? 'bg-white dark:bg-transparent';
              const txt = style?.textColor ?? 'text-gray-900 dark:text-gray-300';
              const brd = style?.borderColor ?? 'border-gray-200 dark:border-gray-600';
              return (
                <Button
                  key={opt.code}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-10 px-3 py-2 text-center min-w-0 flex-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border',
                    bg, txt, brd,
                    style?.isHighest && 'font-semibold'
                  )}
                  aria-label={`${opt.code} prediction: ${opt.value != null ? `${Number(opt.value).toFixed(0)}%` : 'No data'}`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={cn('text-xs font-medium', txt)}>{opt.code}</span>
                    <span className={cn('text-xs font-semibold', style ? '' : 'text-blue-700 dark:text-blue-400')}>
                      {opt.value != null ? `${Number(opt.value).toFixed(0)}%` : '-'}
                    </span>
                  </div>
                </Button>
              );
            });
          })()}
        </div>

        {/* Market selector dropdown */}
        {Object.keys(marketsMap).length > 1 && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => setMarketOpen((v) => !v)}
              aria-label="Select prediction market"
              aria-expanded={marketOpen}
            >
              Market <ChevronDown className={cn('ml-1 h-3 w-3 text-gray-700 dark:text-gray-300 transition-transform', marketOpen && 'rotate-180')} />
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

      {/* Render popovers */}
      <MarketPopover />
      <MoreOptionsPopover />
    </div>
  );
}
