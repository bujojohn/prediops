export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 bg-white shadow">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="border rounded-lg p-3 mb-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 