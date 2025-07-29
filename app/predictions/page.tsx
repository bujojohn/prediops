import { sportmonks } from '@/lib/sportmonks';
import { PredictionCard } from '../components/predictions/PredictionCard';

export default async function PredictionsPage() {
  // Server-side data fetching with App Router
  const predictions = await sportmonks.getPredictions();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Predictions</h1>
        <p className="text-gray-600">
          AI-powered predictions for upcoming matches across 111+ leagues worldwide
        </p>
      </div>
      
      {predictions?.data?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.data.map((prediction: any) => (
            <PredictionCard 
              key={prediction.fixture_id} 
              prediction={prediction} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No predictions available
          </h3>
          <p className="text-gray-500">
            Check back later for updated predictions
          </p>
        </div>
      )}
    </div>
  );
} 