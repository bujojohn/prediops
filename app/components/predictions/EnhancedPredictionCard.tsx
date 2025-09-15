'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionStatusBadge } from './PredictionStatusBadge';
import { calculatePredictionStatus } from '@/lib/utils/prediction-status';
import { type Prediction, type Fixture } from '@/schemas';
import { cn } from '@/lib/utils';

interface EnhancedPredictionCardProps {
  prediction: Prediction;
  fixture: Fixture;
  className?: string;
}

export function EnhancedPredictionCard({ 
  prediction, 
  fixture, 
  className = '' 
}: EnhancedPredictionCardProps) {
  const statusResult = calculatePredictionStatus(prediction, fixture);
  const predictionType = prediction.type?.name || 'Unknown Prediction';
  
  // Get team names
  const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home')?.name || 'Home';
  const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away')?.name || 'Away';
  
  // Helper function to get the most appropriate score based on match state
  const getScoreForParticipant = (participant: 'home' | 'away', scores: typeof fixture.scores) => {
    if (!scores || scores.length === 0) return 0;
    
    // For finished matches, prioritize FT (Full Time) scores
    if (fixture.state?.short_name === 'FT' || fixture.state?.short_name === 'AET' || fixture.state?.short_name === 'PEN') {
      const ftScore = scores.find(s => 
        s.score?.participant === participant && 
        s.description === 'FT'
      );
      if (ftScore?.score?.goals !== null && ftScore?.score?.goals !== undefined) {
        return ftScore.score.goals;
      }
    }
    
    // For live matches, prioritize CURRENT scores
    if (fixture.state?.short_name === 'LIVE' || fixture.state?.short_name === '2H') {
      const currentScore = scores.find(s => 
        s.score?.participant === participant && 
        s.description === 'CURRENT'
      );
      if (currentScore?.score?.goals !== null && currentScore?.score?.goals !== undefined) {
        return currentScore.score.goals;
      }
    }
    
    // For half-time, prioritize HT scores
    if (fixture.state?.short_name === 'HT') {
      const htScore = scores.find(s => 
        s.score?.participant === participant && 
        s.description === 'HT'
      );
      if (htScore?.score?.goals !== null && htScore?.score?.goals !== undefined) {
        return htScore.score.goals;
      }
    }
    
    // Fallback: get the most recent score (highest goals count, or last entry)
    const participantScores = scores
      .filter(s => s.score?.participant === participant && s.score?.goals !== null && s.score?.goals !== undefined)
      .sort((a, b) => (b.score?.goals || 0) - (a.score?.goals || 0));
    
    return participantScores[0]?.score?.goals || 0;
  };

  // Get current score
  const homeScore = getScoreForParticipant('home', fixture.scores);
  const awayScore = getScoreForParticipant('away', fixture.scores);
  
  // Get match time/status
  const matchStatus = fixture.state?.name || 'Scheduled';
  const matchTime = fixture.starting_at ? new Date(fixture.starting_at).toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : 'TBD';

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Status indicator at top right */}
      <div className="absolute top-3 right-3">
        <PredictionStatusBadge 
          status={statusResult.status} 
          compact={true}
        />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-16">
            <CardTitle className="text-lg font-semibold">
              {homeTeam} vs {awayTeam}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {predictionType}
            </p>
          </div>
        </div>
        
        {/* Match status and time */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="text-xs">
            {matchStatus}
          </Badge>
          <span className="text-muted-foreground">
            {matchTime}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Score Display */}
        <div className="flex justify-center items-center gap-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">{homeTeam}</div>
            <div className="text-2xl font-bold text-primary">{homeScore}</div>
          </div>
          <div className="text-lg text-muted-foreground">-</div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">{awayTeam}</div>
            <div className="text-2xl font-bold text-primary">{awayScore}</div>
          </div>
        </div>
        
        {/* Prediction Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Prediction Status:</span>
            <PredictionStatusBadge status={statusResult.status} />
          </div>
          
          {statusResult.isLive && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Live Confidence:</span>
              <span className="text-sm font-semibold text-blue-600">
                {statusResult.confidence}%
              </span>
            </div>
          )}
          
          {statusResult.currentValue && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current State:</span>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {statusResult.currentValue}
              </span>
            </div>
          )}
        </div>
        
        {/* Prediction Probabilities */}
        {prediction.predictions && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium mb-2">Prediction Probabilities:</h4>
            <div className="grid grid-cols-3 gap-2">
              {renderPredictionProbabilities(prediction)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderPredictionProbabilities(prediction: Prediction) {
  if ('home' in prediction.predictions && 'away' in prediction.predictions && 'draw' in prediction.predictions) {
    return (
      <>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Home</div>
          <div className="font-semibold">{(prediction.predictions.home * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Draw</div>
          <div className="font-semibold">{(prediction.predictions.draw * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Away</div>
          <div className="font-semibold">{(prediction.predictions.away * 100).toFixed(1)}%</div>
        </div>
      </>
    );
  }
  
  if ('yes' in prediction.predictions && 'no' in prediction.predictions) {
    return (
      <>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Yes</div>
          <div className="font-semibold">{(prediction.predictions.yes * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center p-2 bg-muted rounded col-span-2">
          <div className="text-xs text-muted-foreground">No</div>
          <div className="font-semibold">{(prediction.predictions.no * 100).toFixed(1)}%</div>
        </div>
      </>
    );
  }
  
  return (
    <div className="col-span-3 text-center text-sm text-muted-foreground py-2">
      Probability data not available
    </div>
  );
}
