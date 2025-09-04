import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Search } from 'lucide-react';

export default function CountryNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Country Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          The country you&apos;re looking for could not be found. This might be due to:
        </p>
        
        <div className="text-left text-sm text-gray-600 mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Invalid or malformed URL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Country name with special characters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>API connectivity issues</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <Link href="/countries">
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Browse All Countries
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-semibold mb-2">Debug Information:</p>
          <p>If you&apos;re seeing this page frequently, check:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Browser console for error messages</li>
            <li>Network tab for failed API requests</li>
            <li>SportMonks API configuration</li>
            <li>Country data integrity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
