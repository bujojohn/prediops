import { type Prediction } from '@/schemas/predictions.schema';
import { type Fixture } from '@/schemas/fixture.schema';

export type PredictionStatus = 'pending' | 'live' | 'succeeding' | 'success' | 'failed';

export interface PredictionStatusResult {
  status: PredictionStatus;
  confidence: number;
  currentValue?: string;
  isLive: boolean;
}

/**
 * Calculate the current status of a prediction based on fixture state and match progress
 */
export function calculatePredictionStatus(
  prediction: Prediction,
  fixture: Fixture
): PredictionStatusResult {
  const fixtureState = fixture.state?.name?.toLowerCase() || '';
  const fixtureStateShort = fixture.state?.short_name?.toLowerCase() || '';
  
  // More comprehensive state detection
  const isLive = fixtureState.includes('live') || 
                 fixtureState.includes('in-play') || 
                 fixtureState.includes('in progress') ||
                 fixtureStateShort.includes('ht') ||
                 fixtureStateShort.includes('2nd') ||
                 fixtureStateShort.includes('1st');
                 
  const isFinished = fixtureState.includes('finished') || 
                     fixtureState.includes('full-time') ||
                     fixtureState.includes('ended') ||
                     fixtureStateShort.includes('ft') ||
                     fixtureStateShort.includes('aet') ||
                     fixtureStateShort.includes('pen');
                     
  const isPending = fixtureState.includes('scheduled') || 
                    fixtureState.includes('not started') ||
                    fixtureState.includes('postponed') ||
                    fixtureState.includes('cancelled');

  // If fixture hasn't started, prediction is pending
  if (isPending) {
    return {
      status: 'pending',
      confidence: 0,
      isLive: false
    };
  }

  // If fixture is live, determine if prediction is succeeding
  if (isLive) {
    return calculateLivePredictionStatus(prediction, fixture);
  }

  // If fixture is finished, determine final success/failure
  if (isFinished) {
    return calculateFinishedPredictionStatus(prediction, fixture);
  }

  // Default to pending for unknown states
  return {
    status: 'pending',
    confidence: 0,
    isLive: false
  };
}

/**
 * Calculate prediction status for live matches
 */
function calculateLivePredictionStatus(
  prediction: Prediction,
  fixture: Fixture
): PredictionStatusResult {
  const predictionType = prediction.type?.code || '';
  const homeScore = fixture.scores?.find(s => s.score?.participant === 'home')?.score?.goals || 0;
  const awayScore = fixture.scores?.find(s => s.score?.participant === 'away')?.score?.goals || 0;
  
  let status: PredictionStatus = 'live';
  let confidence = 0;
  let currentValue = '';

  switch (predictionType) {
    case 'fulltime-result-probability':
      status = calculateLiveWinnerStatus(prediction, homeScore, awayScore);
      currentValue = `${homeScore}-${awayScore}`;
      break;
      
    case 'first-half-winner-probability':
      const htScores = getHalfTimeScores(fixture);
      if (htScores) {
        status = calculateLiveWinnerStatus(prediction, htScores.home, htScores.away);
        currentValue = `${htScores.home}-${htScores.away}`;
      } else {
        status = 'live';
        currentValue = `${homeScore}-${awayScore}`;
      }
      break;
      
    case 'over-under-1_5-probability':
      status = calculateLiveOverUnderStatus(prediction, homeScore + awayScore, 1.5);
      currentValue = `${homeScore + awayScore} goals`;
      break;
      
    case 'over-under-2_5-probability':
      status = calculateLiveOverUnderStatus(prediction, homeScore + awayScore, 2.5);
      currentValue = `${homeScore + awayScore} goals`;
      break;
      
    case 'both-teams-to-score-probability':
      status = calculateLiveBTTSStatus(prediction, homeScore, awayScore);
      currentValue = `${homeScore > 0 ? 'Yes' : 'No'} - ${awayScore > 0 ? 'Yes' : 'No'}`;
      break;
      
    default:
      status = 'live';
      currentValue = `${homeScore}-${awayScore}`;
  }

  // Calculate confidence based on current match state
  confidence = calculateLiveConfidence(prediction, fixture);

  return {
    status,
    confidence,
    currentValue,
    isLive: true
  };
}

