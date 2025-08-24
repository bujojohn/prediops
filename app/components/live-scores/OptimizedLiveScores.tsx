'use client';

import { useState, useMemo } from 'react';
import { useOptimizedLiveScores, LiveScore } from '../../../lib/hooks/use-optimized-live-scores';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { RefreshCw, Clock, MapPin, Trophy } from 'lucide-react';

interface LiveScoresProps {
  className?: string;
  showControls?: boolean;
  maxItems?: number;
}

export function OptimizedLiveScores({ 
  className = '', 
  showControls = true, 
  maxItems = 10 
}: LiveScoresProps) {
  const [showAll, setShowAll] = useState(false);
  
  const {
    scores,
    isLoading,
    error,
    lastUpdate,
    isPolling,
    refreshScores,
    currentInterval,
    consecutiveErrors,
  } = useOptimizedLiveScores({
    baseInterval: 30000, // 30 seconds
    maxInterval: 300000, // 5 minutes
  });

  // Filter and sort scores
  const displayedScores = useMemo(() => {
    let filtered = scores;
    
    // Sort by priority: LIVE > HT > 2H > NS > FT > others
    const getPriority = (status: string): number => {
      switch (status) {
        case 'LIVE': return 1;
        case 'HT': return 2;
        case '2H': return 3;
        case 'NS': return 4;
        case 'FT': return 5;
        case 'CANCELLED': return 6;
        case 'POSTPONED': return 7;
        default: return 8;
      }
    };
    
    filtered = filtered.sort((a, b) => {
      const priorityA = getPriority(a.status);
      const priorityB = getPriority(b.status);
      return priorityA - priorityB;
    });
    
    // Limit items if not showing all
    if (!showAll && maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    
    return filtered;
  }, [scores, showAll, maxItems]);

  // Group scores by status
  const groupedScores = useMemo(() => {
    const groups = {
      live: displayedScores.filter(s => s.status === 'LIVE'),
      halftime: displayedScores.filter(s => s.status === 'HT'),
      secondHalf: displayedScores.filter(s => s.status === '2H'),
      upcoming: displayedScores.filter(s => s.status === 'NS'),
      finished: displayedScores.filter(s => s.status === 'FT'),
    };
    
    return groups;
  }, [displayedScores]);

  // Format time since last update
  const formatTimeSinceUpdate = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Get status badge color
  const getStatusBadge = (status: LiveScore['status']) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
      case 'HT':
        return <Badge className="bg-orange-500 text-white">HT</Badge>;
      case '2H':
        return <Badge className="bg-red-500 text-white">2H</Badge>;
      case 'NS':
        return <Badge className="bg-blue-500 text-white">NS</Badge>;
      case 'FT':
        return <Badge className="bg-gray-500 text-white">FT</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white">{status}</Badge>;
    }
  };

  // Render individual score row
  const renderScoreRow = (score: LiveScore) => (
    <div key={score.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {getStatusBadge(score.status)}
          {score.current_minute && score.status === 'LIVE' && (
            <span className="text-sm text-gray-600 font-mono">
              {score.current_minute}&apos;
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span className="text-sm text-gray-600 truncate">{score.league}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 truncate">
            {score.venue || 'Venue TBD'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <div className="font-semibold text-gray-900">{score.home_team}</div>
          <div className="font-semibold text-gray-900">{score.away_team}</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{score.home_score}</div>
          <div className="text-2xl font-bold text-blue-600">{score.away_score}</div>
        </div>
      </div>
    </div>
  );

  // Render status section
  const renderStatusSection = (title: string, scores: LiveScore[], icon: React.ReactNode) => {
    if (scores.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <Badge variant="secondary">{scores.length}</Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            {scores.map(renderScoreRow)}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (error && scores.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Live Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="text-sm text-gray-600 mb-4">
            <p>Consecutive errors: {consecutiveErrors}</p>
            <p>Current interval: {currentInterval / 1000}s</p>
          </div>
          <Button onClick={refreshScores} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header with controls */}
      {showControls && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Live Scores</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Updated {formatTimeSinceUpdate(lastUpdate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{isPolling ? 'Live' : 'Paused'}</span>
            </div>
            
            <Button 
              onClick={refreshScores} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {scores.length > maxItems && (
              <Button 
                onClick={() => setShowAll(!showAll)} 
                variant="outline" 
                size="sm"
              >
                {showAll ? `Show ${maxItems}` : `Show All (${scores.length})`}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && scores.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live scores...</p>
          </CardContent>
        </Card>
      )}

      {/* Live scores sections */}
      {scores.length > 0 && (
        <div className="space-y-6">
          {renderStatusSection('Live Matches', groupedScores.live, <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />)}
          {renderStatusSection('Half Time', groupedScores.halftime, <div className="w-3 h-3 bg-orange-500 rounded-full" />)}
          {renderStatusSection('Second Half', groupedScores.secondHalf, <div className="w-3 h-3 bg-red-500 rounded-full" />)}
          {renderStatusSection('Upcoming', groupedScores.upcoming, <div className="w-3 h-3 bg-blue-500 rounded-full" />)}
          {renderStatusSection('Finished', groupedScores.finished, <div className="w-3 h-3 bg-gray-500 rounded-full" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && scores.length === 0 && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No live matches at the moment</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for live scores</p>
          </CardContent>
        </Card>
      )}

      {/* Performance info (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Performance Info
          </summary>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <p>Current interval: {currentInterval / 1000}s</p>
            <p>Consecutive errors: {consecutiveErrors}</p>
            <p>Total scores: {scores.length}</p>
            <p>Displayed scores: {displayedScores.length}</p>
            <p>Last update: {new Date(lastUpdate).toLocaleTimeString()}</p>
          </div>
        </details>
      )}
    </div>
  );
}
