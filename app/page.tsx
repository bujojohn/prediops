import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-6">⚽</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Prediops
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          AI-powered sports predictions and value betting opportunities across 111+ leagues worldwide
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/predictions"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Predictions
          </Link>
          <Link 
            href="/value-bets"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Value Bets
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Professional-grade algorithms analyze match data to provide accurate predictions
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">Value Bets</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Identify profitable betting opportunities with our advanced value betting analysis
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-4xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold mb-2">Live Matches</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Real-time scores and match updates from leagues around the world
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Platform Statistics</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">111+</div>
            <div className="text-gray-700 dark:text-gray-300">Leagues Covered</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-700 dark:text-gray-300">Live Updates</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
            <div className="text-gray-700 dark:text-gray-300">Powered Analysis</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">Global</div>
            <div className="text-gray-700 dark:text-gray-300">Coverage</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          Test your API connection and start exploring predictions
        </p>
        <Link 
          href="/test"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Test API Connection
        </Link>
      </div>
    </div>
  );
}
