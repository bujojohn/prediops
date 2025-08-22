"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useSearch,
  SearchResult,
  addToRecentSearches,
} from "@/lib/hooks/use-search";
import { ErrorBoundary } from "@/app/components/error-boundary/ErrorBoundary";

interface GlobalSearchClientProps {
  placeholder?: string;
  className?: string;
}

function SearchResults({
  query,
  onResultClick,
}: {
  query: string;
  onResultClick: (result: SearchResult) => void;
}) {
  const { data, isLoading, error } = useSearch({
    query,
    type: "all",
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
        <p className="text-sm">Searching...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="text-sm">Failed to search. Please try again.</p>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">No results found</p>
        <p className="text-xs mt-1">
          Try searching for countries, leagues, teams, or fixtures
        </p>
      </div>
    );
  }

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "country":
        return "bg-blue-100 text-blue-800";
      case "league":
        return "bg-green-100 text-green-800";
      case "team":
        return "bg-purple-100 text-purple-800";
      case "fixture":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "country":
        return "Country";
      case "league":
        return "League";
      case "team":
        return "Team";
      case "fixture":
        return "Fixture";
      default:
        return "Other";
    }
  };

  return (
    <div className="py-2">
      {data.data.map((result: SearchResult) => (
        <div
          key={`${result.type}-${result.id}`}
          onClick={() => onResultClick(result)}
          className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-500">
              <span className="text-lg">{result.icon}</span>
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
  );
}

export function GlobalSearchClient({
  placeholder = "Search leagues, teams, fixtures...",
  className = "",
}: GlobalSearchClientProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchData } = useSearch({ query, type: "all", limit: 10 });
  const results = useMemo(() => searchData?.data ?? [], [searchData]);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log("Navigating to:", result.url);
    addToRecentSearches(query);
    window.location.href = result.url;
    setShowResults(false);
    setQuery("");
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showResults) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          setShowResults(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults, query, selectedIndex, results, handleResultClick]);

  return (
    <ErrorBoundary>
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
                setQuery("");
                setShowResults(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {showResults && query.trim().length >= 2 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              <SearchResults query={query} onResultClick={handleResultClick} />
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
}
