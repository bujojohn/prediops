# Navigation Examples - Complete Implementation

## 1. Main Navigation Bar

### Current vs Recommended

#### Current Navigation
```typescript
// Simple horizontal navigation
const currentNav = [
  { href: '/', label: 'Home' },
  { href: '/predictions', label: 'Predictions' },
  { href: '/value-bets', label: 'Value Bets' },
  { href: '/live', label: 'Live' },
];
```

#### Recommended Enhanced Navigation
```typescript
// Enhanced with dropdowns and better organization
const enhancedNav = [
  {
    label: 'Predictions',
    href: '/predictions',
    icon: '🎯',
    dropdown: [
      { label: 'Today', href: '/predictions/today', count: 45 },
      { label: 'Tomorrow', href: '/predictions/tomorrow', count: 38 },
      { label: 'This Weekend', href: '/predictions/this-weekend', count: 67 },
      { label: 'This Week', href: '/predictions/this-week', count: 234 },
    ]
  },
  {
    label: 'Teams',
    href: '/teams',
    icon: '⚽',
    dropdown: [
      { label: 'Premier League', href: '/teams?league=premier-league', count: 20 },
      { label: 'Champions League', href: '/teams?league=champions-league', count: 32 },
      { label: 'Serie A', href: '/teams?league=serie-a', count: 20 },
      { label: 'La Liga', href: '/teams?league=la-liga', count: 20 },
    ]
  },
  {
    label: 'Leagues',
    href: '/leagues',
    icon: '🏆',
    dropdown: [
      { label: 'Premier League', href: '/leagues/premier-league' },
      { label: 'Champions League', href: '/leagues/champions-league' },
      { label: 'Serie A', href: '/leagues/serie-a' },
      { label: 'La Liga', href: '/leagues/la-liga' },
      { label: 'Bundesliga', href: '/leagues/bundesliga' },
    ]
  },
  {
    label: 'Value Bets',
    href: '/value-bets',
    icon: '💰',
    badge: 'HOT',
    dropdown: [
      { label: 'Top Value Bets', href: '/value-bets/top', count: 12 },
      { label: 'Live Value Bets', href: '/value-bets/live', count: 8 },
      { label: 'Today\'s Best', href: '/value-bets/today', count: 15 },
    ]
  },
  {
    label: 'Live',
    href: '/live',
    icon: '🔴',
    badge: 'LIVE',
    count: 23
  }
];
```

## 2. Sidebar Navigation Structure

### Enhanced Sidebar with Better Organization

```typescript
const sidebarStructure = {
  // Quick Actions
  quickActions: [
    {
      label: 'Today\'s Matches',
      href: '/predictions/today',
      icon: '📅',
      count: 45,
      badge: 'NEW'
    },
    {
      label: 'Top Value Bets',
      href: '/value-bets/top',
      icon: '💰',
      count: 12,
      badge: 'HOT'
    },
    {
      label: 'Live Matches',
      href: '/live',
      icon: '🔴',
      count: 23,
      badge: 'LIVE'
    }
  ],

  // Countries Section
  countries: {
    title: 'Countries',
    items: [
      {
        label: 'England',
        href: '/countries/england',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        count: 245,
        leagues: ['Premier League', 'Championship', 'League One']
      },
      {
        label: 'Spain',
        href: '/countries/spain',
        flag: '🇪🇸',
        count: 189,
        leagues: ['La Liga', 'Segunda División', 'Copa del Rey']
      },
      {
        label: 'Germany',
        href: '/countries/germany',
        flag: '🇩🇪',
        count: 156,
        leagues: ['Bundesliga', '2. Bundesliga', 'DFB-Pokal']
      },
      {
        label: 'Italy',
        href: '/countries/italy',
        flag: '🇮🇹',
        count: 134,
        leagues: ['Serie A', 'Serie B', 'Coppa Italia']
      },
      {
        label: 'France',
        href: '/countries/france',
        flag: '🇫🇷',
        count: 98,
        leagues: ['Ligue 1', 'Ligue 2', 'Coupe de France']
      }
    ]
  },

  // Top Leagues
  topLeagues: {
    title: 'Top Leagues',
    items: [
      {
        label: 'Premier League',
        href: '/leagues/premier-league',
        country: 'England',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        count: 380,
        nextMatch: 'Manchester United vs Liverpool'
      },
      {
        label: 'Champions League',
        href: '/leagues/champions-league',
        country: 'Europe',
        flag: '🇪🇺',
        count: 125,
        nextMatch: 'Real Madrid vs Bayern Munich'
      },
      {
        label: 'Serie A',
        href: '/leagues/serie-a',
        country: 'Italy',
        flag: '🇮🇹',
        count: 380,
        nextMatch: 'Juventus vs AC Milan'
      },
      {
        label: 'La Liga',
        href: '/leagues/la-liga',
        country: 'Spain',
        flag: '🇪🇸',
        count: 380,
        nextMatch: 'Barcelona vs Real Madrid'
      }
    ]
  },

  // Tournaments
  tournaments: {
    title: 'Tournaments',
    items: [
      {
        label: 'World Cup 2026',
        href: '/tournaments/world-cup-2026',
        type: 'International',
        flag: '🌍',
        status: 'Upcoming',
        startDate: '2026-06-08'
      },
      {
        label: 'Euro 2024',
        href: '/tournaments/euro-2024',
        type: 'International',
        flag: '🇪🇺',
        status: 'Completed',
        winner: 'Spain'
      },
      {
        label: 'Copa America 2024',
        href: '/tournaments/copa-america-2024',
        type: 'International',
        flag: '🌎',
        status: 'Live',
        currentRound: 'Quarterfinals'
      }
    ]
  }
};
```

