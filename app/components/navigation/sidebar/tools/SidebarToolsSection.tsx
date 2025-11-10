'use client';

import React from 'react';

interface SidebarToolsSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarToolsSection({ children, className = '' }: SidebarToolsSectionProps) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {children}
    </div>
  );
}


