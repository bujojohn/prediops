'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger loading (in pixels)
  rootMargin?: string; // Root margin for intersection observer
  enabled?: boolean; // Whether infinite scroll is enabled
}

export interface UseInfiniteScrollReturn {
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for implementing infinite scroll functionality
 * Uses Intersection Observer API for efficient scroll detection
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    rootMargin = '0px',
    enabled = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Reset function
  const reset = useCallback(() => {
    setIsLoading(false);
    setHasMore(true);
  }, []);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, loadMore, rootMargin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isLoading,
    hasMore,
    loadMore,
    reset,
    setHasMore,
    setIsLoading,
    sentinelRef,
  };
}

/**
 * Hook for manual infinite scroll with button trigger
 * Useful for mobile devices where automatic scroll might not work well
 */
export function useManualInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  initialHasMore: boolean = true
): UseInfiniteScrollReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, onLoadMore]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setHasMore(true);
  }, []);

  return {
    isLoading,
    hasMore,
    loadMore,
    reset,
    setHasMore,
    setIsLoading,
    sentinelRef,
  };
}
