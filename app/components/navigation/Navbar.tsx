'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Moon, Sun, User, Bell, Menu, X } from 'lucide-react';
import { DisplaySettingsToggle } from '@/app/components/settings/DisplaySettingsToggle';
import { MobileSidebarToggle } from './MobileSidebarToggle';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useIsMobile } from '@/app/hooks/useMediaQuery';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/predictions', label: 'Predictions', icon: '🎯' },
    { href: '/value-bets', label: 'Value Bets', icon: '💰' },
    { href: '/live', label: 'Live', icon: '⚽' },
  ];



  return (
         <nav className="bg-background shadow-sm border-b border-border" role="navigation" aria-label="Main">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand - Hidden on mobile since it's shown in sidebar */}
          {!isMobile && (
            <div className="flex items-center">
              <Logo size="default" showText={true} />
            </div>
          )}
          

          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-4" role="menubar" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                                 aria-current={pathname === item.href ? 'page' : undefined}
                                 className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   pathname === item.href
                     ? 'text-primary bg-primary/10'
                     : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                 }`}
                aria-label={item.label}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2" aria-label="User actions">
            {/* Display Settings Toggle */}
            <DisplaySettingsToggle />
            
            {/* Dark Mode Toggle */}
                         <Button
               variant="ghost"
               size="sm"
               onClick={toggleTheme}
               className="p-2"
               title="Toggle dark mode"
               aria-label="Toggle dark mode"
             >
               {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </Button>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* User Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title="User profile"
              aria-label="User profile"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <MobileSidebarToggle />
            <Button 
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              
              
              {/* Navigation Links - Mobile */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Actions */}
              <div className="px-3 py-2 border-t border-border mt-2 space-y-3">
                {/* Display Settings */}
                <div className="flex flex-col space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Display Settings</div>
                  <DisplaySettingsToggle />
                </div>
                
                {/* Theme and Other Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="flex items-center space-x-2"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="text-sm">Dark Mode</span>
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 relative"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 