/**
 * Calculate prediction status for finished matches
 */
function calculateFinishedPredictionStatus(
  prediction: Prediction,
  fixture: Fixture
): PredictionStatusResult {
  const predictionType = prediction.type?.code || '';
  const homeScore = fixture.scores?.find(s => s.score?.participant === 'home')?.score?.goals || 0;
  const awayScore = fixture.scores?.find(s => s.score?.participant === 'away')?.score?.goals || 0;
  
  let status: PredictionStatus = 'pending';
  let confidence = 0;
  const currentValue = `${homeScore}-${awayScore}`;

  switch (predictionType) {
    case 'fulltime-result-probability':
      status = calculateWinnerStatus(prediction, homeScore, awayScore);
      break;
      
    case 'first-half-winner-probability':
      const htScores = getHalfTimeScores(fixture);
      if (htScores) {
        status = calculateWinnerStatus(prediction, htScores.home, htScores.away);
      } else {
        status = 'pending';
      }
      break;
      
    case 'over-under-1_5-probability':
      status = calculateOverUnderStatus(prediction, homeScore + awayScore, 1.5);
      break;
      
    case 'over-under-2_5-probability':
      status = calculateOverUnderStatus(prediction, homeScore + awayScore, 2.5);
      break;
      
    case 'both-teams-to-score-probability':
      status = calculateBTTSStatus(prediction, homeScore, awayScore);
      break;
      
    default:
      status = 'pending';
  }

  // For finished matches, confidence is 100% for success, 0% for failed
  confidence = status === 'success' ? 100 : 0;

  return {
    status,
    confidence,
    currentValue,
    isLive: false
  };
}

/**
 * Calculate winner prediction status for finished matches
 */
function calculateWinnerStatus(
  prediction: Prediction,
  homeScore: number,
  awayScore: number
): PredictionStatus {
  if (prediction.predictions && 'home' in prediction.predictions && 'away' in prediction.predictions && 'draw' in prediction.predictions) {
    // Find the highest probability prediction
    const { home, away, draw } = prediction.predictions;
    const maxProb = Math.max(home, away, draw);
    
    // Determine what the prediction was
    let predictedResult: 'home' | 'away' | 'draw';
    if (maxProb === home) predictedResult = 'home';
    else if (maxProb === away) predictedResult = 'away';
    else predictedResult = 'draw';
    
    // Determine actual result
    let actualResult: 'home' | 'away' | 'draw';
    if (homeScore > awayScore) actualResult = 'home';
    else if (awayScore > homeScore) actualResult = 'away';
    else actualResult = 'draw';
    
    // Check if prediction is correct
    if (predictedResult === actualResult) {
      return 'success';
    } else {
      return 'failed';
    }
  }
  return 'pending';
}

/**
 * Calculate live winner prediction status
 */
function calculateLiveWinnerStatus(
  prediction: Prediction,
  homeScore: number,
  awayScore: number
): PredictionStatus {
  if (prediction.predictions && 'home' in prediction.predictions && 'away' in prediction.predictions && 'draw' in prediction.predictions) {
    // Find the highest probability prediction
    const { home, away, draw } = prediction.predictions;
    const maxProb = Math.max(home, away, draw);
    
    // Determine what the prediction was
    let predictedResult: 'home' | 'away' | 'draw';
    if (maxProb === home) predictedResult = 'home';
    else if (maxProb === away) predictedResult = 'away';
    else predictedResult = 'draw';
    
    // For live matches, treat on-track as 'succeeding' and off-track as 'failed'
    if (predictedResult === 'home' && homeScore > awayScore) return 'succeeding';
    if (predictedResult === 'away' && awayScore > homeScore) return 'succeeding';
    if (predictedResult === 'draw' && homeScore === awayScore) return 'succeeding';

    // Off-track right now
    return 'failed';
  }
  return 'live';
}

/**
 * Calculate live over/under prediction status
 */
