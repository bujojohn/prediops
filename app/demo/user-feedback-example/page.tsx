'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/app/components/ui/loading-button';
import { NavigationFeedback } from '@/app/components/ui/navigation-feedback';
import { OptimisticButton } from '@/app/components/ui/optimistic-updates';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export default function UserFeedbackExample() {
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>('');

  const simulateAsyncAction = useCallback(async (actionName: string, delay: number = 1000) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    setActionCount(prev => prev + 1);
    setLastAction(actionName);
  }, []);

  const handleLoadingButton = useCallback(async () => {
    await simulateAsyncAction('Loading Button Clicked');
  }, [simulateAsyncAction]);

  const handleOptimisticButton = useCallback(async () => {
    await simulateAsyncAction('Optimistic Update', 800);
  }, [simulateAsyncAction]);

  const handleNavigation = useCallback(async () => {
    await simulateAsyncAction('Navigation Clicked');
  }, [simulateAsyncAction]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">User Feedback & Loading States Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating immediate user feedback to prevent repeated clicking
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Action Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {actionCount}
              </Badge>
              <span className="text-sm text-gray-600">Total Actions</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Last: {lastAction || 'None yet'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Regular Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Regular Button
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              No loading state - users might click multiple times
            </p>
            <Button
              onClick={handleLoadingButton}
              className="w-full"
            >
              Click Me (No Feedback)
            </Button>
            <div className="text-xs text-red-600">
              ⚠️ Problem: No immediate feedback
            </div>
          </CardContent>
        </Card>

        {/* Loading Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Loading Button
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Shows loading state and prevents multiple clicks
            </p>
            <LoadingButton
              onClick={handleLoadingButton}
              loadingText="Processing..."
              className="w-full"
            >
              Click Me (With Loading)
            </LoadingButton>
            <div className="text-xs text-green-600">
              ✅ Solution: Immediate visual feedback
            </div>
          </CardContent>
        </Card>

        {/* Optimistic Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Optimistic Button
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Shows optimistic state for instant feedback
            </p>
            <OptimisticButton
              onClick={handleOptimisticButton}
              optimisticText="Updating..."
              loadingText="Loading..."
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Optimistic Update
            </OptimisticButton>
            <div className="text-xs text-blue-600">
              🚀 Advanced: Instant optimistic feedback
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NavigationFeedback onClick={handleNavigation}>
              <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                <span>Navigation Feedback</span>
                <span className="text-sm">(Click this title)</span>
              </div>
            </NavigationFeedback>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Navigation elements with immediate feedback
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavigationFeedback
                onClick={handleNavigation}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <h3 className="font-medium">Tab Navigation</h3>
                  <p className="text-sm text-gray-500">Click to simulate tab switch</p>
                </div>
              </NavigationFeedback>

              <NavigationFeedback
                onClick={handleNavigation}
                className="p-4 border rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <h3 className="font-medium text-blue-600">Link Navigation</h3>
                  <p className="text-sm text-gray-500">Click to simulate page navigation</p>
                </div>
              </NavigationFeedback>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Loading Button Usage:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`import { LoadingButton } from '@/components/ui/loading-button';

<LoadingButton
  onClick={async () => {
    await performAction();
  }}
  loadingText="Processing..."
>
  Click Me
</LoadingButton>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Navigation Feedback Usage:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`import { NavigationFeedback } from '@/components/ui/navigation-feedback';

<NavigationFeedback
  onClick={() => handleNavigation()}
  loadingText="Loading..."
>
  <TabsTrigger value="predictions">
    Predictions
  </TabsTrigger>
</NavigationFeedback>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Optimistic Updates Usage:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`import { OptimisticButton } from '@/components/ui/optimistic-updates';

<OptimisticButton
  onClick={async () => {
    await updateData();
  }}
  optimisticText="Updating..."
>
  Update Data
</OptimisticButton>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of Immediate Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ User Experience</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Prevents repeated clicking</li>
                <li>• Provides visual confirmation</li>
                <li>• Reduces user anxiety</li>
                <li>• Improves perceived performance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-blue-600">🚀 Technical Benefits</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Reduces server load</li>
                <li>• Prevents race conditions</li>
                <li>• Better error handling</li>
                <li>• Optimistic updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
