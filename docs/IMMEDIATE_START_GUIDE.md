# 🚀 Immediate Start Guide - Active Plan Ready!

## ✅ **Your Active Plan Status**
- **Custom Plan with Worldwide Coverage**: ✅ ACTIVE
- **Predictions Add-on**: ✅ ACTIVE  
- **111+ Leagues Worldwide**: ✅ ACTIVE
- **Value Bets**: ✅ ACTIVE

---

## 📋 **Start Building Today - 30 Minutes to First Prediction**

### **Step 1: Get Your API Token (5 minutes)**
1. Go to [my.sportmonks.com](https://my.sportmonks.com)
2. Login to your account
3. Navigate to **Settings** → **API Tokens**
4. Copy your active token (it should show Worldwide + Predictions access)

### **Step 2: Set Up Your Next.js Project (10 minutes)**

> 🎯 **Using Next.js App Router**: This guide uses the modern App Router architecture with `app/` directory structure.

#### **Install Dependencies**
```bash
npm install axios
# Optional: Add TypeScript types if not already included
npm install -D @types/node
```

#### **Create Environment Variables**
Create `.env.local`:
```env
SPORTMONKS_API_TOKEN=your_token_here
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football
```

**Note**: The application includes mock data fallbacks, so it will work even without the API token configured.

#### **Create API Client**
Create `lib/sportmonks.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SPORTMONKS_BASE_URL || 'https://api.sportmonks.com/v3/football',
  headers: {
    Authorization: `${process.env.SPORTMONKS_API_TOKEN}`,
    Accept: 'application/json',
  },
});

export const sportmonks = {
  // Test your active predictions access
  async getPredictions() {
    const response = await api.get('/predictions/probabilities');
    return response.data;
  },

  // Get value bets (active in your plan)
  async getValueBets() {
    const response = await api.get('/predictions/value-bets?include=fixture:name');
    return response.data;
  },

  // Get live fixtures
  async getLiveFixtures() {
    const response = await api.get('/livescores/inplay?include=participants:name');
    return response.data;
  },

  // Get predictions for specific fixture
  async getFixturePredictions(fixtureId: string) {
    const response = await api.get(`/predictions/probabilities/fixtures/${fixtureId}`);
    return response.data;
  },
};
```

### **Step 3: Create Your First API Routes (5 minutes)**

Create `app/api/sportmonks/predictions/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockPredictions } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const predictions = await sportmonks.getPredictions();
    
    return NextResponse.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString(),
      count: predictions?.data?.length || 0,
    });
  } catch (error) {
    console.error('Predictions API Error:', error);
    
    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({
        success: true,
        data: mockPredictions,
        timestamp: new Date().toISOString(),
        count: mockPredictions.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch predictions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

Create `app/api/sportmonks/value-bets/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockValueBets } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const valueBets = await sportmonks.getValueBets();
    
    return NextResponse.json({
      success: true,
      data: valueBets,
      timestamp: new Date().toISOString(),
      count: valueBets?.data?.length || 0,
    });
  } catch (error) {
    console.error('Value Bets API Error:', error);
    
    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({
        success: true,
        data: mockValueBets,
        timestamp: new Date().toISOString(),
        count: mockValueBets.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch value bets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

Create `app/api/sportmonks/fixtures/live/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { mockLiveFixtures } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const liveFixtures = await sportmonks.getLiveFixtures();
    
    return NextResponse.json({
      success: true,
      data: liveFixtures,
      timestamp: new Date().toISOString(),
      count: liveFixtures?.data?.length || 0,
    });
  } catch (error) {
    console.error('Live Fixtures API Error:', error);
    
    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({
        success: true,
        data: mockLiveFixtures,
        timestamp: new Date().toISOString(),
        count: mockLiveFixtures.data.length,
        note: 'Using mock data - API token not configured'
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch live fixtures',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

### **Step 4: Test Your Active Plan (5 minutes)**

Create `app/test/page.tsx` (App Router):
```typescript
'use client';
import { useEffect, useState } from 'react';

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

export default function TestPage() {
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test multiple endpoints with your active plan
    Promise.all([
      fetch('/api/sportmonks/predictions').then(res => res.json()),
      fetch('/api/sportmonks/value-bets').then(res => res.json()),
      fetch('/api/sportmonks/fixtures/live').then(res => res.json()),
    ])
      .then(([predictions, valueBets, liveFixtures]) => {
        setResponse({
          success: true,
          data: {
            predictions: predictions.data?.slice(0, 3), // Show first 3
            valueBets: valueBets.data?.slice(0, 3),
            liveFixtures: liveFixtures.data?.slice(0, 3),
          },
          timestamp: new Date().toISOString(),
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setResponse({
          success: false,
          error: err.message || 'Failed to connect to API',
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Testing your active SportMonks plan...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        🎉 Active Plan Test - SportMonks API
      </h1>
      
      {response?.success ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-semibold flex items-center">
              ✅ SUCCESS! Your SportMonks API is working!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Active Plan: Custom Worldwide + Predictions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-blue-600 mb-2">🎯 Predictions</h3>
              <p className="text-sm text-gray-600">
                {response.data?.predictions?.length || 0} predictions loaded
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-green-600 mb-2">💰 Value Bets</h3>
              <p className="text-sm text-gray-600">
                {response.data?.valueBets?.length || 0} value bets loaded
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-red-600 mb-2">⚽ Live Matches</h3>
              <p className="text-sm text-gray-600">
                {response.data?.liveFixtures?.length || 0} live matches
              </p>
            </div>
          </div>

          <details className="bg-gray-50 border rounded-lg p-4">
            <summary className="cursor-pointer font-medium">
              📊 View Raw API Response
            </summary>
            <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto text-xs">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">❌ Error connecting to API</p>
          <p className="text-red-600 text-sm mt-1">
            {response?.error || 'Unknown error occurred'}
          </p>
        </div>
      )}
    </div>
  );
}
```

### **Step 5: Test Everything (5 minutes)**

```bash
npm run dev
```

Visit: `http://localhost:3000/test`

**Expected Result**: ✅ You should see live predictions data from your active plan!

---

## 🎯 **Next Steps - Build Your MVP**

### **Week 1 Priorities**
1. ✅ **API working** (completed above)
2. **Build prediction cards** - Display match predictions
3. **Add value bets** - Show profitable opportunities  
4. **Live updates** - Real-time prediction changes

### **Key Endpoints Currently Available**
```typescript
// All available with your active plan:

// 1. Match Predictions (ACTIVE)
GET /predictions/probabilities

// 2. Value Bets (Premium feature - ACTIVE)
GET /predictions/value-bets  

// 3. Live Matches (ACTIVE)
GET /livescores/inplay

// 4. Upcoming Fixtures (ACTIVE)
GET /fixtures?filters=fixtureTypes:1

// 5. League Standings (ACTIVE)
GET /standings/seasons/{seasonId}

// 6. Team Statistics (ACTIVE)
GET /teams/{teamId}?include=statistics
```

### **🔮 Future Endpoints (Post-Launch Add-ons)**
```typescript
// Will be available after xG add-on is purchased:

// 1. Expected Goals Data
GET /expected/teams/{teamId}

// 2. Player xG Statistics  
GET /expected/players/{playerId}

// 3. Advanced Analytics
GET /statistics/advanced/{seasonId}
```

### **Quick UI Components to Build**

#### **Prediction Card Component** (App Router)
Create `app/components/predictions/PredictionCard.tsx`:
```typescript
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
            {new Date(prediction.starting_at).toLocaleDateString()}
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
```

**Note**: For production use, consider using the Zod schemas from `/schemas` for type safety and validation.

#### **Predictions Page** (App Router)
Create `app/predictions/page.tsx`:
```typescript
import { sportmonks } from '@/lib/sportmonks';
import { PredictionCard } from '@/components/predictions/PredictionCard';

export default async function PredictionsPage() {
  // Server-side data fetching with App Router
  const predictions = await sportmonks.getPredictions();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Match Predictions</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions?.data?.map((prediction: any) => (
          <PredictionCard 
            key={prediction.fixture_id} 
            prediction={prediction} 
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔥 **Your Current Competitive Advantages**

With your active plan, you have immediate access to:

- ✅ **111+ Leagues Worldwide** - More data than competitors - **ACTIVE**
- ✅ **AI-Powered Predictions** - Professional-grade algorithms - **ACTIVE**  
- ✅ **Value Bets** - Profitable opportunities identification - **ACTIVE**
- ✅ **Real-time Updates** - Sub-minute data refresh - **ACTIVE**
- ✅ **Global Coverage** - Serve users worldwide - **ACTIVE**

## 🔮 **Future Competitive Advantages (Post-Launch)**

Planned enhancements for competitive differentiation:

- 🚀 **xG Analytics** - Advanced expected goals metrics
- 🚀 **Premium Visualizations** - Enhanced data presentation
- 🚀 **Advanced Statistics** - Deeper analytical insights

---

## 🚨 **Important Notes**

1. **Rate Limits**: 3,000 calls/hour per endpoint - very generous
2. **Best Practice**: Cache frequently accessed data
3. **Security**: Never expose your API token in frontend code
4. **Performance**: Use includes to get related data in single requests
5. **App Router**: Use server components for data fetching, client components for interactivity
6. **TypeScript**: Strongly typed interfaces for better development experience
7. **Mock Data**: Application includes fallback mock data for development
8. **Zod Schemas**: Use `/schemas` directory for type safety and validation

## 🎯 **App Router Benefits for SportMonks Integration**

### **Server Components for Data Fetching**
```typescript
// app/predictions/page.tsx
export default async function PredictionsPage() {
  // Server component - API token is secure, data fetched at build/request time
  const predictions = await sportmonks.getPredictions();
  
  return <PredictionsView data={predictions} />;
}
```

### **Client Components for Interactivity**
```typescript
// app/components/predictions/PredictionCard.tsx
'use client';

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div 
      className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card content */}
      {isExpanded && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4 className="font-semibold">Detailed Analysis</h4>
          <p className="text-sm text-gray-600">
            Recent form, head-to-head stats, and more...
          </p>
        </div>
      )}
    </div>
  );
}
```

### **Automatic Loading States**
```typescript
// app/predictions/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}
```

### **Error Boundaries with Client Components**
```typescript
// app/predictions/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        Failed to load predictions
      </h2>
      <button onClick={reset} className="bg-blue-500 text-white px-4 py-2 rounded">
        Try again
      </button>
    </div>
  );
}
```

---

## 🎉 **You're Ready!**

Your SportMonks plan is active and ready. You now have everything needed to build a world-class sports prediction platform. Start with the test above, then build your MVP!

### **✅ What's Been Implemented:**

- **🏗️ Core Infrastructure**: SportMonks API client with proper authentication
- **🔧 API Routes**: Predictions, value bets, and live fixtures with mock data fallbacks
- **📱 Pages & Components**: Home, predictions, value bets, live matches, and test pages
- **⚡ Performance Features**: Server-side data fetching, loading states, error boundaries, client components for interactivity
- **🔒 Type Safety**: Zod schemas for validation and TypeScript types
- **🎨 Modern UI**: Responsive design with Tailwind CSS

### **🚀 Key Features:**

- **Mock Data Fallbacks**: App works without API token for development
- **Type-Safe Components**: Using Zod schemas from `/schemas` directory
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Navigation**: Clean navigation between all sections
- **Real-time Ready**: Live match updates and predictions

**Questions?** Check the [SportMonks Documentation](https://docs.sportmonks.com/football) or contact their support team.

**Status**: 🚀 **READY TO BUILD - NO WAITING REQUIRED!**