function calculateLiveOverUnderStatus(
  prediction: Prediction,
  totalGoals: number,
  threshold: number
): PredictionStatus {
  if (prediction.predictions && 'yes' in prediction.predictions && 'no' in prediction.predictions) {
    const predictedOver = prediction.predictions.yes > prediction.predictions.no;
    const currentOver = totalGoals > threshold;
    
    // For live matches, show if currently on track
    if (predictedOver === currentOver) {
      return 'succeeding';
    } else {
      return 'live';
    }
  }
  return 'live';
}

/**
 * Calculate live both teams to score status
 */
function calculateLiveBTTSStatus(
  prediction: Prediction,
  homeScore: number,
  awayScore: number
): PredictionStatus {
  if (prediction.predictions && 'yes' in prediction.predictions && 'no' in prediction.predictions) {
    const predictedBTTS = prediction.predictions.yes > prediction.predictions.no;
    const currentBTTS = homeScore > 0 && awayScore > 0;
    
    // For live matches, show if currently on track
    if (predictedBTTS === currentBTTS) {
      return 'succeeding';
    } else {
      return 'live';
    }
  }
  return 'live';
}

/**
 * Calculate over/under prediction status
 */
function calculateOverUnderStatus(
  prediction: Prediction,
  totalGoals: number,
  threshold: number
): PredictionStatus {
  if (prediction.predictions && 'yes' in prediction.predictions && 'no' in prediction.predictions) {
    const predictedOver = prediction.predictions.yes > prediction.predictions.no;
    const actualOver = totalGoals > threshold;
    
    if (predictedOver === actualOver) {
      return 'success';
    } else {
      return 'failed';
    }
  }
  return 'pending';
}

/**
 * Calculate both teams to score status
 */
function calculateBTTSStatus(
  prediction: Prediction,
  homeScore: number,
  awayScore: number
): PredictionStatus {
  if (prediction.predictions && 'yes' in prediction.predictions && 'no' in prediction.predictions) {
    const predictedBTTS = prediction.predictions.yes > prediction.predictions.no;
    const actualBTTS = homeScore > 0 && awayScore > 0;
    
    if (predictedBTTS === actualBTTS) {
      return 'success';
    } else {
      return 'failed';
    }
  }
  return 'pending';
}

/**
 * Calculate confidence for live predictions
 */
function calculateLiveConfidence(
  prediction: Prediction,
  fixture: Fixture
): number {
  // This is a simplified confidence calculation
  // In a real implementation, you might use more sophisticated algorithms
  const homeScore = fixture.scores?.find(s => s.score?.participant === 'home')?.score?.goals || 0;
  const awayScore = fixture.scores?.find(s => s.score?.participant === 'away')?.score?.goals || 0;
  const totalGoals = homeScore + awayScore;
  
  // Basic confidence based on match progress
  if (totalGoals === 0) return 25;
  if (totalGoals === 1) return 50;
  if (totalGoals === 2) return 75;
  return 90;
}

/**
 * Get status display information
 */
export function getStatusDisplay(status: PredictionStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: '⏰'
      };
    case 'live':
      return {
        label: 'Live',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: '🔴'
      };
    case 'succeeding':
      return {
        label: 'Succeeding',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: '🟡'
      };
    case 'success':
      return {
        label: 'Success',
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: '✅'
      };
    case 'failed':
      return {
        label: 'Failed',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: '❌'
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: '❓'
      };
  }
}

/**
 * Get button styling for a prediction option based on its status
 */
