'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
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
import { AdvancedSearch } from '@/app/components/search/AdvancedSearch';
import { useQuickFilters } from '@/app/hooks/useQuickFilters';
import { 
  SidebarTheme, 
  SidebarHeader, 
  SidebarSection
} from './SidebarTheme';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const pathname = usePathname();
  const { filters: quickFilters } = useQuickFilters();

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

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/predictions', label: 'Predictions', icon: Target },
    { href: '/value-bets', label: 'Value Bets', icon: DollarSign },
    { href: '/live', label: 'Live', icon: Zap },
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

  const filteredCountries = countries;

  return (
    <SidebarTheme className={cn(isCollapsed ? 'w-16' : 'w-80', className)}>
      {/* Header */}
      <SidebarHeader>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">Navigation</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </SidebarHeader>

      {/* Search */}
      {!isCollapsed && (
        <SidebarSection>
          <AdvancedSearch 
            placeholder="Search leagues, teams..."
            onResultSelect={(result) => {
              console.log('Selected:', result);
              // Handle navigation here
            }}
          />
        </SidebarSection>
      )}

      {/* Countries and Leagues */}
      <div className="flex-1 overflow-y-auto">
        <SidebarSection>
          {!isCollapsed && (
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-sidebar-foreground" />
              <span className="text-sm font-medium text-sidebar-foreground">Countries & Leagues</span>
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
                    "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-sidebar-accent flex items-center justify-center">
                    <span className="text-xs font-bold text-sidebar-foreground">
                      {country.name.charAt(0)}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{country.name}</span>
                      <ChevronRight 
                        className={cn(
                          "h-3 w-3 transition-transform text-sidebar-foreground",
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
                          className="w-full justify-start gap-2 text-xs text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                        >
                          <div className="w-3 h-3 rounded-full bg-sidebar-primary"></div>
                          <span className="flex-1 text-left">{league.name}</span>
                          <span className="text-xs text-sidebar-foreground">
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
        </SidebarSection>
      </div>

      {/* Navigation Links */}
      <SidebarSection>
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
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent",
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
      </SidebarSection>

      {/* Quick Filters */}
      {!isCollapsed && (
        <SidebarSection>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-sidebar-foreground" />
            <span className="text-sm font-medium text-sidebar-foreground">Quick Filters</span>
          </div>
          <div className="space-y-2">
            {quickFilters.map((filter) => (
              <Link key={filter.id} href={filter.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                >
                  <Calendar className="h-3 w-3" />
                  <span>{filter.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 text-center">
            Prediops v1.0
          </div>
        </div>
      )}
    </SidebarTheme>
  );
} 