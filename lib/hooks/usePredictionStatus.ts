import { useState, useEffect, useCallback, useRef } from 'react';
import { calculatePredictionStatus, type PredictionStatusResult } from '@/lib/utils/prediction-status';
import { type Prediction, type Fixture } from '@/schemas';

interface UsePredictionStatusOptions {
  updateInterval?: number; // milliseconds
  enableRealTime?: boolean;
  onStatusChange?: (predictionId: number, status: PredictionStatusResult) => void;
}

interface PredictionWithStatus {
  prediction: Prediction;
  fixture: Fixture;
  status: PredictionStatusResult;
  lastUpdated: Date;
}

export function usePredictionStatus(
  predictions: Prediction[],
  fixtures: Fixture[],
  options: UsePredictionStatusOptions = {}
) {
  const {
    updateInterval = 30000, // 30 seconds default
    enableRealTime = true,
    onStatusChange
  } = options;

  const [predictionsWithStatus, setPredictionsWithStatus] = useState<PredictionWithStatus[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const predictionsRef = useRef(predictions);
  const fixturesRef = useRef(fixtures);

  // Update refs when props change
  useEffect(() => {
    predictionsRef.current = predictions;
    fixturesRef.current = fixtures;
  }, [predictions, fixtures]);

  // Calculate initial status for all predictions
  const calculateAllStatuses = useCallback(() => {
    const fixtureMap = new Map<number, Fixture>();
    fixturesRef.current.forEach(fixture => {
      fixtureMap.set(fixture.id, fixture);
    });

    return predictionsRef.current.map(prediction => {
      const fixture = fixtureMap.get(prediction.fixture_id);
      if (!fixture) {
        return {
          prediction,
          fixture: {} as Fixture,
          status: {
            status: 'pending' as const,
            confidence: 0,
            isLive: false
          },
          lastUpdated: new Date()
        };
      }

      const status = calculatePredictionStatus(prediction, fixture);
      return {
        prediction,
        fixture,
        status,
        lastUpdated: new Date()
      };
    });
  }, []);

  // Update status for a specific prediction
  const updatePredictionStatus = useCallback((predictionId: number) => {
    setPredictionsWithStatus(prev => {
      return prev.map(item => {
        if (item.prediction.id === predictionId) {
          const fixture = fixturesRef.current.find(f => f.id === item.prediction.fixture_id);
          if (fixture) {
            const newStatus = calculatePredictionStatus(item.prediction, fixture);
            const updated = {
              ...item,
              fixture,
              status: newStatus,
              lastUpdated: new Date()
            };
            
            // Notify parent component of status change
            if (onStatusChange) {
              onStatusChange(predictionId, newStatus);
            }
            
            return updated;
          }
        }
        return item;
      });
    });
  }, [onStatusChange]);

  // Update all prediction statuses
  const updateAllStatuses = useCallback(async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newStatuses = calculateAllStatuses();
      setPredictionsWithStatus(newStatuses);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating prediction statuses:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [calculateAllStatuses, isUpdating]);

  // Initialize statuses
  useEffect(() => {
    updateAllStatuses();
  }, [updateAllStatuses]);

  // Set up real-time updates
  useEffect(() => {
    if (!enableRealTime || updateInterval <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      updateAllStatuses();
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableRealTime, updateInterval, updateAllStatuses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Get predictions by status
  const getPredictionsByStatus = useCallback((status: string) => {
    return predictionsWithStatus.filter(item => item.status.status === status);
  }, [predictionsWithStatus]);

  // Get prediction by ID
  const getPredictionById = useCallback((predictionId: number) => {
    return predictionsWithStatus.find(item => item.prediction.id === predictionId);
  }, [predictionsWithStatus]);

  // Get live predictions
  const getLivePredictions = useCallback(() => {
    return predictionsWithStatus.filter(item => item.status.isLive);
  }, [predictionsWithStatus]);

  // Get predictions that need attention (succeeding, live, or failed)
  const getActivePredictions = useCallback(() => {
    return predictionsWithStatus.filter(item => 
      ['live', 'succeeding', 'failed'].includes(item.status.status)
    );
  }, [predictionsWithStatus]);

  // Manual refresh function
  const refresh = useCallback(() => {
    updateAllStatuses();
  }, [updateAllStatuses]);

  return {
    predictionsWithStatus,
    isUpdating,
    lastUpdate,
    updatePredictionStatus,
    updateAllStatuses,
    getPredictionsByStatus,
    getPredictionById,
    getLivePredictions,
    getActivePredictions,
    refresh
  };
}
