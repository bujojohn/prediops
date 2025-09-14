'use client';

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Client-side dynamic imports for heavy components
export const LazySidebarWrapper = dynamic(
  () => import("../navigation/SidebarWrapper").then(mod => ({ default: mod.SidebarWrapper })),
  {
    loading: () => <div className="w-64 bg-gray-100 animate-pulse h-screen" />,
    ssr: false
  }
);

export const LazyFooter = dynamic(
  () => import("../layout/Footer").then(mod => ({ default: mod.Footer })),
  {
    loading: () => <div className="h-32 bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

// Performance wrapper component
export function ClientSideOptimizer({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 rounded" />}>
      {children}
    </Suspense>
  );
}
