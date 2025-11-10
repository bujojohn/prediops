'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { FilterButton } from './FilterButton';

interface FilterToolsProps {
  favoritesActive: boolean;
  onToggleFavorites: () => void;
  count?: number;
}

export function FilterTools({
  favoritesActive,
  onToggleFavorites,
  count,
}: FilterToolsProps) {
  return (
    <div className="flex items-center gap-2">
      <FilterButton
        icon={<Star className={`h-3 w-3 ${favoritesActive ? 'fill-current' : ''}`} />}
        label="Favorites"
        active={favoritesActive}
        count={count}
        onClick={onToggleFavorites}
        title="Toggle favorites (Ctrl+F)"
      />
    </div>
  );
}


