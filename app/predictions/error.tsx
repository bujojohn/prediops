'use client';

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Failed to load predictions
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {error.message || 'An error occurred while loading predictions. Please check your API connection and try again.'}
        </p>
        <button 
          onClick={reset} 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 