## 3. Breadcrumb Navigation Examples

### Dynamic Breadcrumb Generation

```typescript
// Breadcrumb examples for different page types
const breadcrumbExamples = {
  // Home page
  '/': [
    { label: 'Home', href: '/', current: true }
  ],

  // Predictions pages
  '/predictions': [
    { label: 'Home', href: '/' },
    { label: 'Predictions', href: '/predictions', current: true }
  ],

  '/predictions/today': [
    { label: 'Home', href: '/' },
    { label: 'Predictions', href: '/predictions' },
    { label: 'Today', href: '/predictions/today', current: true }
  ],

  '/predictions/countries/england': [
    { label: 'Home', href: '/' },
    { label: 'Predictions', href: '/predictions' },
    { label: 'Countries', href: '/predictions/countries' },
    { label: 'England', href: '/predictions/countries/england', current: true }
  ],

  '/predictions/leagues/premier-league': [
    { label: 'Home', href: '/' },
    { label: 'Predictions', href: '/predictions' },
    { label: 'Leagues', href: '/predictions/leagues' },
    { label: 'Premier League', href: '/predictions/leagues/premier-league', current: true }
  ],

  // Team pages
  '/teams/manchester-united': [
    { label: 'Home', href: '/' },
    { label: 'Teams', href: '/teams' },
    { label: 'Manchester United', href: '/teams/manchester-united', current: true }
  ],

  '/teams/manchester-united#fixtures': [
    { label: 'Home', href: '/' },
    { label: 'Teams', href: '/teams' },
    { label: 'Manchester United', href: '/teams/manchester-united' },
    { label: 'Fixtures', href: '/teams/manchester-united#fixtures', current: true }
  ],

  // League pages
  '/leagues/premier-league': [
    { label: 'Home', href: '/' },
    { label: 'Leagues', href: '/leagues' },
    { label: 'Premier League', href: '/leagues/premier-league', current: true }
  ],

  // Fixture pages
  '/fixtures/manchester-united-vs-liverpool-2024-01-15': [
    { label: 'Home', href: '/' },
    { label: 'Fixtures', href: '/fixtures' },
    { label: 'Manchester United vs Liverpool', href: '/fixtures/manchester-united-vs-liverpool-2024-01-15', current: true }
  ],

  // Value bets
  '/value-bets/top': [
    { label: 'Home', href: '/' },
    { label: 'Value Bets', href: '/value-bets' },
    { label: 'Top Value Bets', href: '/value-bets/top', current: true }
  ]
};

// Breadcrumb component
export function Breadcrumb({ pathname }: { pathname: string }) {
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && <span className="text-gray-400">/</span>}
          {crumb.current ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-gray-700">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

## 4. URL Structure Visualization

### Hierarchical URL Tree

```
/
├── predictions/
│   ├── today
│   ├── tomorrow
│   ├── this-weekend
│   ├── this-week
│   ├── countries/
│   │   ├── england
│   │   ├── spain
│   │   ├── germany
│   │   └── italy
│   ├── leagues/
│   │   ├── premier-league
│   │   ├── champions-league
│   │   ├── serie-a
│   │   └── la-liga
│   ├── teams/
│   │   ├── manchester-united
│   │   ├── liverpool-fc
│   │   └── arsenal-fc
│   └── fixtures/
│       ├── manchester-united-vs-liverpool-2024-01-15
│       └── arsenal-vs-chelsea-2024-01-16
├── teams/
│   ├── manchester-united
│   │   ├── #fixtures
│   │   ├── #predictions
│   │   ├── #statistics
│   │   └── #squad
│   ├── liverpool-fc
│   └── arsenal-fc
├── leagues/
│   ├── premier-league
│   ├── champions-league
│   ├── serie-a
│   └── la-liga
├── countries/
│   ├── england
│   ├── spain
│   ├── germany
│   └── italy
├── fixtures/
│   ├── manchester-united-vs-liverpool-2024-01-15
│   ├── arsenal-vs-chelsea-2024-01-16
│   └── barcelona-vs-real-madrid-2024-01-17
├── value-bets/
│   ├── top
│   ├── live
│   ├── today
│   ├── teams/
│   │   └── manchester-united
│   └── leagues/
│       └── premier-league
├── live
└── search
    ├── ?type=teams
    ├── ?type=leagues
    └── ?type=fixtures
