# SportMonks API Documentation & Project Requirements Analysis

## Overview
SportMonks is a comprehensive sports data provider that offers reliable, real-time sports data through well-structured APIs. Their primary focus is on **Football (Soccer) API**, with additional coverage for Cricket and Formula 1.

## Key SportMonks API Features

### 🏆 **Core Data Coverage**
- **2,200+ football leagues worldwide**
- **Real-time livescores and match updates**
- **Comprehensive player, team, and match statistics**
- **Historical data spanning multiple seasons**
- **Live odds and predictions**

### 📊 **Available Endpoints**
1. **Livescores**: Real-time match updates
2. **Fixtures**: Match schedules and results
3. **Teams & Players**: Detailed profiles and statistics
4. **Leagues & Seasons**: Competition structures
5. **Standings**: League tables and rankings
6. **Statistics**: Advanced metrics and analytics
7. **Odds**: Pre-match and live betting odds
8. **Predictions**: AI-powered match predictions
9. **xG (Expected Goals)**: Advanced analytics
10. **News**: Pre and post-match articles

### 🛠 **Developer-Friendly Features**

#### **Flexible Request Options**
- **Includes**: Enrich responses with related data (34+ includes for fixtures)
- **Field Selection**: Choose specific fields to optimize responses
- **Filtering**: Apply complex filters to data
- **Sorting & Ordering**: Customize data presentation
- **Nested Includes**: Chain multiple related data sets

#### **Advanced Customization**
```javascript
// Example: Get fixture with scores, events, and statistics
GET /fixtures/12345?include=scores,events,statistics&select=name,starting_at
```

### 💰 **Pricing Plans**
1. **Free Plan**: Limited access for testing
2. **European Plan**: 27 major European leagues
3. ✅ **Worldwide Plan**: 111+ global leagues - **CURRENT ACTIVE PLAN**
4. **Enterprise Plan**: All 2,200+ leagues
5. ✅ **Custom Plans**: Tailored to specific needs - **ACTIVE CONFIGURATION**

### 🎯 **Active Add-ons**
✅ **Predictions API Add-on**: ACTIVE - Full access to AI predictions and value bets

### 🔧 **Technical Specifications**
- **Rate Limit**: 3,000 API calls per hour per endpoint
- **Response Format**: JSON
- **Authentication**: API token-based
- **Real-time Updates**: Sub-minute data refresh
- **Uptime**: 99.9%+ reliability

## Project Context: PrediOps

Based on the project name "prediops" (predictions + operations), this appears to be a **sports prediction and analytics platform**. 

### 📋 **Current Plan Status: ACTIVE**
✅ **Custom Plan with Worldwide Coverage (111+ leagues)**
✅ **Predictions Add-on**: ACTIVE
✅ **Global Coverage**: Access to major leagues worldwide including European, American, Asian, and African competitions

### 🎯 **Currently Active Capabilities**
1. ✅ **Predictions API**: Pre-built AI models for match outcomes - **ACTIVE**
2. ✅ **Value Bets**: Bookmaker odds comparison - **ACTIVE**
3. ✅ **Historical Data**: Essential for prediction model training - **ACTIVE**
4. ✅ **Real-time Data**: Live updates for active predictions - **ACTIVE**
5. ✅ **Worldwide Coverage**: 111+ leagues across all continents - **ACTIVE**

### 🔮 **Future Add-ons (Post-Launch)**
🚀 **xG (Expected Goals) Metrics**: Advanced analytics - **PLANNED POST-LAUNCH**
🚀 **Additional Premium Analytics**: Enhanced statistics - **PLANNED POST-LAUNCH**
🚀 **Advanced Visualizations**: Enhanced data presentation - **PLANNED POST-LAUNCH**

### 📋 **Integration Requirements**

