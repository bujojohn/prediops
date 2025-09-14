'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !window.location.search.includes('debug=perf')) {
      return;
    }

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`Performance Metric: ${entry.name}`, {
          value: entry.value,
          startTime: entry.startTime,
          duration: entry.duration,
        });
      }
    });

    // Observe LCP, FID, CLS, FCP, TTFB
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'first-contentful-paint', 'navigation'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor long tasks that could affect INP
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`Long Task Detected: ${entry.duration}ms`, {
            startTime: entry.startTime,
            duration: entry.duration,
          });
        }
      }
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long Task Observer not supported:', error);
    }

    return () => {
      observer.disconnect();
      longTaskObserver.disconnect();
    };
  }, []);

  return null;
}
