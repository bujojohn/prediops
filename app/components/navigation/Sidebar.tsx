'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Filter, Calendar, Star } from 'lucide-react';
import { CountriesListClient } from '@/app/components/countries/CountriesListClient';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function Sidebar({ isOpen = false, onToggle, className = "" }: SidebarProps) {
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>();

  const quickFilters = [
    { id: 'today', label: 'Today', icon: '📅', count: 12 },
    { id: 'tomorrow', label: 'Tomorrow', icon: '📆', count: 8 },
    { id: 'weekend', label: 'Weekend', icon: '🎉', count: 25 },
    { id: 'top-bets', label: 'Top Bets', icon: '⭐', count: 5 },
  ];

  const handleCountrySelect = (country: any) => {
    setSelectedCountryId(country.id);
    console.log('Selected country:', country);
    // In a real app, you would navigate or filter content based on country
  };

  return (
    <div className={`${className} ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 z-40 overflow-y-auto`}>
      <div className="p-4 space-y-4">
        {/* Toggle Button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              Quick Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant="ghost"
                  className="w-full justify-between text-sm"
                  onClick={() => console.log('Filter clicked:', filter.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Countries List */}
        <CountriesListClient
          initialCountries={[]}
          onCountrySelect={handleCountrySelect}
          selectedCountryId={selectedCountryId}
        />

        {/* Recent Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-gray-600"
                onClick={() => console.log('Recent search clicked')}
              >
                Premier League
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-gray-600"
                onClick={() => console.log('Recent search clicked')}
              >
                Manchester United
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-gray-600"
                onClick={() => console.log('Recent search clicked')}
              >
                England
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sidebar Toggle Button Component
export function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="fixed left-4 top-20 z-50 p-2 bg-white border border-gray-200 shadow-sm"
    >
      {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  );
} 