import { getCountries } from '@/lib/data/countries';
import { getCountryPredictionsUrl, generateCountrySlug } from '@/lib/utils/country-utils';

export default function TestRoutingPage() {
  const countries = getCountries().slice(0, 20); // Show first 20 countries

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Routing Test Page</h1>
      <p className="mb-4">This page shows the URLs being generated for each country to help debug 404 errors.</p>
      
      <div className="grid gap-4">
        {countries.map((country) => {
          const slug = generateCountrySlug(country);
          const url = getCountryPredictionsUrl(country);
          
          return (
            <div key={country.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{country.name} (ID: {country.id})</h3>
              <div className="text-sm text-gray-600 mt-2">
                <div><strong>Generated Slug:</strong> {slug}</div>
                <div><strong>Full URL:</strong> {url}</div>
                <div><strong>Expected Route:</strong> /predictions/country/{slug}?id={country.id}</div>
              </div>
              
              {/* Test if the route exists */}
              <div className="mt-2">
                <a 
                  href={url} 
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test Link
                </a>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if the generated URLs match the actual route files</li>
          <li>Verify that the country slugs are valid (no special characters)</li>
          <li>Test each link to see which ones return 404</li>
          <li>Check the browser console for any error messages</li>
          <li>Verify that the SportMonks API is working correctly</li>
        </ol>
      </div>
    </div>
  );
}