#### **Essential Dependencies**
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "next": "15.1.0",
    "react": "^19.0.0"
  }
}
```

#### **Environment Variables Needed**
```env
SPORTMONKS_API_TOKEN=your_api_token_here
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **Core API Integration Structure** (App Router)
```typescript
// lib/sportmonks.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SPORTMONKS_BASE_URL,
  params: {
    api_token: process.env.SPORTMONKS_API_TOKEN,
  },
});

export const sportmonks = {
  // Predictions API (Active)
  async getPredictions() {
    const response = await api.get('/predictions/probabilities');
    return response.data;
  },

  async getFixturePredictions(fixtureId: string) {
    const response = await api.get(`/predictions/probabilities/fixtures/${fixtureId}`);
    return response.data;
  },

  // Value Bets API (Active)
  async getValueBets() {
    const response = await api.get('/predictions/value-bets');
    return response.data;
  },

  // Live Data API (Active)
  async getLiveFixtures() {
    const response = await api.get('/livescores/inplay');
    return response.data;
  },

  // Fixtures API (Active)
  async getFixtures(params?: { date?: string; league?: string }) {
    const response = await api.get('/fixtures', { params });
    return response.data;
  },

  // Teams API (Active)
  async getTeam(teamId: string, includes?: string[]) {
    const includeParam = includes ? includes.join(',') : '';
    const response = await api.get(`/teams/${teamId}`, {
      params: includeParam ? { include: includeParam } : {},
    });
    return response.data;
  },

  // Future: xG API (Post-launch add-on)
  async getXGData(teamId: string) {
    // Will be available after xG add-on purchase
    const response = await api.get(`/expected/teams/${teamId}`);
    return response.data;
  },
};

// TypeScript interfaces
export interface Prediction {
  fixture_id: number;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  bookmaker_comparison?: {
    best_odds: {
      home: number;
      draw: number;
      away: number;
    };
  };
}

export interface ValueBet {
  fixture_id: number;
  market: string;
  selection: string;
  odds: number;
  probability: number;
  value: number;
  bookmaker: string;
}

export interface LiveFixture {
  id: number;
  name: string;
  starting_at: string;
  state: {
    name: string;
  };
  scores?: {
    home: number;
    away: number;
  };
}
```

### 🏗 **Recommended Architecture** (Next.js App Router)

#### **App Router Structure**
```
app/
├── api/                 # API Routes (App Router)
│   └── sportmonks/
│       ├── predictions/
│       │   ├── route.ts         # GET /api/sportmonks/predictions
│       │   └── [id]/route.ts    # GET /api/sportmonks/predictions/[id]
│       ├── fixtures/
│       │   ├── route.ts         # GET /api/sportmonks/fixtures
│       │   └── live/route.ts    # GET /api/sportmonks/fixtures/live
│       ├── value-bets/
│       │   └── route.ts         # GET /api/sportmonks/value-bets
│       └── teams/
│           └── [id]/route.ts    # GET /api/sportmonks/teams/[id]
├── predictions/         # Predictions Pages
│   ├── page.tsx         # /predictions - Main predictions page
│   ├── [id]/page.tsx    # /predictions/[id] - Specific match
│   └── loading.tsx      # Loading UI
├── live/               # Live Matches Pages
│   ├── page.tsx        # /live - Live matches dashboard
│   └── loading.tsx     # Loading UI
├── analytics/          # Analytics Pages (Future xG)
│   ├── page.tsx        # /analytics - Analytics dashboard
│   └── teams/
│       └── [id]/page.tsx # /analytics/teams/[id]
├── components/         # Reusable Components
│   ├── predictions/
│   │   ├── PredictionCard.tsx
│   │   ├── PredictionsList.tsx
│   │   └── PredictionDetails.tsx
│   ├── matches/
│   │   ├── LiveScore.tsx
│   │   ├── FixtureList.tsx
│   │   └── MatchAnalytics.tsx
│   ├── analytics/      # Future xG components
│   │   ├── XGChart.tsx
│   │   ├── TrendsGraph.tsx
│   │   └── TeamComparison.tsx
│   └── ui/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── Navigation.tsx
├── lib/                # Utilities & API Client
│   ├── sportmonks.ts   # API client
│   ├── utils.ts        # Helper functions
│   └── types.ts        # TypeScript interfaces
├── globals.css         # Global styles
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── loading.tsx        # Global loading UI
└── error.tsx          # Global error UI
```

#### **Key App Router Features Used**
- ✅ **Route Handlers**: `route.ts` files for API endpoints
- ✅ **Server Components**: Default for optimal performance
- ✅ **Client Components**: `'use client'` for interactive features
- ✅ **Layouts**: Nested layouts for consistent UI
- ✅ **Loading UI**: Built-in loading states
- ✅ **Error Boundaries**: Automatic error handling

### 📊 **Key Features to Implement**

#### **1. Match Predictions Dashboard**
- Real-time prediction updates
- Confidence intervals
- Historical accuracy tracking
- Value bet identification

#### **2. Live Analytics Feed**
- xG progression during matches
- Live odds tracking
- Prediction model updates
- Social sentiment integration

#### **3. Historical Analysis**
- Team performance trends
- Player impact analysis
- League-specific patterns
- Seasonal comparisons

### 🔒 **Security & Best Practices**

