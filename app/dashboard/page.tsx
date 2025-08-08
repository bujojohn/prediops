import { sportmonks } from '@/lib/sportmonks';
import { CountriesListClient } from '@/app/components/countries/CountriesListClient';

export default async function DashboardPage() {
  // Server-side data fetching
  let countries = [];
  
  try {
    const response = await sportmonks.getCountries({
      includes: ['continent', 'leagues'],
      select: ['name', 'official_name', 'fifa_name', 'iso2', 'iso3', 'image_path'],
      order: 'asc',
      sortBy: 'name'
    });
    
    countries = response.data || [];
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    // Fallback to empty array - client component will handle this gracefully
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Prediops - Your Football Prediction Platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Countries List */}
        <div className="lg:col-span-1">
          <CountriesListClient initialCountries={countries} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">New predictions available</p>
                  <p className="text-sm text-gray-600">5 new predictions for today`s matches</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Live matches</p>
                  <p className="text-sm text-gray-600">3 matches currently in progress</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Value bets detected</p>
                  <p className="text-sm text-gray-600">2 high-value betting opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
