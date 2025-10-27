'use client';

import React, { useRef, useCallback } from 'react';
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
}

export function EnhancedSearchInput({
  searchTerm,
  onSearchChange,
  onScopeChange,
  searchScope,
  placeholder = "Search...",
  className = "",
}: EnhancedSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    onSearchChange('');
    inputRef.current?.focus();
  }, [onSearchChange]);

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
    </div>
  );
}