```

## 5. Mobile Navigation Examples

### Mobile-First Navigation

```typescript
// Mobile navigation structure
const mobileNavigation = {
  // Bottom tab navigation
  bottomTabs: [
    {
      label: 'Home',
      href: '/',
      icon: '🏠',
      active: true
    },
    {
      label: 'Predictions',
      href: '/predictions',
      icon: '🎯',
      badge: 45
    },
    {
      label: 'Live',
      href: '/live',
      icon: '🔴',
      badge: 23
    },
    {
      label: 'Value Bets',
      href: '/value-bets',
      icon: '💰',
      badge: 12
    },
    {
      label: 'More',
      href: '/more',
      icon: '⋯'
    }
  ],

  // Drawer navigation
  drawerSections: [
    {
      title: 'Quick Actions',
      items: [
        { label: 'Today\'s Matches', href: '/predictions/today', icon: '📅' },
        { label: 'Top Value Bets', href: '/value-bets/top', icon: '💰' },
        { label: 'Live Matches', href: '/live', icon: '🔴' }
      ]
    },
    {
      title: 'Teams',
      items: [
        { label: 'Manchester United', href: '/teams/manchester-united', icon: '⚽' },
        { label: 'Liverpool FC', href: '/teams/liverpool-fc', icon: '⚽' },
        { label: 'Arsenal FC', href: '/teams/arsenal-fc', icon: '⚽' }
      ]
    },
    {
      title: 'Leagues',
      items: [
        { label: 'Premier League', href: '/leagues/premier-league', icon: '🏆' },
        { label: 'Champions League', href: '/leagues/champions-league', icon: '🏆' },
        { label: 'Serie A', href: '/leagues/serie-a', icon: '🏆' }
      ]
    }
  ]
};
```

## 6. Search and Discovery

### Enhanced Search Integration

```typescript
// Search suggestions and autocomplete
const searchExamples = {
  // Search suggestions
  suggestions: {
    teams: [
      { label: 'Manchester United', href: '/teams/manchester-united', type: 'team' },
      { label: 'Liverpool FC', href: '/teams/liverpool-fc', type: 'team' },
      { label: 'Arsenal FC', href: '/teams/arsenal-fc', type: 'team' }
    ],
    leagues: [
      { label: 'Premier League', href: '/leagues/premier-league', type: 'league' },
      { label: 'Champions League', href: '/leagues/champions-league', type: 'league' },
      { label: 'Serie A', href: '/leagues/serie-a', type: 'league' }
    ],
    fixtures: [
      { label: 'Manchester United vs Liverpool', href: '/fixtures/manchester-united-vs-liverpool-2024-01-15', type: 'fixture' },
      { label: 'Arsenal vs Chelsea', href: '/fixtures/arsenal-vs-chelsea-2024-01-16', type: 'fixture' }
    ]
  },

  // Recent searches
  recentSearches: [
    { query: 'Manchester United', href: '/teams/manchester-united', timestamp: '2 hours ago' },
    { query: 'Premier League', href: '/leagues/premier-league', timestamp: '1 day ago' },
    { query: 'Liverpool fixtures', href: '/teams/liverpool-fc#fixtures', timestamp: '3 days ago' }
  ],

  // Popular searches
  popularSearches: [
    { query: 'Premier League', href: '/leagues/premier-league', count: 1250 },
    { query: 'Manchester United', href: '/teams/manchester-united', count: 980 },
    { query: 'Champions League', href: '/leagues/champions-league', count: 750 },
    { query: 'Liverpool FC', href: '/teams/liverpool-fc', count: 650 }
  ]
};
```

## 7. Implementation Benefits

### SEO Benefits
- ✅ Clean, descriptive URLs
- ✅ Consistent URL patterns
- ✅ Better crawling and indexing
- ✅ No query parameters in main URLs
- ✅ Proper breadcrumb structure

### User Experience
- ✅ Shareable URLs
- ✅ Bookmarkable pages
- ✅ Clear navigation hierarchy
- ✅ Predictable URL structure
- ✅ Mobile-friendly navigation

### Developer Experience
- ✅ Consistent patterns
- ✅ Easier maintenance
- ✅ Better testing
- ✅ Clear routing logic
- ✅ Type-safe URL generation

This comprehensive navigation structure provides a much more professional and user-friendly experience while maintaining excellent SEO and performance characteristics.
