# 🚀 Prediops - Football Predictions & Analytics Platform

A modern Next.js application for football predictions, live match tracking, and value betting analysis powered by Sportmonks API.

## 📋 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Sportmonks API token (Worldwide + Predictions plan)

### Current Version: v2.9.0
- ✅ Professional brand logo implementation
- ✅ Theme-aware logo with light/dark variants
- ✅ Enhanced sidebar with favorites and search
- ✅ Unified sidebar tools (Favorites, Active, Today, Sorting, Refresh, Help modal)
- ✅ Per-scope filter persistence (localStorage)
- ✅ Minimal count badges in tools (Static variant shows real counts)
- ✅ ValueBet indicators with color-coded states
- ✅ Performance optimizations and lazy loading
- ✅ Fixed API issues with venue parameters

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd prediops

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Sportmonks API token

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Architecture

This project uses **Next.js 15.1.0** with the **App Router** for optimal performance and developer experience:

- **Server Components** by default for better performance
- **API Routes** for secure server-side API calls
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zod** for data validation

## 📁 Project Structure

```
app/                    # Next.js App Router
├── api/               # API routes (server-side)
├── components/        # Reusable UI components
├── dashboard/         # Dashboard pages
├── live/             # Live matches
├── predictions/       # Predictions pages
└── value-bets/       # Value betting pages
lib/                   # Utilities and services
├── api/              # API helpers
├── sportmonks.ts     # Sportmonks API client
└── mock-data.ts      # Development mock data
schemas/               # Zod validation schemas
docs/                  # Project documentation
```

## 🎯 Features

### ✅ Active Features
- **Live Match Tracking** - Real-time scores and statistics
- **Predictions Analysis** - AI-powered match predictions
- **Value Betting** - Identify high-value betting opportunities
- **Responsive Design** - Works on all devices
- **Type Safety** - Full TypeScript coverage

### 🚧 Planned Features
- Advanced analytics with xG (expected goals)
- Real-time notifications
- User authentication
- Historical data analysis
- Mobile app version

## 📚 Documentation

### 🚀 Getting Started
- **[Immediate Start Guide](docs/IMMEDIATE_START_GUIDE.md)** - Get up and running in 30 minutes
- **[Technical Guidelines](docs/TECHNICAL_GUIDELINES.md)** - Development standards and best practices

### 🏗️ Architecture & Design
- **[App Router Architecture](docs/APP_ROUTER_ARCHITECTURE.md)** - Next.js App Router patterns
- **[Sportmonks API Analysis](docs/SPORTMONKS_API_ANALYSIS.md)** - API integration details
- **[Sportmonks Summary](docs/SPORTMONKS_SUMMARY.md)** - Quick API reference
- **[Sidebar Feature Placement](docs/SIDEBAR-FEATURE-PLACEMENT.md)** - Latest sidebar contents and tools

### 🧭 Sidebar Tools Overview
- Shared components in `app/components/navigation/sidebar/tools/`
- Reuse `FilterTools`, `SortControl`, `ActionButtons`, `HelpModal`
- Filter state persists per search scope

## 📸 Screenshots

> Replace the placeholder paths below with your captured images in `public/images/screenshots/`.

- Enhanced Search with Scope and Inline Results
  - `public/images/screenshots/enhanced-search.png`
- Unified Tools (Favorites, Active, Today, Sorting, Refresh)
  - `public/images/screenshots/sidebar-tools.png`
- Help Modal (Keyboard Shortcuts)
  - `public/images/screenshots/help-modal.png`
- Static Sidebar with Real Counts
  - `public/images/screenshots/sidebar-static-counts.png`

Example embedding (Markdown):

```md
![Enhanced Search](public/images/screenshots/enhanced-search.png)
```

### 📈 Growth & Expansion
- **[Post-Launch Expansion Plan](docs/POST_LAUNCH_EXPANSION_PLAN.md)** - Future roadmap and features

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables
```env
# Required
SPORTMONKS_API_TOKEN=your_token_here
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football

# Optional (for development)
NODE_ENV=development
```

### API Integration
The application uses a centralized API client (`lib/sportmonks.ts`) that provides:
- Type-safe API calls
- Consistent error handling
- Mock data fallbacks for development
- Environment-based configuration

## Tech Stack
- Next.js 15.1.0 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.4.1
- ShadCN UI (React components)
- TanStack Query (server state management)
- Zustand (client state management)
- Zod (validation)
- Axios (HTTP client)

## UI Components: ShadCN UI
All UI components are built using [ShadCN UI](https://ui.shadcn.com/). Components are accessible, customizable, and use Tailwind CSS for styling. You own the code, so you can modify as needed.

## Server State: TanStack Query
Data fetching, caching, and synchronization with the server is handled by [TanStack Query](https://tanstack.com/query/latest). Use it for all API data and server state.

## Client State: Zustand
Local UI and client-side state is managed with [Zustand](https://zustand-demo.pmnd.rs/). Use it for non-server state (e.g., UI toggles, local forms).

## 🔒 Security

- API tokens are kept secure on the server side
- All API calls go through server-side routes
- Environment variables are properly managed
- No sensitive data is exposed to the client

## 🧪 Testing

The project includes:
- **Mock data** for development and testing
- **Zod schemas** for data validation
- **TypeScript** for compile-time error checking
- **ESLint** for code quality

## 📸 Screenshot Capture

- Interactive: `npm run screenshots`
- Headless: `npm run screenshots:headless`
- See [Screenshot Guide](docs/SCREENSHOTS.md) for details

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel with environment variables configured
```

### Other Platforms
- Set environment variables in your hosting platform
- Ensure Node.js 18+ is supported
- Configure build command: `npm run build`
- Configure start command: `npm run start`

## 🤝 Contributing

1. Follow the [Technical Guidelines](docs/TECHNICAL_GUIDELINES.md)
2. Use the established project structure
3. Add proper TypeScript types
4. Include Zod validation for new APIs
5. Test with mock data during development

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical issues or questions:
1. Check the [documentation](docs/)
2. Review the [Technical Guidelines](docs/TECHNICAL_GUIDELINES.md)
3. Examine the [App Router Architecture](docs/APP_ROUTER_ARCHITECTURE.md)

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
