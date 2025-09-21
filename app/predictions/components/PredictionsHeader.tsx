'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { HorizontalDatePicker } from '@/app/components/date-picker';

export interface PredictionsHeaderProps {
  selectedDate: string;
  onDateSelect: (date: string) => Promise<void>;
}

/**
 * Header component for predictions page with date picker
 */
export function PredictionsHeader({ selectedDate, onDateSelect }: PredictionsHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle>Select Date for Predictions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <HorizontalDatePicker
          onDateSelect={onDateSelect}
          className="mb-4"
        />
        
        <div className="text-xs sm:text-sm text-gray-600">
          <p><strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <div className="space-y-1">
            <p><strong>URL Formats:</strong></p>
            <div className="space-y-1">
              <code className="block bg-gray-100 px-2 py-1 rounded text-xs">
                /predictions?date={selectedDate}
              </code>
              <code className="block bg-gray-100 px-2 py-1 rounded text-xs">
                /predictions/{selectedDate}
              </code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
