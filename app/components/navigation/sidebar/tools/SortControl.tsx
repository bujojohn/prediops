'use client';

import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import type { SortOption } from '../hooks/useSorting';

interface SortControlProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show Name and Favorites - removed Fixtures as it's not useful
  const options: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'favorites', label: 'Favorites First' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        title="Change sort order"
      >
        <ArrowUpDown className="h-3 w-3" />
        <span className="text-[10px] font-medium">{options.find(o => o.value === value)?.label || 'Name'}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg min-w-[120px]">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t last:rounded-b transition-colors ${
                  value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


