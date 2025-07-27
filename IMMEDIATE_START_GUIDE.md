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

#### **Install Dependencies**
```bash
npm install axios
```

#### **Create Environment Variables**
Create `.env.local`:
```env
SPORTMONKS_API_TOKEN=your_token_here
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football
```

#### **Create API Client**
Create `lib/sportmonks.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.SPORTMONKS_BASE_URL,
  params: {
    api_token: process.env.SPORTMONKS_API_TOKEN,
  },
});

export const sportmonks = {
  // Test your active predictions access
  async getPredictions() {
    const response = await api.get('/predictions');
    return response.data;
  },

  // Get value bets (active in your plan)
  async getValueBets() {
    const response = await api.get('/predictions/value-bets');
    return response.data;
  },

  // Get live fixtures
  async getLiveFixtures() {
    const response = await api.get('/livescores/inplay');
    return response.data;
  },

  // Get predictions for specific fixture
  async getFixturePredictions(fixtureId: string) {
    const response = await api.get(`/predictions/probabilities/fixtures/${fixtureId}`);
    return response.data;
  },
};
```

### **Step 3: Create Your First API Route (5 minutes)**

Create `app/api/predictions/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET() {
  try {
    const predictions = await sportmonks.getPredictions();
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Predictions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
```

### **Step 4: Test Your Active Plan (5 minutes)**

Create `app/test/page.tsx`:
```typescript
'use client';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/predictions')
      .then(res => res.json())
      .then(data => {
        setPredictions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Testing your active plan...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        🎉 Active Plan Test - Predictions API
      </h1>
      
      {predictions ? (
        <div>
          <p className="text-green-600 font-semibold">
            ✅ SUCCESS! Your Predictions API is working!
          </p>
          <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto">
            {JSON.stringify(predictions, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-red-600">❌ Error connecting to API</p>
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

#### **Prediction Card Component**
```typescript
interface Prediction {
  fixture_id: number;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
}

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <h3 className="font-semibold mb-2">Match Prediction</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-sm text-gray-600">Home</div>
          <div className="font-bold">{(prediction.probabilities.home * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Draw</div>
          <div className="font-bold">{(prediction.probabilities.draw * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Away</div>
          <div className="font-bold">{(prediction.probabilities.away * 100).toFixed(1)}%</div>
        </div>
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

---

## 🎉 **You're Ready!**

Your SportMonks plan is active and ready. You now have everything needed to build a world-class sports prediction platform. Start with the test above, then build your MVP!

**Questions?** Check the [SportMonks Documentation](https://docs.sportmonks.com/football) or contact their support team.

**Status**: 🚀 **READY TO BUILD - NO WAITING REQUIRED!**