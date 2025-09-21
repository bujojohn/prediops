'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeModal } from './DateRangeModal';
import { format } from 'date-fns';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  maxDays?: number;
  className?: string;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
  maxDays = 21,
  className = ''
}: DateRangeSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDateRange = () => {
    const start = format(startDate, 'MMM dd');
    const end = format(endDate, 'MMM dd, yyyy');
    
    if (startDate.getTime() === endDate.getTime()) {
      return format(startDate, 'MMM dd, yyyy');
    }
    
    return `${start} - ${end}`;
  };

  const getDaysDifference = () => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Date Range</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <span className="text-sm">{formatDateRange()}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {getDaysDifference()} day{getDaysDifference() !== 1 ? 's' : ''} selected
          </div>
        </CardHeader>
      </Card>

      <DateRangeModal
        isOpen={isModalOpen}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
        onClose={() => setIsModalOpen(false)}
        maxDays={maxDays}
      />
    </>
  );
}
