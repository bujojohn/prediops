# ⚽ Prediops - Sports Predictions & Analytics

AI-powered sports predictions and value betting opportunities across 111+ leagues worldwide.

## 🚀 Features

- **🎯 AI Predictions**: Professional-grade algorithms analyze match data
- **💰 Value Bets**: Identify profitable betting opportunities
- **⚽ Live Matches**: Real-time scores and match updates
- **🌍 Global Coverage**: 111+ leagues worldwide
- **📊 Advanced Analytics**: Comprehensive statistics and insights

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **SportMonks API** - Sports data provider

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- SportMonks API token (Custom Worldwide + Predictions plan)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd prediops
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
SPORTMONKS_API_TOKEN=your_token_here
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football
```

### 3. Get Your API Token

1. Go to [my.sportmonks.com](https://my.sportmonks.com)
2. Login to your account
3. Navigate to **Settings** → **API Tokens**
4. Copy your active token (should show Worldwide + Predictions access)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing Your Setup

Visit `/test` to verify your API connection:

- **✅ Success**: Your SportMonks API is working
- **❌ Error**: Check your API token and environment variables

## 📱 Available Pages

- **Home** (`/`) - Landing page with feature overview
- **Predictions** (`/predictions`) - Match predictions with AI analysis
- **Value Bets** (`/value-bets`) - Profitable betting opportunities
- **Live Matches** (`/live`) - Real-time match updates
- **API Test** (`/test`) - Verify API connection

## 🔧 API Endpoints

### Available with Active Plan

```typescript
// Match Predictions
GET /api/sportmonks/predictions

// Value Bets
GET /api/sportmonks/value-bets

// Live Fixtures
GET /api/sportmonks/fixtures/live
```

### Future Endpoints (Post-Launch)

```typescript
// Expected Goals Data (requires xG add-on)
GET /api/sportmonks/expected/teams/{teamId}

// Player xG Statistics
GET /api/sportmonks/expected/players/{playerId}

// Advanced Analytics
GET /api/sportmonks/statistics/advanced/{seasonId}
```

## 🏗️ Project Structure

```
prediops/
├── app/
│   ├── api/sportmonks/          # API routes
│   ├── components/              # Reusable components
│   │   ├── predictions/         # Prediction components
│   │   ├── value-bets/         # Value bet components
│   │   ├── live-matches/       # Live match components
│   │   └── navigation/         # Navigation components
│   ├── predictions/            # Predictions page
│   ├── value-bets/            # Value bets page
│   ├── live/                  # Live matches page
│   └── test/                  # API test page
├── lib/
│   └── sportmonks.ts          # API client
├── schemas/                   # TypeScript schemas
└── docs/                     # Documentation
```

## 🎯 Key Components

### PredictionCard
Displays match predictions with confidence levels and team information.

### ValueBetCard
Shows profitable betting opportunities with odds, probability, and value analysis.

### LiveMatchCard
Real-time match information including scores, time, and match status.

## 🔒 Security Notes

- **Never expose API tokens** in frontend code
- **Use environment variables** for sensitive data
- **Server-side data fetching** keeps tokens secure
- **Rate limiting** is handled automatically (3,000 calls/hour)

## 📊 Performance

- **Server Components** by default for better performance
- **Automatic loading states** for better UX
- **Error boundaries** for graceful error handling
- **TypeScript** for type safety

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
```

The application is optimized for Vercel deployment with:
- Automatic environment variable management
- Edge runtime support
- Built-in analytics

### Environment Variables for Production

```env
SPORTMONKS_API_TOKEN=your_production_token
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football
```

## 📈 Competitive Advantages

### Current (Active Plan)
- ✅ **111+ Leagues Worldwide** - More data than competitors
- ✅ **AI-Powered Predictions** - Professional-grade algorithms
- ✅ **Value Bets** - Profitable opportunities identification
- ✅ **Real-time Updates** - Sub-minute data refresh
- ✅ **Global Coverage** - Serve users worldwide

### Future (Post-Launch)
- 🚀 **xG Analytics** - Advanced expected goals metrics
- 🚀 **Premium Visualizations** - Enhanced data presentation
- 🚀 **Advanced Statistics** - Deeper analytical insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **API Issues**: Contact [SportMonks Support](https://docs.sportmonks.com)
- **Application Issues**: Open an issue in this repository
- **Documentation**: Check the `/docs` folder for detailed guides

---

**Status**: 🚀 **READY TO BUILD - NO WAITING REQUIRED!**

Your SportMonks plan is active and ready. Start building your world-class sports prediction platform today!
