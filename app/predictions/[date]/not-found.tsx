import Link from 'next/link';
import { Calendar, Home } from 'lucide-react';

export default function PredictionsDateNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Date Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The date you&apos;re looking for doesn&apos;t exist or is invalid. 
          Please check the format (YYYY-MM-DD) and try again.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/predictions"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Go to Predictions
          </Link>
          
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
