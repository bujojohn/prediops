'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationFeedbackProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void | Promise<void>;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export function NavigationFeedback({
  children,
  href,
  onClick,
  loadingText = 'Loading...',
  className,
  disabled = false,
}: NavigationFeedbackProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (isLoading || disabled) {
      e.preventDefault();
      return;
    }

    // Provide immediate visual feedback
    setClicked(true);
    setIsLoading(true);

    try {
      // If there's an onClick handler, use it
      if (onClick) {
        await onClick();
      }
      
      // If there's an href, navigate to it
      if (href && href !== pathname) {
        router.push(href);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Reset loading state after a short delay to show feedback
      setTimeout(() => {
        setIsLoading(false);
        setClicked(false);
      }, 300);
    }
  }, [isLoading, disabled, onClick, href, router, pathname]);

  return (
    <div
      className={cn(
        'transition-all duration-200 cursor-pointer',
        isLoading && 'opacity-75 cursor-not-allowed',
        clicked && !isLoading && 'scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-600">{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default NavigationFeedback;
