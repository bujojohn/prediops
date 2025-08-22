'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, Globe, Target, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  type: 'league' | 'team' | 'fixture';
  name: string;
  subtitle?: string;
  href: string;
  icon: React.ReactNode;
}

interface AdvancedSearchProps {
  className?: string;
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
}

export function AdvancedSearch({ 
  className, 
  placeholder = "Search leagues, teams, fixtures...",
  onResultSelect 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock API search function - replace with actual API call
  const searchAPI = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockData: SearchResult[] = [
      {
        id: 1,
        type: 'league',
        name: 'Premier League',
        subtitle: 'England',
        href: '/predictions?league=1',
        icon: <Globe className="h-4 w-4 text-blue-600" />
      },
      {
        id: 2,
        type: 'team',
        name: 'Manchester United',
        subtitle: 'Premier League',
        href: '/team/2',
        icon: <Users className="h-4 w-4 text-green-600" />
      },
      {
        id: 3,
        type: 'fixture',
        name: 'Manchester United vs Liverpool',
        subtitle: 'Premier League - Today 15:00',
        href: '/fixture/3',
        icon: <Target className="h-4 w-4 text-purple-600" />
      },
      {
        id: 4,
        type: 'league',
        name: 'La Liga',
        subtitle: 'Spain',
        href: '/predictions?league=4',
        icon: <Globe className="h-4 w-4 text-blue-600" />
      },
      {
        id: 5,
        type: 'team',
        name: 'Real Madrid',
        subtitle: 'La Liga',
        href: '/team/5',
        icon: <Users className="h-4 w-4 text-green-600" />
      }
    ];
    
    return mockData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      
      try {
        const searchResults = await searchAPI(query);
        setResults(searchResults);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, searchAPI]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setIsOpen(false);
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      window.location.href = result.href;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'league':
        return 'text-blue-600';
      case 'team':
        return 'text-green-600';
      case 'fixture':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('relative', className)} ref={resultsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer w-full text-left',
                      selectedIndex === index && 'bg-gray-50'
                    )}
                  >
                    {result.icon}
                    <div className="flex-1 min-w-0">
                      <div className={cn('font-medium text-sm', getTypeColor(result.type))}>
                        {result.name}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {`No results found for "${query}"`}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
