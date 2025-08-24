'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PredictionMarketsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface PredictionMarketsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

/**
 * Error boundary specifically for prediction markets components
 * Provides graceful error handling and fallback UI
 */
export class PredictionMarketsErrorBoundary extends React.Component<
  PredictionMarketsErrorBoundaryProps,
  PredictionMarketsErrorBoundaryState
> {
  constructor(props: PredictionMarketsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PredictionMarketsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('PredictionMarkets Error:', error, errorInfo);
    
    // You could send to error reporting service here
    // reportError(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="flex items-center justify-center p-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Prediction data unavailable</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Unable to load prediction markets
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.retry}
              className="text-xs"
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default fallback component for prediction markets errors
 */
export function DefaultPredictionMarketsFallback({ 
  error, 
  retry 
}: { 
  error?: Error; 
  retry: () => void; 
}) {
  return (
    <div className="flex items-center justify-center p-3 text-center border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <div className="space-y-2">
        <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span className="text-xs">Predictions unavailable</span>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-1 text-left overflow-auto max-w-xs">
              {error.message}
            </pre>
          </details>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={retry}
          className="text-xs h-6 px-2"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
