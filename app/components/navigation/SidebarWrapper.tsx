'use client';

import { usePathname } from 'next/navigation';
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
          {/* <Sidebar /> */}
          <div className="w-64 bg-gray-800 text-white p-4">
            <p>Sidebar temporarily disabled for build testing</p>
          </div>
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
