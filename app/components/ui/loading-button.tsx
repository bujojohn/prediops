'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({
  loading: externalLoading,
  loadingText = 'Loading...',
  onClick,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [clicked, setClicked] = useState(false);

  const loading = externalLoading || internalLoading;

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    // Provide immediate visual feedback
    setClicked(true);
    
    try {
      setInternalLoading(true);
      await onClick?.(e);
    } finally {
      setInternalLoading(false);
      setClicked(false);
    }
  }, [loading, disabled, onClick]);

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'transition-all duration-200',
        clicked && !loading && 'scale-95',
        loading && 'opacity-75 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default LoadingButton;
