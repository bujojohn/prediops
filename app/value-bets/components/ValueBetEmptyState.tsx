'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValueBetEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ValueBetEmptyState({ hasActiveFilters, onClearFilters }: ValueBetEmptyStateProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="text-center py-16">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {hasActiveFilters 
            ? 'No matching value bets found' 
            : 'No value bets available'
          }
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {hasActiveFilters
            ? 'Try adjusting your search criteria or filters'
            : 'Check back later for updated value betting opportunities'
          }
        </p>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

