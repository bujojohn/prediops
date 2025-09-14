'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { Navbar } from './Navbar';
import Sidebar  from './Sidebar';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - Hidden on home page */}
      {!isHomePage && (
        <div className="hidden md:block">
          <Suspense fallback={
            <div className="w-64 h-screen bg-gray-100 dark:bg-gray-800 animate-pulse">
              <div className="p-4 space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <Sidebar />
          </Suspense>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
