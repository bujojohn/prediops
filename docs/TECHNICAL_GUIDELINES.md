# Prediops: Technical Development Guidelines

| **Document Version** | **2.0** |
|----------------------|---------|
| **Last Updated**     | December 2024 |
| **Purpose**          | To establish standards, best practices, and architectural patterns for the Prediops web application using Next.js App Router. |

---

## 1. Core Technology Stack

| **Component**      | **Technology/Library**      | **Purpose**                                                                 |
|--------------------|----------------------------|-----------------------------------------------------------------------------|
| **Framework**      | Next.js 15.1.0 (App Router) | Server-side rendering, static site generation, routing, and API routes.     |
| **Language**       | TypeScript 5.x             | Type safety, improved code quality, and better tooling.                     |
| **Styling**        | Tailwind CSS 3.4.1         | Utility-first CSS framework for responsive design.                          |
| **UI Components**  | ShadCN UI                  | Accessible, customizable React UI components.                               |
| **HTTP Client**    | Axios 1.11.0               | HTTP client for requests to Sportmonks API and internal endpoints.          |
| **Server State**   | TanStack Query             | Data fetching, caching, and server state management.                        |
| **Client State**   | Zustand                    | Lightweight, scalable client-side state management.                         |
| **Validation**     | Zod 4.0.10                 | Schema validation for API responses and forms.                              |
| **Linting**        | ESLint 9.x                 | Code quality and formatting.                                                |
| **Development**    | Turbopack                  | Fast development server with Next.js integration.                           |

---

## 2. Project Structure

```
app/                              # App Router directory
├── api/                          # API Routes (Server-side)
│   └── sportmonks/
│       ├── fixtures/
│       │   └── live/
│       │       └── route.ts      # GET /api/sportmonks/fixtures/live
│       ├── predictions/
│       │   └── route.ts          # GET /api/sportmonks/predictions
│       └── value-bets/
│           └── route.ts          # GET /api/sportmonks/value-bets
├── components/                   # Reusable Components
│   ├── live-matches/
│   │   └── LiveMatchCard.tsx
│   ├── navigation/
│   │   └── Navbar.tsx
│   ├── predictions/
│   │   └── PredictionCard.tsx
│   └── value-bets/
│       └── ValueBetCard.tsx
├── dashboard/
│   └── page.tsx                 # Dashboard home page
├── live/
│   └── page.tsx                 # Live matches page
├── predictions/
│   ├── page.tsx                 # Predictions page
│   ├── loading.tsx              # Loading UI
│   └── error.tsx                # Error UI
├── value-bets/
│   ├── page.tsx                 # Value bets page
│   ├── loading.tsx              # Loading UI
│   └── error.tsx                # Error UI
├── globals.css                  # Global styles
├── layout.tsx                   # Root layout
└── page.tsx                     # Home page
lib/                             # Utilities & Services
├── api/
│   └── helpers.ts               # API helper functions
├── sportmonks.ts                # SportMonks API client
└── mock-data.ts                 # Mock data for development
schemas/                         # Zod validation schemas
├── index.ts                     # Schema exports
├── fixture.schema.ts            # Fixture data schema
├── predictions.schema.ts        # Predictions data schema
├── valuebet.schema.ts           # Value bet data schema
└── [other schemas...]           # Additional data schemas
```

---

## 3. Development Best Practices

### 3.1. API Layer & Data Validation
- All API responses must be validated with Zod schemas in `/schemas/`.
- API logic (fetch, parse, error handling) should be in `/lib/api/`.
- Components should only consume validated, typed data.
- Use the centralized `sportmonks.ts` client for all API calls.

### 3.2. Component Design
- Build atomic, reusable components in `/app/components/` using ShadCN UI as the base.
- Use Server Components by default for better performance.
- Implement proper loading and error states for all pages.
- Follow the established pattern of co-locating components with their routes.
- Customize ShadCN UI components as needed (since you own the code).