export function getPredictionButtonStyle(
  prediction: Prediction,
  fixture: Fixture,
  optionCode: string,
  optionValue: number | null
): {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  isHighest: boolean;
  isSuccessful: boolean;
  status: 'pending' | 'live' | 'succeeding' | 'success' | 'failed';
} | null {
  if (!optionValue) {
    return {
      backgroundColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      isHighest: false,
      isSuccessful: false,
      status: 'pending'
    };
  }

  // Find the highest probability option
  const options = getPredictionOptions(prediction);
  const maxProbability = Math.max(...options.map(opt => opt.value || 0));
  const isHighest = optionValue === maxProbability;

  // Get the current status for this prediction
  const statusResult = calculatePredictionStatus(prediction, fixture);
  const status = statusResult.status;

  // Determine if this specific option was successful (only for finished matches)
  const isFinished = fixture.state?.name?.toLowerCase().includes('finished') || 
                     fixture.state?.short_name?.toLowerCase().includes('ft') ||
                     fixture.state?.short_name?.toLowerCase().includes('aet') ||
                     fixture.state?.short_name?.toLowerCase().includes('pen');
  
  let isSuccessful = false;
  if (isFinished && isHighest) {
    isSuccessful = isPredictionSuccessful(prediction, fixture, optionCode);
  }

  // Apply the requested color theme
  switch (status) {
    case 'pending':
      // Original theme color (blue) for pre-match; highlight highest probability
      return {
        backgroundColor: isHighest ? 'bg-blue-100' : 'bg-gray-100',
        textColor: isHighest ? 'text-blue-700' : 'text-gray-600',
        borderColor: isHighest ? 'border-blue-300' : 'border-gray-200',
        isHighest,
        isSuccessful,
        status: 'pending'
      };

    case 'live':
      // Match is currently in progress - use orange/amber to indicate live status
      return {
        backgroundColor: isHighest ? 'bg-orange-100' : 'bg-gray-100',
        textColor: isHighest ? 'text-orange-700' : 'text-gray-600',
        borderColor: isHighest ? 'border-orange-300' : 'border-gray-200',
        isHighest,
        isSuccessful,
        status: 'live'
      };

    case 'succeeding':
      // Green for succeeding predictions
      return {
        backgroundColor: isHighest ? 'bg-green-100' : 'bg-gray-100',
        textColor: isHighest ? 'text-green-700' : 'text-gray-600',
        borderColor: isHighest ? 'border-green-300' : 'border-gray-200',
        isHighest,
        isSuccessful,
        status: 'succeeding'
      };

    case 'success':
      // Green for successful predictions
      return {
        backgroundColor: isHighest ? 'bg-green-100' : 'bg-gray-100',
        textColor: isHighest ? 'text-green-700' : 'text-gray-600',
        borderColor: isHighest ? 'border-green-300' : 'border-gray-200',
        isHighest,
        isSuccessful,
        status: 'success'
      };

    case 'failed':
      // Red for failed predictions
      return {
        backgroundColor: isHighest ? 'bg-red-100' : 'bg-gray-100',
        textColor: isHighest ? 'text-red-700' : 'text-gray-600',
        borderColor: isHighest ? 'border-red-300' : 'border-gray-200',
        isHighest,
        isSuccessful,
        status: 'failed'
      };

    default:
      return {
        backgroundColor: isHighest ? 'bg-blue-100' : 'bg-gray-100',
        textColor: isHighest ? 'text-blue-700' : 'text-gray-600',
        borderColor: isHighest ? 'border-blue-300' : 'border-gray-200',
        isHighest,
        isSuccessful,
        status: 'pending'
      };
  }
}

/**
 * Get all prediction options from a prediction
 */
function getPredictionOptions(prediction: Prediction): Array<{ code: string; value: number | null }> {
  const pred = prediction.predictions;
  if (!pred) return [];

  if ('home' in pred && 'away' in pred && 'draw' in pred) {
    return [
      { code: '1', value: pred.home ?? null },
      { code: 'X', value: pred.draw ?? null },
      { code: '2', value: pred.away ?? null }
    ];
  }

  if ('yes' in pred && 'no' in pred) {
    return [
      { code: 'Yes', value: pred.yes ?? null },
      { code: 'No', value: pred.no ?? null }
    ];
  }

  if ('scores' in pred && pred.scores) {
    return Object.entries(pred.scores).map(([code, value]) => ({
      code,
      value
    }));
  }

  return [];
}

/**
 * Determine if a specific prediction option was successful
 */
