# URL Strategy Examples - Complete Implementation

## Current vs Recommended URLs

### 1. Team URLs

#### Current Implementation
```typescript
// Current
/team/1/manchester-united
/team/2/liverpool-fc
/team/3/arsenal-fc
```

#### Recommended Implementation
```typescript
// Recommended - Cleaner, more consistent
/teams/manchester-united
/teams/liverpool-fc  
/teams/arsenal-fc

// With tabs for different sections
/teams/manchester-united#fixtures
/teams/manchester-united#predictions
/teams/manchester-united#statistics
/teams/manchester-united#squad
```

### 2. Country URLs

#### Current Implementation
```typescript
// Current - Inconsistent (ID only)
/country/42
/country/143

// Current predictions (mixed approach)
/predictions/country/england?id=42
/predictions/country/spain?id=143
```

#### Recommended Implementation
```typescript
// Recommended - Consistent slug-based
/countries/england
/countries/spain
/countries/germany
/countries/france

// Predictions follow same pattern
/predictions/countries/england
/predictions/countries/spain
/predictions/countries/germany
```

### 3. League URLs

#### Current Implementation
```typescript
// Current - Inconsistent (ID only)
/league/8
/league/384

// Current predictions (mixed approach)
/predictions/league/premier-league?id=8
/predictions/league/serie-a?id=384
```

#### Recommended Implementation
```typescript
// Recommended - Consistent slug-based
/leagues/premier-league
/leagues/serie-a
/leagues/la-liga
/leagues/bundesliga
/leagues/champions-league

// Predictions follow same pattern
/predictions/leagues/premier-league
/predictions/leagues/serie-a
/predictions/leagues/champions-league
```

### 4. Fixture URLs

#### Current Implementation
```typescript
// Current - Just ID
/fixtures/12345
/fixtures/67890
```

#### Recommended Implementation
```typescript
// Recommended - Descriptive and SEO-friendly
/fixtures/12345-2024-01-15-manchester-united-vs-liverpool
/fixtures/67890-2024-01-16-arsenal-vs-chelsea
/fixtures/54321-2024-01-17-barcelona-vs-real-madrid

// Shorter version for mobile/sharing
/fixtures/manchester-united-vs-liverpool-2024-01-15
/fixtures/arsenal-vs-chelsea-2024-01-16
```

## Navigation Structure Examples

### 1. Main Navigation

```typescript
// Current navigation structure
const mainNavigation = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/predictions', label: 'Predictions', icon: '🎯' },
  { href: '/value-bets', label: 'Value Bets', icon: '💰' },
  { href: '/live', label: 'Live', icon: '⚽' },
];

// Recommended enhanced navigation
const enhancedNavigation = [
  { href: '/', label: 'Home', icon: '🏠' },
  { 
    href: '/predictions', 
    label: 'Predictions', 
    icon: '🎯',
    submenu: [
      { href: '/predictions/today', label: 'Today' },
      { href: '/predictions/tomorrow', label: 'Tomorrow' },
      { href: '/predictions/this-weekend', label: 'This Weekend' },
    ]
  },
  { 
    href: '/value-bets', 
    label: 'Value Bets', 
    icon: '💰',
    submenu: [
      { href: '/value-bets/top', label: 'Top Value Bets' },
      { href: '/value-bets/live', label: 'Live Value Bets' },
    ]
  },
  { href: '/live', label: 'Live', icon: '⚽' },
  { 
    href: '/teams', 
    label: 'Teams', 
    icon: '⚽',
    submenu: [
      { href: '/teams/premier-league', label: 'Premier League' },
      { href: '/teams/champions-league', label: 'Champions League' },
      { href: '/teams/serie-a', label: 'Serie A' },
    ]
  },
  { 
    href: '/leagues', 
    label: 'Leagues', 
    icon: '🏆',
    submenu: [
      { href: '/leagues/premier-league', label: 'Premier League' },
      { href: '/leagues/champions-league', label: 'Champions League' },
      { href: '/leagues/serie-a', label: 'Serie A' },
      { href: '/leagues/la-liga', label: 'La Liga' },
    ]
  },
];
```

### 2. Breadcrumb Navigation

