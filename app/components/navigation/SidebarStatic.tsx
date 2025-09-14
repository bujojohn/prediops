'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  Settings, 
  RefreshCw
} from 'lucide-react';
import { useDisplaySettings } from '@/app/contexts/DisplaySettingsContext';

// Static shell that can be prerendered
export function SidebarStatic() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useDisplaySettings(); // For future use

  if (isHomePage) {
    return null;
  }

  return (
    <div className="hidden md:block w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Static Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Predictions
            </h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Static Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Static Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
          <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className="w-full justify-start"
          >
            <Star className="h-4 w-4 mr-2" />
            {showOnlyFavorites ? 'All Countries' : 'Favorites Only'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Counts
          </Button>
        </div>

        {/* Dynamic Content Area - This will stream in */}
        <div className="flex-1 overflow-auto">
          <SidebarContent />
        </div>
      </div>
    </div>
  );
}

// Dynamic content that loads the actual sidebar data
function SidebarContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState([]);

  // Load data on mount
  React.useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sportmonks/countries/with-leagues');
        const data = await response.json();
        if (data.success) {
          setCountries(data.data || []);
        }
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  if (isLoading) {
    return <SidebarContentSkeleton />;
  }

  return (
    <div className="p-4 space-y-3">
      {/* Render actual countries */}
      {countries.map((country: { id: number; name: string; fixtureCount?: number }) => (
        <div key={country.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">
              {country.name}
            </span>
            <Badge variant="secondary">
              {country.fixtureCount || 0}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for the dynamic content area
function SidebarContentSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {/* Countries skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      {/* Leagues skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-50 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-50 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-50 dark:bg-gray-600 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
