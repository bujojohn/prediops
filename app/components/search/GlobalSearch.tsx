'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Globe, Trophy, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  type: 'country' | 'league' | 'team' | 'fixture';
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  url: string;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ placeholder = "Search leagues, teams, fixtures...", className = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showResults) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowResults(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults, results, selectedIndex]);

  const searchItems = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call - in real implementation, this would call your API
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'country' as const,
          name: 'England',
          subtitle: 'United Kingdom',
          icon: <Globe className="h-4 w-4" />,
          url: '/countries/1'
        },
        {
          id: '2',
          type: 'league' as const,
          name: 'Premier League',
          subtitle: 'England',
          icon: <Trophy className="h-4 w-4" />,
          url: '/leagues/1'
        },
        {
          id: '3',
          type: 'team' as const,
          name: 'Manchester United',
          subtitle: 'England',
          icon: <Users className="h-4 w-4" />,
          url: '/teams/1'
        },
        {
          id: '4',
          type: 'fixture' as const,
          name: 'Manchester United vs Liverpool',
          subtitle: 'Premier League • Today 20:00',
          icon: <Calendar className="h-4 w-4" />,
          url: '/fixtures/1'
        }
      ].filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        searchItems(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    // In a real app, you would navigate to the result
    console.log('Navigating to:', result.url);
    setShowResults(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'country': return 'bg-blue-100 text-blue-800';
      case 'league': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-purple-100 text-purple-800';
      case 'fixture': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'country': return 'Country';
      case 'league': return 'League';
      case 'team': return 'Team';
      case 'fixture': return 'Fixture';
      default: return 'Other';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showResults && (query || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedIndex === index ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {result.name}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getTypeColor(result.type)}`}
                          >
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-1">Try searching for countries, leagues, teams, or fixtures</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 