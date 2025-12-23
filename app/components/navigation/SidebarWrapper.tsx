'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Breadcrumb } from './Breadcrumb';
import { SidebarOptimized } from './SidebarOptimized';
import { useIsMobile } from '@/app/hooks/useMediaQuery';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - Hidden on home page */}
      {!isHomePage && (
        <div className="hidden md:block">
          {/* Always show static shell immediately, then hydrate with dynamic content */}
          <Suspense fallback={
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
              <div className="animate-pulse p-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          }>
            <SidebarOptimized showLogo={isMobile} />
          </Suspense>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        <Breadcrumb />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}