function isPredictionSuccessful(
  prediction: Prediction,
  fixture: Fixture,
  optionCode: string
): boolean {
  const homeScore = fixture.scores?.find(s => s.score?.participant === 'home')?.score?.goals || 0;
  const awayScore = fixture.scores?.find(s => s.score?.participant === 'away')?.score?.goals || 0;
  
  const predictionType = prediction.type?.code?.toLowerCase() || '';
  const predictionTypeName = prediction.type?.name?.toLowerCase() || '';
  
  // Full Time Result (1X2)
  if (predictionType.includes('fulltime-result') || predictionTypeName.includes('full time result')) {
    return isWinnerPredictionSuccessful(optionCode, homeScore, awayScore);
  }
  
  // First Half Winner
  if (predictionType.includes('first-half-winner') || predictionTypeName.includes('first half')) {
    const htScores = getHalfTimeScores(fixture);
    if (htScores) {
      return isWinnerPredictionSuccessful(optionCode, htScores.home, htScores.away);
    }
    // Fallback to full-time if HT not available
    console.warn('First half winner prediction: HT scores not available, using full-time as fallback');
    return isWinnerPredictionSuccessful(optionCode, homeScore, awayScore);
  }
  
  // Team To Score First
  if (predictionType.includes('team_to_score_first') || predictionTypeName.includes('score first')) {
    const firstGoal = getFirstGoal(fixture);
    if (firstGoal && firstGoal.team) {
      const predictedTeam = optionCode === '1' ? 'home' : optionCode === '2' ? 'away' : null;
      return predictedTeam === firstGoal.team;
    }
    console.warn('Team to score first prediction: first goal data not available');
    return false;
  }
  
  // Both Teams To Score
  if (predictionType.includes('both-teams-to-score') || predictionTypeName.includes('both teams to score')) {
    return isBTTSPredictionSuccessful(optionCode, homeScore, awayScore);
  }
  
  // Over/Under Markets (General)
  if (predictionType.includes('over-under') && !predictionType.includes('corners') && !predictionType.includes('home') && !predictionType.includes('away')) {
    const threshold = extractThresholdFromType(predictionType);
    return isOverUnderPredictionSuccessful(optionCode, homeScore + awayScore, threshold);
  }
  
  // Home Over/Under Markets
  if (predictionType.includes('home-over-under')) {
    const threshold = extractThresholdFromType(predictionType);
    return isOverUnderPredictionSuccessful(optionCode, homeScore, threshold);
  }
  
  // Away Over/Under Markets
  if (predictionType.includes('away-over-under')) {
    const threshold = extractThresholdFromType(predictionType);
    return isOverUnderPredictionSuccessful(optionCode, awayScore, threshold);
  }
  
  // Corners Over/Under Markets
  if (predictionType.includes('corners-over-under')) {
    // Note: We need corners data for this
    // TODO: Need corners data from API
    console.warn('Corners over/under prediction needs corners data - cannot determine success');
    return false;
  }
  
  // Half Time / Full Time Market
  if (predictionType.includes('half-time-full-time') || predictionTypeName.includes('half time/full time')) {
    // Note: We need half-time scores for this
    // TODO: Need half-time score data from API
    console.warn('Half time/full time prediction needs half-time scores - cannot determine success');
    return false;
  }
  
  // Double Chance Market
  if (predictionType.includes('double_chance') || predictionTypeName.includes('double chance')) {
    return isDoubleChancePredictionSuccessful(optionCode, homeScore, awayScore);
  }
  
  // Correct Score Market
  if (predictionType.includes('correct-score') || predictionTypeName.includes('correct score')) {
    return isCorrectScorePredictionSuccessful(optionCode, homeScore, awayScore);
  }
  
  // Generic Yes/No Market (fallback)
  if (predictionType.includes('yesno') || predictionTypeName.includes('yes/no')) {
    // Cannot determine without knowing what the yes/no refers to
    console.warn('Generic yes/no prediction cannot determine success without context');
    return false;
  }
  
  // Three-way market fallback
  if (predictionType.includes('threeway')) {
    return isWinnerPredictionSuccessful(optionCode, homeScore, awayScore);
  }
  
  return false;
}

/**
 * Extract threshold value from prediction type code
 */