```typescript
// Example breadcrumb paths
const breadcrumbExamples = {
  // Team page
  '/teams/manchester-united': [
    { label: 'Home', href: '/' },
    { label: 'Teams', href: '/teams' },
    { label: 'Manchester United', href: '/teams/manchester-united' }
  ],
  
  // Team fixtures
  '/teams/manchester-united#fixtures': [
    { label: 'Home', href: '/' },
    { label: 'Teams', href: '/teams' },
    { label: 'Manchester United', href: '/teams/manchester-united' },
    { label: 'Fixtures', href: '/teams/manchester-united#fixtures' }
  ],
  
  // League predictions
  '/predictions/leagues/premier-league': [
    { label: 'Home', href: '/' },
    { label: 'Predictions', href: '/predictions' },
    { label: 'Leagues', href: '/predictions/leagues' },
    { label: 'Premier League', href: '/predictions/leagues/premier-league' }
  ],
  
  // Country predictions
  '/predictions/countries/england': [
    { label: 'Home', href: '/' },
    { label: 'Predictions', href: '/predictions' },
    { label: 'Countries', href: '/predictions/countries' },
    { label: 'England', href: '/predictions/countries/england' }
  ],
  
  // Specific fixture
  '/fixtures/manchester-united-vs-liverpool-2024-01-15': [
    { label: 'Home', href: '/' },
    { label: 'Fixtures', href: '/fixtures' },
    { label: 'Manchester United vs Liverpool', href: '/fixtures/manchester-united-vs-liverpool-2024-01-15' }
  ]
};
```

### 3. Sidebar Navigation Examples

```typescript
// Enhanced sidebar structure
const sidebarNavigation = {
  // Quick filters
  quickFilters: [
    { href: '/predictions/today', label: "Today's Matches", icon: '📅' },
    { href: '/predictions/tomorrow', label: "Tomorrow's Matches", icon: '⏰' },
    { href: '/value-bets/top', label: 'Top Value Bets', icon: '💰' },
    { href: '/live', label: 'Live Matches', icon: '🔴' },
  ],
  
  // Countries section
  countries: [
    { href: '/countries/england', label: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', count: 245 },
    { href: '/countries/spain', label: 'Spain', flag: '🇪🇸', count: 189 },
    { href: '/countries/germany', label: 'Germany', flag: '🇩🇪', count: 156 },
    { href: '/countries/italy', label: 'Italy', flag: '🇮🇹', count: 134 },
    { href: '/countries/france', label: 'France', flag: '🇫🇷', count: 98 },
  ],
  
  // Top leagues
  topLeagues: [
    { href: '/leagues/premier-league', label: 'Premier League', country: 'England', count: 38 },
    { href: '/leagues/champions-league', label: 'Champions League', country: 'Europe', count: 125 },
    { href: '/leagues/serie-a', label: 'Serie A', country: 'Italy', count: 38 },
    { href: '/leagues/la-liga', label: 'La Liga', country: 'Spain', count: 38 },
    { href: '/leagues/bundesliga', label: 'Bundesliga', country: 'Germany', count: 34 },
  ],
  
  // Tournaments
  tournaments: [
    { href: '/tournaments/world-cup', label: 'World Cup', type: 'International' },
    { href: '/tournaments/euro-2024', label: 'Euro 2024', type: 'International' },
    { href: '/tournaments/copa-america', label: 'Copa America', type: 'International' },
    { href: '/tournaments/afcon', label: 'AFCON', type: 'International' },
  ]
};
```

## Updated Routing Utilities

### 1. Enhanced Route Definitions

```typescript
// lib/utils/routing.ts - Enhanced version
export const ROUTES = {
  // Base routes
  HOME: '/',
  PREDICTIONS: '/predictions',
  LIVE: '/live',
  VALUE_BETS: '/value-bets',
  
  // Entity base routes
  TEAMS: '/teams',
  COUNTRIES: '/countries',
  LEAGUES: '/leagues',
  FIXTURES: '/fixtures',
  TOURNAMENTS: '/tournaments',
  
  // Entity detail routes (slug-only)
  TEAM_DETAIL: (slug: string) => `/teams/${slug}`,
  COUNTRY_DETAIL: (slug: string) => `/countries/${slug}`,
  LEAGUE_DETAIL: (slug: string) => `/leagues/${slug}`,
  FIXTURE_DETAIL: (slug: string) => `/fixtures/${slug}`,
  TOURNAMENT_DETAIL: (slug: string) => `/tournaments/${slug}`,
  
  // Prediction routes (hierarchical)
  TEAM_PREDICTIONS: (slug: string) => `/predictions/teams/${slug}`,
  COUNTRY_PREDICTIONS: (slug: string) => `/predictions/countries/${slug}`,
  LEAGUE_PREDICTIONS: (slug: string) => `/predictions/leagues/${slug}`,
  FIXTURE_PREDICTIONS: (slug: string) => `/predictions/fixtures/${slug}`,
  
  // Time-based prediction routes
  PREDICTIONS_TODAY: '/predictions/today',
  PREDICTIONS_TOMORROW: '/predictions/tomorrow',
  PREDICTIONS_WEEKEND: '/predictions/this-weekend',
  PREDICTIONS_THIS_WEEK: '/predictions/this-week',
  
  // Value bet routes
  VALUE_BETS_TOP: '/value-bets/top',
  VALUE_BETS_LIVE: '/value-bets/live',
  VALUE_BETS_TEAM: (slug: string) => `/value-bets/teams/${slug}`,
  VALUE_BETS_LEAGUE: (slug: string) => `/value-bets/leagues/${slug}`,
  
  // Tab navigation (hash-based)
  TEAM_FIXTURES: (slug: string) => `/teams/${slug}#fixtures`,
  TEAM_PREDICTIONS_TAB: (slug: string) => `/teams/${slug}#predictions`,
  TEAM_STATISTICS: (slug: string) => `/teams/${slug}#statistics`,
  TEAM_SQUAD: (slug: string) => `/teams/${slug}#squad`,
  
  // Search and discovery
  SEARCH: '/search',
  SEARCH_TEAMS: '/search?type=teams',
  SEARCH_LEAGUES: '/search?type=leagues',
  SEARCH_FIXTURES: '/search?type=fixtures',
} as const;
```

### 2. Enhanced URL Generation Functions

```typescript
// Enhanced URL generation with better slug creation
export function generateTeamUrl(team: Team | Participant): string {
  const slug = generateTeamSlug(team);
  return ROUTES.TEAM_DETAIL(slug);
}

