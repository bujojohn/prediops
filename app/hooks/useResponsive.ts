'use client';

import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useResponsive(): ResponsiveState {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallMobile: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    function updateResponsiveState() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Tailwind CSS breakpoints
      const isMobile = width < 640; // sm: 640px
      const isTablet = width >= 640 && width < 1024; // md: 768px, lg: 1024px
      const isDesktop = width >= 1024; // lg: 1024px
      const isSmallMobile = width < 480; // Extra small mobile

      setResponsiveState({
        isMobile,
        isTablet,
        isDesktop,
        isSmallMobile,
        screenWidth: width,
        screenHeight: height,
      });
    }

    // Set initial state
    updateResponsiveState();

    // Add event listener
    window.addEventListener('resize', updateResponsiveState);

    // Cleanup
    return () => window.removeEventListener('resize', updateResponsiveState);
  }, []);

  return responsiveState;
}

// Utility function to get compact mode based on screen size
export function shouldUseCompactMode(screenWidth: number): boolean {
  return screenWidth < 640; // sm breakpoint
}

// Utility function to get appropriate grid columns
export function getGridColumns(screenWidth: number): string {
  if (screenWidth < 640) return 'grid-cols-1'; // Mobile: 1 column
  if (screenWidth < 1024) return 'grid-cols-2'; // Tablet: 2 columns
  return 'grid-cols-4'; // Desktop: 4 columns
}

// Utility function to get appropriate spacing
export function getSpacing(screenWidth: number): string {
  if (screenWidth < 640) return 'space-y-3'; // Mobile: tighter spacing
  if (screenWidth < 1024) return 'space-y-4'; // Tablet: medium spacing
  return 'space-y-6'; // Desktop: generous spacing
}
