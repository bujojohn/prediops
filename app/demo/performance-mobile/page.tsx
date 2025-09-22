import { PerformanceMobileExample } from '@/app/components/examples/PerformanceMobileExample';

/**
 * Demo page showcasing the new performance and mobile optimizations
 * Visit /demo/performance-mobile to see the components in action
 */
export default function PerformanceMobileDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PerformanceMobileExample />
    </div>
  );
}

export const metadata = {
  title: 'Performance & Mobile Demo - Prediops',
  description: 'Demonstration of performance-optimized and mobile-responsive fixture display components',
};
