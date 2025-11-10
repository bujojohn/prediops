'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Trophy, Users, Calendar, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type SearchScope = 'all' | 'countries' | 'leagues' | 'teams' | 'fixtures';

interface SearchScopeDropdownProps {
  selectedScope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  className?: string;
}

const scopeOptions: Array<{
  value: SearchScope;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'all',
    label: 'All',
    icon: <Search className="h-4 w-4" />,
    description: 'Search All'
  },
  {
    value: 'countries',
    label: 'Countries',
    icon: <Globe className="h-4 w-4" />,
    description: 'Search countries only'
  },
  {
    value: 'leagues',
    label: 'Leagues',
    icon: <Trophy className="h-4 w-4" />,
    description: 'Search leagues only'
  },
  {
    value: 'teams',
    label: 'Teams',
    icon: <Users className="h-4 w-4" />,
    description: 'Search teams only'
  },
  {
    value: 'fixtures',
    label: 'Fixtures',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Fixtures only'
  }
];

export function SearchScopeDropdown({ 
  selectedScope, 
  onScopeChange, 
  className = '' 
}: SearchScopeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = scopeOptions.find(option => option.value === selectedScope) || scopeOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (scope: SearchScope) => {
    onScopeChange(scope);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 transition-all duration-150 hover:scale-105 active:scale-95"
        title={`Search scope: ${selectedOption.description}`}
      >
        {selectedOption.icon}
        <span className="hidden sm:inline text-xs">{selectedOption.label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-1">
            {scopeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                  selectedScope === option.value
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`flex-shrink-0 ${selectedScope === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
                {selectedScope === option.value && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    Selected
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