function extractThresholdFromType(typeCode: string): number {
  const match = typeCode.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function isWinnerPredictionSuccessful(optionCode: string, homeScore: number, awayScore: number): boolean {
  const actualResult = homeScore > awayScore ? '1' : awayScore > homeScore ? '2' : 'X';
  return optionCode === actualResult;
}

function isOverUnderPredictionSuccessful(optionCode: string, totalGoals: number, threshold: number): boolean {
  const actualOver = totalGoals > threshold;
  const predictedOver = optionCode === 'Over';
  return actualOver === predictedOver;
}

function isBTTSPredictionSuccessful(optionCode: string, homeScore: number, awayScore: number): boolean {
  const actualBTTS = homeScore > 0 && awayScore > 0;
  const predictedBTTS = optionCode === 'Yes';
  return actualBTTS === predictedBTTS;
}

function isDoubleChancePredictionSuccessful(optionCode: string, homeScore: number, awayScore: number): boolean {
  const actualResult = homeScore > awayScore ? '1' : awayScore > homeScore ? '2' : 'X';
  
  switch (optionCode) {
    case '1X': return actualResult === '1' || actualResult === 'X';
    case '12': return actualResult === '1' || actualResult === '2';
    case 'X2': return actualResult === 'X' || actualResult === '2';
    default: return false;
  }
}

function isCorrectScorePredictionSuccessful(optionCode: string, homeScore: number, awayScore: number): boolean {
  const actualScore = `${homeScore}-${awayScore}`;
  return optionCode === actualScore;
}

/**
 * Extract half-time scores from fixture data
 */
export function getHalfTimeScores(fixture: Fixture): { home: number; away: number } | null {
  // Try to get HT scores from scores array first
  const htScores = fixture.scores?.find(s => 
    s.description?.toLowerCase().includes('ht') || 
    s.description?.toLowerCase().includes('half time')
  );
  
  if (htScores?.score?.goals !== undefined) {
    // If we have HT scores directly
    const homeScore = fixture.scores?.find(s => 
      s.score?.participant === 'home' && 
      (s.description?.toLowerCase().includes('ht') || s.description?.toLowerCase().includes('half time'))
    )?.score?.goals || 0;
    
    const awayScore = fixture.scores?.find(s => 
      s.score?.participant === 'away' && 
      (s.description?.toLowerCase().includes('ht') || s.description?.toLowerCase().includes('half time'))
    )?.score?.goals || 0;
    
    return { home: homeScore, away: awayScore };
  }
  
  // Fallback: calculate from events in first half
  if (fixture.events && fixture.periods) {
    const firstHalfPeriod = fixture.periods.find(p => 
      p.type?.name?.toLowerCase().includes('first half') ||
      p.type?.name?.toLowerCase().includes('1st half') ||
      p.description?.toLowerCase().includes('first half')
    );
    
    if (firstHalfPeriod) {
      const firstHalfEvents = fixture.events.filter(e => 
        e.period_id === firstHalfPeriod.id &&
        e.type?.name?.toLowerCase().includes('goal')
      );
      
      let homeGoals = 0;
      let awayGoals = 0;
      
      firstHalfEvents.forEach(event => {
        if (event.participant_id) {
          // Determine if it's home or away based on participant
          const participant = fixture.participants?.find(p => p.id === event.participant_id);
          const location = participant?.meta?.location;
          if (location === 'home') homeGoals++;
          else if (location === 'away') awayGoals++;
        }
      });
      
      return { home: homeGoals, away: awayGoals };
    }
  }
  
  return null;
}

/**
 * Get first goal information from fixture events
 */
export function getFirstGoal(fixture: Fixture): { team: 'home' | 'away' | null; minute: number | null } | null {
  if (!fixture.events) return null;
  
  // Find all goal events
  const goalEvents = fixture.events
    .filter(e => 
      e.type?.name?.toLowerCase().includes('goal') &&
      e.minute !== null &&
      e.participant_id !== null
    )
    .sort((a, b) => {
      const aMinute = (a.minute || 0) + (a.extra_minute || 0);
      const bMinute = (b.minute || 0) + (b.extra_minute || 0);
      return aMinute - bMinute;
    });
  
  if (goalEvents.length === 0) return null;
  
  const firstGoal = goalEvents[0];
  const minute = (firstGoal.minute || 0) + (firstGoal.extra_minute || 0);
  
  // Determine if it's home or away
  const participant = fixture.participants?.find(p => p.id === firstGoal.participant_id);
  const location = participant?.meta?.location;
  const isHome = location === 'home';
  
  return {
    team: isHome ? 'home' : 'away',
    minute
  };
}
