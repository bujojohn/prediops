import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Globe, 
  Shield, 
  Clock, 
  BarChart3, 
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Prediops - AI-Powered Sports Predictions & Value Betting',
  description: 'Professional sports predictions and value betting opportunities across 111+ leagues worldwide. Get AI-powered insights, live scores, and profitable betting opportunities.',
  keywords: 'sports predictions, value betting, AI predictions, live scores, football predictions, betting analysis',
  openGraph: {
    title: 'Prediops - AI-Powered Sports Predictions',
    description: 'Professional sports predictions and value betting opportunities across 111+ leagues worldwide.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <Badge variant="secondary" className="mb-6 text-sm">
              🚀 AI-Powered Sports Predictions
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              Prediops
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Professional sports predictions and value betting opportunities across{' '}
              <span className="font-semibold text-blue-600">111+ leagues</span> worldwide
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                <Link href="/predictions">
                  <Target className="mr-2 h-5 w-5" />
                  View Predictions
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
                <Link href="/value-bets">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Value Bets
                </Link>
              </Button>
            </div>
            
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-blue-600">111+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Leagues</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Live Updates</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Powered</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-orange-600">Global</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Why Choose Prediops?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Advanced AI algorithms, comprehensive data analysis, and real-time insights to help you make informed decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl w-fit mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Predictions</CardTitle>
                <CardDescription className="text-base">
                  Professional-grade algorithms analyze match data, team performance, and historical patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Machine learning models
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real-time data analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Probability calculations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Value Betting</CardTitle>
                <CardDescription className="text-base">
                  Identify profitable betting opportunities with advanced value betting analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Odds comparison
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Expected value calculations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Risk assessment
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl w-fit mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Live Matches</CardTitle>
                <CardDescription className="text-base">
                  Real-time scores, match updates, and live statistics from leagues worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Live score updates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Match statistics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real-time notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl w-fit mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Global Coverage</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive coverage of 111+ leagues from around the world
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Major leagues
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Regional competitions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    International tournaments
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                <CardDescription className="text-base">
                  Deep statistical analysis and performance metrics for informed decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Team performance data
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Historical trends
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Statistical models
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-xl w-fit mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Reliable</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-grade security and reliable data from trusted sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Data encryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    API reliability
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Regular updates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Test your API connection and start exploring professional sports predictions today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg">
              <Link href="/test">
                <Play className="mr-2 h-5 w-5" />
                Test API Connection
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/predictions">
                <ArrowRight className="mr-2 h-5 w-5" />
                Explore Predictions
              </Link>
            </Button>
          </div>
        </div>
      </section>


    </div>
  );
}
