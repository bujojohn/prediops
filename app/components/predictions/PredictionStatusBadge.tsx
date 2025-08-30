'use client';

import { Badge } from '@/components/ui/badge';
import { type PredictionStatus, getStatusDisplay } from '@/lib/utils/prediction-status';

interface PredictionStatusBadgeProps {
  status: PredictionStatus;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function PredictionStatusBadge({ 
  status, 
  className = '',
  showIcon = true,
  compact = false
}: PredictionStatusBadgeProps) {
  const display = getStatusDisplay(status);
  
  return (
    <Badge 
      variant="outline" 
      className={`${display.color} border ${compact ? 'text-xs px-2 py-0' : 'text-sm px-3 py-1'} ${className}`}
    >
      {showIcon && <span className="mr-1">{display.icon}</span>}
      {display.label}
    </Badge>
  );
}




