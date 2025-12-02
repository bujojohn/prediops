import type { ValueBetStats } from '@/lib/utils/value-bet-utils';

interface ValueBetHeroProps {
  stats: ValueBetStats;
}

export function ValueBetHero({ stats }: ValueBetHeroProps) {
  return (
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
              <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
              <div className="text-sm text-green-100">Total Bets</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{stats.valueBetsCount}</div>
              <div className="text-sm text-green-100">Value Bets</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{stats.averageValue.toFixed(2)}</div>
              <div className="text-sm text-green-100">Avg Value</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{stats.highValueBets}</div>
              <div className="text-sm text-green-100">High Value</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

