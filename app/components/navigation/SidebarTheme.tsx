'use client';

import { cn } from '@/lib/utils';

interface SidebarThemeProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SidebarTheme Component
 * 
 * Single Responsibility: Handles sidebar-specific theming and styling
 * Uses shadcn/ui CSS variables for consistent theming
 */
export function SidebarTheme({ children, className }: SidebarThemeProps) {
  return (
    <div className={cn(
      // Base sidebar styling using shadcn/ui variables
      "flex flex-col h-full",
      "bg-sidebar text-sidebar-foreground",
      "border-r border-sidebar-border",
      "transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * SidebarHeader Component
 * 
 * Single Responsibility: Handles sidebar header theming
 */
export function SidebarHeader({ children, className }: SidebarThemeProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4",
      "border-b border-sidebar-border",
      "bg-sidebar text-sidebar-foreground",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * SidebarSection Component
 * 
 * Single Responsibility: Handles sidebar section theming
 */
export function SidebarSection({ children, className }: SidebarThemeProps) {
  return (
    <div className={cn(
      "p-4 border-b border-sidebar-border",
      "bg-sidebar text-sidebar-foreground",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * SidebarItem Component
 * 
 * Single Responsibility: Handles sidebar item theming
 */
export function SidebarItem({ children, className }: SidebarThemeProps) {
  return (
    <div className={cn(
      "w-full justify-start gap-2 text-sm",
      "text-sidebar-foreground hover:text-sidebar-primary-foreground",
      "hover:bg-sidebar-accent",
      "transition-colors",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * SidebarActiveItem Component
 * 
 * Single Responsibility: Handles active sidebar item theming
 */
export function SidebarActiveItem({ children, className }: SidebarThemeProps) {
  return (
    <div className={cn(
      "w-full justify-start gap-2 text-sm",
      "bg-sidebar-primary text-sidebar-primary-foreground",
      "hover:bg-sidebar-primary/90",
      "transition-colors",
      className
    )}>
      {children}
    </div>
  );
}
