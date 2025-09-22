'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { cn } from '@/lib/utils';

interface OptimisticUpdateOptions<T> {
  onOptimisticUpdate?: (optimisticValue: T) => void;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  rollbackOnError?: boolean;
}

export function useOptimisticUpdate<T>(
  initialValue: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);

  const updateOptimistic = useCallback(
    async (
      optimisticValue: T,
      updateFn: () => Promise<T>
    ) => {
      // Set optimistic value immediately
      setOptimisticValue(optimisticValue);
      setError(null);
      options.onOptimisticUpdate?.(optimisticValue);

      startTransition(async () => {
        try {
          const result = await updateFn();
          setOptimisticValue(result);
          options.onSuccess?.(result);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Update failed');
          setError(error);
          
          if (options.rollbackOnError !== false) {
            setOptimisticValue(initialValue);
          }
          
          options.onError?.(error);
        }
      });
    },
    [initialValue, options]
  );

  return {
    value: optimisticValue,
    isPending,
    error,
    updateOptimistic,
    setValue: setOptimisticValue,
  };
}

interface OptimisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => Promise<void>;
  optimisticText?: string;
  loadingText?: string;
  children: React.ReactNode;
}

export function OptimisticButton({
  onClick,
  optimisticText = 'Processing...',
  loadingText = 'Loading...',
  children,
  className,
  disabled,
  ...props
}: OptimisticButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(() => {
    if (isPending || disabled) return;

    setClicked(true);
    startTransition(async () => {
      try {
        await onClick();
      } finally {
        setClicked(false);
      }
    });
  }, [onClick, isPending, disabled]);

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        'transition-all duration-200',
        clicked && !isPending && 'scale-95',
        isPending && 'opacity-75 cursor-not-allowed',
        className
      )}
    >
      {isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current inline-block mr-2"></div>
          {clicked ? optimisticText : loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default useOptimisticUpdate;
