'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Moon, Sun, User, Bell, Menu, X } from 'lucide-react';
import { DisplaySettingsToggle } from '@/app/components/settings/DisplaySettingsToggle';
import { MobileSidebarToggle } from './MobileSidebarToggle';
import { useTheme } from '@/app/contexts/ThemeContext';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/predictions', label: 'Predictions', icon: '🎯' },
    { href: '/value-bets', label: 'Value Bets', icon: '💰' },
    { href: '/live', label: 'Live Matches', icon: '⚽' },
  ];



  return (
         <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">⚽</span>
                             <span className="font-bold text-xl text-gray-900 dark:text-white">Prediops</span>
            </Link>
          </div>
          

          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                                 className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   pathname === item.href
                     ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                     : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                 }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          
          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Display Settings Toggle */}
            <DisplaySettingsToggle />
            
            {/* Dark Mode Toggle */}
                         <Button
               variant="ghost"
               size="sm"
               onClick={toggleTheme}
               className="p-2"
               title="Toggle dark mode"
             >
               {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </Button>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
              title="Notifications"
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
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              
              
              {/* Navigation Links - Mobile */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile Actions */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center space-x-2">
                  <DisplaySettingsToggle />
                                     <Button
                     variant="ghost"
                     size="sm"
                     onClick={toggleTheme}
                     className="flex items-center space-x-2"
                   >
                     {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                     <span className="text-sm">Dark Mode</span>
                   </Button>
                </div>
                
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
        )}
      </div>
    </nav>
  );
} 