### 3.3. Styling
- Use Tailwind CSS utility classes for all styling.
- Centralize theme and design tokens in Tailwind config.
- Avoid inline styles except for dynamic values.
- Use responsive design patterns consistently.

### 3.4. State Management
- **Server Components**: Fetch initial data on the server using direct API calls.
- **Client Components**: Use TanStack Query for client-side interactions (refreshing, real-time updates).
- **Client State**: Use Zustand for client-side state (UI state, local interactions, etc.).
- **Architecture**: Server-first approach with client-side enhancements for interactivity.
- Implement proper loading states with `loading.tsx` files.
- Use error boundaries with `error.tsx` files for error handling.

### 3.5. Security
- Store API keys and secrets in `.env.local` (never commit to VCS).
- Use server-side API routes to keep Sportmonks API token secure.
- Never expose sensitive keys to the client.

### 3.6. Code Quality & Formatting
- Enforce code style with ESLint and Prettier.
- Use meaningful, descriptive names.
- Comment only to explain "why", not "what".
- Use TypeScript strictly for type safety.

### 3.7. Performance
- Use Next.js App Router's built-in optimizations.
- Implement proper loading and error boundaries.
- Use Turbopack for faster development builds.
- Leverage server-side rendering for better SEO and performance.

### 3.8. Accessibility & SEO
- Use semantic HTML and ARIA attributes.
- Ensure keyboard navigation and screen reader support.
- Use Next.js metadata API for SEO optimization.

### 3.9. UI Library Usage
- Use ShadCN UI components for all new UI features.
- Customize components as needed for branding and UX.
- Ensure accessibility and responsive design are maintained.
- Refer to ShadCN UI documentation for advanced usage and theming.

---

## 4. API Integration Patterns

### 4.1. Sportmonks API Client
The centralized API client in `/lib/sportmonks.ts` provides:
- Consistent error handling
- Type-safe API calls
- Environment-based configuration
- Mock data fallbacks for development

### 4.2. API Route Structure
- All Sportmonks API calls go through `/app/api/sportmonks/` routes
- Routes follow RESTful patterns
- Implement proper error handling and status codes
- Return consistent JSON response format

### 4.3. Data Validation
- Use Zod schemas for all API response validation
- Define schemas in `/schemas/` directory
- Export types from schemas for TypeScript usage
- Implement runtime validation for all external data

---

## 5. Environment Configuration

### 5.1. Required Environment Variables
```env
# Sportmonks API Configuration
SPORTMONKS_API_TOKEN=your_token_here
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football
```

### 5.2. Development vs Production
- Use mock data during development when API is not configured
- Implement proper fallbacks for all API calls
- Use environment-specific configurations

---

## 6. Testing Strategy

### 6.1. Unit Testing
- Test API client functions
- Test Zod schema validation
- Test utility functions

### 6.2. Integration Testing
- Test API routes
- Test component integration
- Test data flow from API to UI

### 6.3. Mock Data
- Maintain comprehensive mock data in `/lib/mock-data.ts`
- Use mock data for development and testing
- Ensure mock data matches real API response structure

---

## 7. Deployment Considerations

### 7.1. Build Optimization
- Use Next.js build optimizations
- Implement proper caching strategies
- Optimize bundle size

### 7.2. Environment Management
- Secure API token management
- Environment-specific configurations
- Proper error handling for production

---

## 8. Future Enhancements

### 8.1. Planned Additions
- TanStack Query for client-side state management
- ShadCN UI components for consistent design
- Advanced caching strategies
- Real-time updates for live matches

### 8.2. Performance Optimizations
- Implement ISR (Incremental Static Regeneration)
- Add service worker for offline capabilities
- Optimize image loading and caching

---

## 9. Documentation Standards

### 9.1. Code Documentation
- Document complex functions and components
- Use JSDoc for API functions
- Maintain up-to-date README files

### 9.2. API Documentation
- Document all API routes
- Maintain API response schemas
- Keep endpoint documentation current

---

This document should be updated as the project evolves and new patterns emerge.
