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
          <Suspense fallback={<div>Loading Sidebar...</div>}>
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