#### **API Key Protection** (App Router)
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Validate SportMonks API routes
  if (request.nextUrl.pathname.startsWith('/api/sportmonks')) {
    // Add rate limiting and validation for internal API routes
    const apiKey = request.headers.get('x-api-key');
    
    // Optional: Add internal API key validation
    // if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Add CORS headers for API routes
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/sportmonks/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### **Error Handling** (App Router)
```typescript
// lib/errors.ts
export class SportMonksError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SportMonksError';
  }
}

// app/api/sportmonks/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { SportMonksError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const predictions = await sportmonks.getPredictions();
    
    return NextResponse.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Predictions API Error:', error);
    
    if (error instanceof SportMonksError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          status: error.status 
        },
        { status: error.status }
      );
    }
    
    // Handle unexpected errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to fetch predictions' 
      },
      { status: 500 }
    );
  }
}

// app/error.tsx (Global Error Boundary)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### 🚀 **Implementation Roadmap** (Updated for Active Plan)

#### **Phase 1: MVP Launch Preparation** (Week 1)
- [x] ✅ SportMonks API account setup - **COMPLETED**
- [x] ✅ Predictions add-on activated - **COMPLETED**
- [x] ✅ Worldwide plan access - **COMPLETED**
- [ ] Create API client and authentication
- [ ] Test predictions endpoints with active token
- [ ] Set up basic project structure

#### **Phase 2: Core Predictions Platform** (Week 2)
- [ ] **Priority**: Integrate active Predictions API
- [ ] Build prediction display components
- [ ] Implement value bet detection (available in plan)
- [ ] Create real-time prediction updates
- [ ] Add worldwide leagues support

#### **Phase 3: Platform Enhancement** (Week 3)
- [ ] Multi-league prediction dashboard
- [ ] Historical trend analysis (basic level)
- [ ] Performance tracking across 111+ leagues
- [ ] User interface optimization

#### **Phase 4: Launch & Scale** (Week 4)
- [ ] Implement caching for worldwide data
- [ ] Performance optimization for large datasets
- [ ] User experience enhancements
- [ ] Production deployment and monitoring
- [ ] **🚀 MVP LAUNCH**

#### **Phase 5: Post-Launch Enhancements** (Week 5+)
- [ ] 🔮 **Add xG (Expected Goals) add-on**
- [ ] 🔮 **Advanced analytics integration**
- [ ] 🔮 **Enhanced visualization features**
- [ ] 🔮 **Premium statistics dashboard**
- [ ] 🔮 **Advanced prediction models**

#### **🎯 Current Timeline Benefits**
- **No setup delays**: API access already active
- **Immediate predictions**: Start building with live data
- **Global scope**: Test with worldwide leagues from day 1
- **Value bet features**: Premium functionality available immediately
- **Scalable roadmap**: Plan for post-launch feature expansion

### 📈 **Expected Outcomes**
- **Real-time prediction accuracy**: 65-75% for major leagues
- **Data refresh rate**: < 2 minutes for live matches
- **User engagement**: Interactive prediction tracking
- **Scalability**: Support for multiple leagues simultaneously

### 💡 **Additional Considerations** (Active Plan)
- ✅ **Data costs**: Custom Worldwide Plan active - budget allocated
- **Caching strategy**: Implement Redis for 111+ leagues data management
- **Mobile responsiveness**: Ensure optimal mobile experience across global users
- **SEO optimization**: Server-side rendering for better discovery
- **Global performance**: CDN strategy for worldwide league data delivery
- **Rate limit management**: 3,000 calls/hour across multiple leagues - monitor usage

### 🔮 **Post-Launch Expansion Strategy**

#### **xG Add-on Integration Plan**
Once the MVP is launched and generating user engagement:

1. **Purchase xG Add-on** from SportMonks
2. **Enhanced Analytics Dashboard**:
   ```typescript
   // New xG endpoints to integrate
   GET /expected/teams/{teamId}      # Team xG metrics
   GET /expected/players/{playerId}  # Player xG stats
   GET /expected/fixtures/{fixtureId} # Match xG data
   ```

3. **Advanced Visualization Components**:
   - xG progression charts during live matches
   - Player performance vs. expected performance
   - Team attacking/defensive efficiency metrics
   - Historical xG trends and patterns

4. **Competitive Differentiation**:
   - Advanced prediction models using xG data
   - Premium analytics for professional users
   - Enhanced value bet detection using xG metrics

#### **ROI Optimization**
- **Phase 1**: Launch with core predictions → Validate user demand
- **Phase 2**: Add xG analytics → Premium feature differentiation
- **Phase 3**: Advanced ML models → Professional market entry

### 🎯 **Immediate Action Items**
1. **Today**: Get API token from my.sportmonks.com dashboard
2. **Today**: Test predictions endpoint with active plan
3. **This week**: Set up Next.js API routes for predictions
4. **Next week**: Deploy MVP with worldwide predictions

### 🎯 **Post-Launch Action Items**
1. **Monitor user engagement** with prediction features
2. **Analyze demand** for advanced analytics
3. **Purchase xG add-on** when ready to expand
4. **Implement advanced features** for premium users

This analysis provides a comprehensive foundation for integrating SportMonks API into your PrediOps project. **Your plan is now active - you can start building immediately with full predictions and worldwide coverage, with a clear roadmap for future expansion!**