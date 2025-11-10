export default function FixtureLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
            </div>
            <div className="flex-shrink-0 px-8">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


