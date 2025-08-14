'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  Calendar,
  Home,
  Target,
  DollarSign,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const pathname = usePathname();

  const countries = [
    {
      id: 1,
      name: 'England',
      leagues: [
        { id: 1, name: 'Premier League', fixture_count: 380 },
        { id: 2, name: 'Championship', fixture_count: 552 },
      ]
    },
    {
      id: 2,
      name: 'Spain',
      leagues: [
        { id: 3, name: 'La Liga', fixture_count: 380 },
        { id: 4, name: 'La Liga 2', fixture_count: 462 },
      ]
    },
    {
      id: 3,
      name: 'Germany',
      leagues: [
        { id: 5, name: 'Bundesliga', fixture_count: 306 },
        { id: 6, name: '2. Bundesliga', fixture_count: 306 },
      ]
    }
  ];

  const quickFilters = [
    { id: 'today', label: 'Today', href: '/predictions?filter=today' },
    { id: 'tomorrow', label: 'Tomorrow', href: '/predictions?filter=tomorrow' },
    { id: 'weekend', label: 'Weekend', href: '/predictions?filter=weekend' },
    { id: 'top-bets', label: 'Top Bets', href: '/value-bets?filter=top' },
  ];

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/predictions', label: 'Predictions', icon: Target },
    { href: '/value-bets', label: 'Value Bets', icon: DollarSign },
    { href: '/live', label: 'Live Matches', icon: Zap },
  ];

  const toggleCountry = (countryId: number) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.leagues.some(league => 
      league.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-80',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Navigation</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leagues, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Filters */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Quick Filters</span>
          </div>
          <div className="space-y-2">
            {quickFilters.map((filter) => (
              <Link key={filter.id} href={filter.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                >
                  <Calendar className="h-3 w-3" />
                  <span>{filter.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Countries and Leagues */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Countries & Leagues</span>
            </div>
          )}
          
          <div className="space-y-2">
            {filteredCountries.map((country) => (
              <div key={country.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCountry(country.id)}
                  className={cn(
                    "w-full justify-start gap-2 text-sm",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      {country.name.charAt(0)}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{country.name}</span>
                      <ChevronRight 
                        className={cn(
                          "h-3 w-3 transition-transform",
                          expandedCountries.has(country.id) && "rotate-90"
                        )} 
                      />
                    </>
                  )}
                </Button>

                {expandedCountries.has(country.id) && !isCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {country.leagues.map((league) => (
                      <Link key={league.id} href={`/predictions?league=${league.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-xs text-gray-600 hover:text-gray-900"
                        >
                          <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                          <span className="flex-1 text-left">{league.name}</span>
                          <span className="text-xs text-gray-400">
                            {league.fixture_count}
                          </span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Prediops v1.0
          </div>
        </div>
      )}
    </div>
  );
} 