export function generateCountryUrl(country: Country): string {
  const slug = generateCountrySlug(country);
  return ROUTES.COUNTRY_DETAIL(slug);
}

export function generateLeagueUrl(league: League): string {
  const slug = generateLeagueSlug(league);
  return ROUTES.LEAGUE_DETAIL(slug);
}

export function generateFixtureUrl(fixture: Fixture): string {
  const slug = generateFixtureSlug(fixture);
  return ROUTES.FIXTURE_DETAIL(slug);
}

// Enhanced fixture slug generation
export function generateFixtureSlug(fixture: Fixture): string {
  const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home');
  const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away');
  
  if (!homeTeam || !awayTeam) {
    return `fixture-${fixture.id}`;
  }
  
  const date = format(new Date(fixture.starting_at), 'yyyy-MM-dd');
  const homeSlug = generateTeamSlug(homeTeam);
  const awaySlug = generateTeamSlug(awayTeam);
  
  // Create descriptive slug
  return `${fixture.id}-${date}-${homeSlug}-vs-${awaySlug}`;
}

// Enhanced league slug generation
export function generateLeagueSlug(league: League): string {
  if (!league.name) return `league-${league.id}`;
  
  return league.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
```

### 3. Navigation Component Examples

```typescript
// components/navigation/EnhancedNavbar.tsx
export function EnhancedNavbar() {
  const pathname = usePathname();
  
  const navigationItems = [
    {
      label: 'Predictions',
      href: '/predictions',
      icon: '🎯',
      submenu: [
        { label: 'Today', href: '/predictions/today' },
        { label: 'Tomorrow', href: '/predictions/tomorrow' },
        { label: 'This Weekend', href: '/predictions/this-weekend' },
      ]
    },
    {
      label: 'Teams',
      href: '/teams',
      icon: '⚽',
      submenu: [
        { label: 'Premier League', href: '/teams?league=premier-league' },
        { label: 'Champions League', href: '/teams?league=champions-league' },
        { label: 'Serie A', href: '/teams?league=serie-a' },
      ]
    },
    {
      label: 'Leagues',
      href: '/leagues',
      icon: '🏆',
      submenu: [
        { label: 'Premier League', href: '/leagues/premier-league' },
        { label: 'Champions League', href: '/leagues/champions-league' },
        { label: 'Serie A', href: '/leagues/serie-a' },
        { label: 'La Liga', href: '/leagues/la-liga' },
      ]
    },
    {
      label: 'Value Bets',
      href: '/value-bets',
      icon: '💰',
      submenu: [
        { label: 'Top Value Bets', href: '/value-bets/top' },
        { label: 'Live Value Bets', href: '/value-bets/live' },
      ]
    },
    {
      label: 'Live',
      href: '/live',
      icon: '🔴',
    }
  ];
  
  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="default" showText={true} />
          </div>
          
          {/* Main Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                
                {/* Submenu */}
                {item.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Benefits of This Approach

### 1. SEO Benefits
- ✅ Clean, descriptive URLs
- ✅ Consistent URL patterns
- ✅ Better crawling and indexing
- ✅ No query parameters in main URLs

### 2. User Experience
- ✅ Shareable URLs
- ✅ Bookmarkable pages
- ✅ Clear navigation hierarchy
- ✅ Predictable URL structure

### 3. Developer Experience
- ✅ Consistent patterns
- ✅ Easier maintenance
- ✅ Better testing
- ✅ Clear routing logic

### 4. Performance
- ✅ Better caching
- ✅ Faster navigation
- ✅ Reduced server load
- ✅ Optimized routing

This enhanced URL strategy provides a much more professional, SEO-friendly, and user-friendly approach to navigation and URL management.
