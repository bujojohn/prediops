import { sportmonks } from '@/lib/sportmonks';
import { ValueBetCard } from '../components/value-bets/ValueBetCard';
import { ValueBet } from '@/schemas/valuebet.schema';

type ValueBets = {
  data: ValueBet[];
};

export default async function ValueBetsPage() {
  // Server-side data fetching with App Router
  const valueBets: ValueBets = await sportmonks.getValueBets();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Value Bets</h1>
        <p className="text-gray-600">
          Profitable betting opportunities identified by AI analysis
        </p>
      </div>
      
      {valueBets?.data?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueBets.data.map((valueBet: ValueBet) => (
            <ValueBetCard 
              key={valueBet.fixture_id} 
              valueBet={valueBet} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No value bets available
          </h3>
          <p className="text-gray-500">
            Check back later for updated value betting opportunities
          </p>
        </div>
      )}
    </div>
  );
} 