'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateButtonProps {
  date: string; // YYYY-MM-DD format
  isSelected: boolean;
  isCached: boolean;
  isPreloaded: boolean;
  onClick: (date: string) => void;
  className?: string;
}

export function DateButton({ 
  date, 
  isSelected, 
  isCached, 
  isPreloaded, 
  onClick, 
  className = '' 
}: DateButtonProps) {
  const formatDate = (dateStr: string): string => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    
    return targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIndicator = () => {
    if (isCached) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
      );
    }
    if (isPreloaded) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800" />
      );
    }
    return null;
  };

  const getButtonVariant = () => {
    if (isSelected) {
      return "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600";
    }
    
    // Special styling for Yesterday and Tomorrow
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1 || diffDays === 1) {
      return "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600";
    }
    
    return "bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600";
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onClick(date)}
        className={cn(
          "min-w-[80px] h-10 px-3 text-sm font-medium transition-all duration-200",
          getButtonVariant(),
          className
        )}
      >
        {formatDate(date)}
      </Button>
      {getStatusIndicator()}
    </div>
  );
}
