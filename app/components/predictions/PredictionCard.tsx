interface Prediction {
  fixture_id: number;
  name?: string;
  starting_at?: string;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  participants?: Array<{
    name: string;
    meta: {
      location: 'home' | 'away';
    };
  }>;
}

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const homeTeam = prediction.participants?.find(p => p.meta.location === 'home')?.name || 'Home';
  const awayTeam = prediction.participants?.find(p => p.meta.location === 'away')?.name || 'Away';
  
  const getConfidenceColor = (probability: number) => {
    if (probability > 0.6) return 'text-green-600 bg-green-50';
    if (probability > 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const highestProb = Math.max(
    prediction.probabilities.home,
    prediction.probabilities.draw,
    prediction.probabilities.away
  );

  return (
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">
          {prediction.name || `${homeTeam} vs ${awayTeam}`}
        </h3>
        {prediction.starting_at && (
          <span className="text-xs text-gray-500">
            {new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(prediction.starting_at))}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className={`text-center p-2 rounded ${
          prediction.probabilities.home === highestProb ? getConfidenceColor(highestProb) : 'bg-gray-50'
        }`}>
          <div className="text-xs text-gray-600 mb-1">{homeTeam}</div>
          <div className="font-bold text-lg">
            {(prediction.probabilities.home * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className={`text-center p-2 rounded ${
          prediction.probabilities.draw === highestProb ? getConfidenceColor(highestProb) : 'bg-gray-50'
        }`}>
          <div className="text-xs text-gray-600 mb-1">Draw</div>
          <div className="font-bold text-lg">
            {(prediction.probabilities.draw * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className={`text-center p-2 rounded ${
          prediction.probabilities.away === highestProb ? getConfidenceColor(highestProb) : 'bg-gray-50'
        }`}>
          <div className="text-xs text-gray-600 mb-1">{awayTeam}</div>
          <div className="font-bold text-lg">
            {(prediction.probabilities.away * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-500">
          Confidence: {(highestProb * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
} 