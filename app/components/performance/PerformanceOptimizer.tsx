'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });
    
    ref.current = observer;
    
    return () => {
      if (ref.current) {
        ref.current.disconnect();
      }
    };
  }, [callback, options]);
  
  return ref.current;
}

// Performance optimizer component
export function PerformanceOptimizer({ 
  children
}: PerformanceOptimizerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const createdFontLinkRef = useRef<HTMLLinkElement | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !elementRef.current) return;
    
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical fonts - only if not already present
      const existingFontLink = document.querySelector('link[rel="preload"][as="font"][href="/fonts/inter-var.woff2"]');
      if (!existingFontLink) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.crossOrigin = 'anonymous';
        fontLink.href = '/fonts/inter-var.woff2';
        document.head.appendChild(fontLink);
        createdFontLinkRef.current = fontLink;
      }
      
      // Preload critical images
      const criticalImages = [
        '/icons/favicon.ico',
        '/icons/apple-touch-icon.png',
      ];
      
      criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    // Optimize images when they come into view
    const optimizeImages = () => {
      const images = elementRef.current?.querySelectorAll('img[data-src]');
      images?.forEach(img => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.dataset.src) {
          imgElement.src = imgElement.dataset.src;
          imgElement.removeAttribute('data-src');
        }
      });
    };
    
    // Run optimizations
    preloadCriticalResources();
    
    // Use requestIdleCallback for non-critical optimizations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(optimizeImages);
    } else {
      setTimeout(optimizeImages, 100);
    }
    
    // Cleanup
    return () => {
      // Only remove the specific font link we created, not all preloaded fonts
      if (createdFontLinkRef.current && createdFontLinkRef.current.parentNode) {
        createdFontLinkRef.current.remove();
        createdFontLinkRef.current = null;
      }
    };
  }, []);
  
  return (
    <div ref={elementRef} className="performance-optimized">
      {children}
    </div>
  );
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount - 1
  );
  
  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, i) => startIndex + i
  );
  
  const totalHeight = itemCount * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}
