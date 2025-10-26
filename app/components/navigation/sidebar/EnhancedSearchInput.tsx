'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchScopeDropdown, SearchScope } from './SearchScopeDropdown';

interface EnhancedSearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onScopeChange: (scope: SearchScope) => void;
  searchScope: SearchScope;
  placeholder?: string;
  className?: string;
  showRecentSearches?: boolean;
  recentSearches?: string[];
  onRecentSearchClick?: (search: string) => void;
  onClearRecentSearches?: () => void;
}

export function EnhancedSearchInput({
  searchTerm,
  onSearchChange,
  onScopeChange,
  searchScope,
  placeholder = "Search...",
  className = "",
  showRecentSearches = false,
  recentSearches = [],
  onRecentSearchClick,
  onClearRecentSearches
}: EnhancedSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    onSearchChange('');
    inputRef.current?.focus();
  }, [onSearchChange]);

  const handleRecentSearchClick = useCallback((search: string) => {
    console.log('Recent search clicked:', search);
    // Prevent the onBlur from interfering
    setIsFocused(true);
    // Set the search term
    onSearchChange(search);
    // Call the parent handler
    onRecentSearchClick?.(search);
    // Focus the input after setting the search term
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [onSearchChange, onRecentSearchClick]);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center">
        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="pl-3 pr-24 py-2 text-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            title="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Search Scope Dropdown */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10">
          <SearchScopeDropdown
            selectedScope={searchScope}
            onScopeChange={onScopeChange}
          />
        </div>
      </div>

      {/* Recent Searches Dropdown */}
      {showRecentSearches && isFocused && recentSearches.length > 0 && !searchTerm.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 max-h-48 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent Searches</span>
              {onClearRecentSearches && (
                <button
                  onClick={onClearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-1">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <div className="inline h-3 w-3 mr-2 text-gray-400">🔍</div>
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
