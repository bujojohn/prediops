'use client';

import React from 'react';
import { Button } from '../../components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LiveMatchesErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LiveMatchesErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Something went wrong with Live Matches
            </h3>
            <p className="text-red-700 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
              >
                Try Again
              </Button>
              <div className="text-sm text-red-600">
                <p>Error details:</p>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
