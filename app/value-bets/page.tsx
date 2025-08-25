import { Metadata } from 'next';
import { sportmonks } from '@/lib/sportmonks';
import { ValueBetCard } from '../components/value-bets/ValueBetCard';
import { ValueBet } from '@/schemas/valuebet.schema';
import { ValueBetsClient } from './value-bets-client';

export const metadata: Metadata = {
  title: 'Value Bets - Prediops | AI-Powered Betting Opportunities',
  description: 'Discover profitable betting opportunities with AI-powered value betting analysis. Get real-time odds comparison, expected value calculations, and risk assessment.',
  keywords: 'value betting, betting opportunities, odds comparison, expected value, betting analysis, profitable bets',
  openGraph: {
    title: 'Value Bets - Prediops',
    description: 'AI-powered value betting opportunities with real-time analysis',
    type: 'website',
  },
};

type ValueBets = {
  data: ValueBet[];
};

export default async function ValueBetsPage() {
  // Server-side data fetching with App Router
  const valueBets: ValueBets = await sportmonks.getValueBets();
  
  // Calculate statistics
  const totalBets = valueBets?.data?.length || 0;
  const valueBetsCount = valueBets?.data?.filter(bet => bet.predictions.is_value)?.length || 0;
  const averageValue = valueBets?.data?.length > 0 
    ? valueBets.data.reduce((sum, bet) => sum + bet.predictions.stake, 0) / valueBets.data.length 
    : 0;
  const highValueBets = valueBets?.data?.filter(bet => bet.predictions.stake > 0.1)?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <span className="text-3xl">💰</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Value Bets
            </h1>
            
            <p className="text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered betting opportunities with real-time odds comparison and expected value analysis
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{totalBets}</div>
                <div className="text-sm text-green-100">Total Bets</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{valueBetsCount}</div>
                <div className="text-sm text-green-100">Value Bets</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{averageValue.toFixed(2)}</div>
                <div className="text-sm text-green-100">Avg Value</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{highValueBets}</div>
                <div className="text-sm text-green-100">High Value</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <ValueBetsClient valueBets={valueBets?.data || []} />
        </div>
      </section>
    </div>
  );
} 