'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedPredictionCard } from './EnhancedPredictionCard';
import { calculatePredictionStatus, type PredictionStatus } from '@/lib/utils/prediction-status';
import { type Prediction } from '@/schemas/predictions.schema';
import { type Fixture } from '@/schemas';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlayCircle
} from 'lucide-react';

interface PredictionStatusDashboardProps {
  predictions: Prediction[];
  fixtures: Fixture[];
  className?: string;
}

export function PredictionStatusDashboard({ 
  predictions, 
  fixtures, 
  className = '' 
}: PredictionStatusDashboardProps) {
  const [selectedStatus, setSelectedStatus] = useState<PredictionStatus | 'all'>('all');

  // Create a map of fixture_id to fixture for quick lookup
  const fixtureMap = useMemo(() => {
    const map = new Map<number, Fixture>();
    fixtures.forEach(fixture => {
      map.set(fixture.id, fixture);
    });
    return map;
  }, [fixtures]);

  // Calculate status for each prediction
  const predictionsWithStatus = useMemo(() => {
    return predictions.map(prediction => {
      const fixture = fixtureMap.get(prediction.fixture_id);
      if (!fixture) return null;
      
      const statusResult = calculatePredictionStatus(prediction, fixture);
      return {
        prediction,
        fixture,
        statusResult
      };
    }).filter(Boolean);
  }, [predictions, fixtureMap]);

  // Group predictions by status
  const groupedPredictions = useMemo(() => {
    const groups = {
      pending: [] as typeof predictionsWithStatus,
      live: [] as typeof predictionsWithStatus,
      succeeding: [] as typeof predictionsWithStatus,
      success: [] as typeof predictionsWithStatus,
      failed: [] as typeof predictionsWithStatus
    };

    predictionsWithStatus.forEach(item => {
      if (item) {
        groups[item.statusResult.status].push(item);
      }
    });

    return groups;
  }, [predictionsWithStatus]);

  // Filter predictions based on selected status
  const filteredPredictions = useMemo(() => {
    if (selectedStatus === 'all') {
      return predictionsWithStatus;
    }
    return predictionsWithStatus.filter(item => 
      item && item.statusResult.status === selectedStatus
    );
  }, [predictionsWithStatus, selectedStatus]);

  // Get status counts
  const statusCounts = {
    pending: groupedPredictions.pending.length,
    live: groupedPredictions.live.length,
    succeeding: groupedPredictions.succeeding.length,
    success: groupedPredictions.success.length,
    failed: groupedPredictions.failed.length
  };

  const totalPredictions = predictionsWithStatus.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with summary stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Prediction Status Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatusSummaryCard
              title="Pending"
              count={statusCounts.pending}
              total={totalPredictions}
              icon={Clock}
              color="text-gray-600"
              bgColor="bg-gray-100"
            />
            <StatusSummaryCard
              title="Live"
              count={statusCounts.live}
              total={totalPredictions}
              icon={PlayCircle}
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <StatusSummaryCard
              title="Succeeding"
              count={statusCounts.succeeding}
              total={totalPredictions}
              icon={TrendingUp}
              color="text-yellow-600"
              bgColor="bg-yellow-100"
            />
            <StatusSummaryCard
              title="Success"
              count={statusCounts.success}
              total={totalPredictions}
              icon={CheckCircle}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatusSummaryCard
              title="Failed"
              count={statusCounts.failed}
              total={totalPredictions}
              icon={XCircle}
              color="text-red-600"
              bgColor="bg-red-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium mr-2">Filter by status:</span>
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All ({totalPredictions})
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('pending')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending ({statusCounts.pending})
            </Button>
            <Button
              variant={selectedStatus === 'live' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('live')}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Live ({statusCounts.live})
            </Button>
            <Button
              variant={selectedStatus === 'succeeding' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('succeeding')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Succeeding ({statusCounts.succeeding})
            </Button>
            <Button
              variant={selectedStatus === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('success')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Success ({statusCounts.success})
            </Button>
            <Button
              variant={selectedStatus === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('failed')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Failed ({statusCounts.failed})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPredictions.map((item, index) => {
          if (!item) return null;
          
          return (
            <EnhancedPredictionCard
              key={`${item.prediction.id}-${index}`}
              prediction={item.prediction}
              fixture={item.fixture}
            />
          );
        })}
      </div>

      {filteredPredictions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No predictions found for the selected status.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StatusSummaryCardProps {
  title: string;
  count: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function StatusSummaryCard({ title, count, total, icon: Icon, color, bgColor }: StatusSummaryCardProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="text-center p-4 rounded-lg">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${bgColor} mb-2`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{percentage}%</div>
    </div>
  );
}
