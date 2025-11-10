# Fixture Detail Page Design

## Overview
The fixture detail page provides comprehensive information about a single football match, including real-time scores, statistics, lineups, predictions, and more.

## URL Structure
- **Pattern**: `/fixture/[fixtureId]/[slug]`
- **Example**: `/fixture/19253430/manchester-united-vs-chelsea`
- **Slug Generation**: Based on team names (e.g., `{team1}-vs-{team2}`)

## Page Sections

### 1. Match Header (Hero Section)
**Location**: Top of page, full-width
**Components**:
- **Team Names & Logos**: Large display with team logos (if available)
- **Score Display**: 
  - Live: Current score with minute indicator
  - Upcoming: Match date and time
  - Finished: Final score with result indicator (FT, AET, PEN)
- **Match Status Badge**: 
  - Live (with minute indicator)
  - Not Started (with countdown)
  - Finished
  - Postponed/Cancelled
- **League & Competition Info**: League name, country, round/stage
- **Venue**: Stadium name (if available)
- **Date & Time**: Formatted with timezone awareness

### 2. Quick Stats Bar
**Location**: Below header, horizontal scroll on mobile
**Components**:
- Possession %
- Shots
- Shots on Target
- Corners
- Fouls
- Yellow Cards
- Red Cards
- Offsides

### 3. Match Timeline (Events)
**Location**: Main content area
**Components**:
- **Timeline View**: Vertical timeline of match events
- **Event Types**:
  - Goals (with scorer, assist, minute)
  - Cards (yellow/red with player, minute)
  - Substitutions (in/out players, minute)
  - VAR decisions
  - Other key events
- **Period Indicators**: 1st Half, 2nd Half, Extra Time, Penalties
- **Visual Design**: Color-coded events (goals in green, cards in yellow/red)

### 4. Match Statistics
**Location**: Tabbed or accordion section
**Components**:
- **Overall Statistics**: 
  - Possession, Shots, Shots on Target, Passes, Pass Accuracy
  - Corners, Fouls, Offsides, Yellow/Red Cards
- **Attacking Statistics**:
  - Attacks, Dangerous Attacks, Big Chances
- **Defensive Statistics**:
  - Clearances, Interceptions, Tackles
- **Visual Comparison**: Side-by-side bars or charts for team comparison

### 5. Lineups
**Location**: Tabbed section or collapsible
**Components**:
- **Starting XI**: 
  - Formation display (e.g., 4-3-3)
  - Player positions on field diagram
  - Player names with jersey numbers
- **Substitutes**: Bench players
- **Formation Comparison**: Both teams' formations side-by-side
- **Player Information**: Links to player/team pages (if available)

### 6. Predictions
**Location**: Dedicated section
**Components**:
- **AI Predictions**: 
  - Match outcome probabilities (Home/Draw/Away)
  - Score predictions
  - Over/Under goals
- **Prediction Markets**: 
  - Various prediction types from SportMonks
  - Confidence indicators
- **Value Bets**: If available, highlight value betting opportunities

### 7. Odds (if available)
**Location**: Tabbed or sidebar section
**Components**:
- **Match Odds**: 1X2, Double Chance, Over/Under
- **Bookmaker Comparison**: Multiple bookmakers (if data available)
- **Odds Movement**: Historical odds changes (if available)

### 8. Head-to-Head
**Location**: Collapsible section
**Components**:
- **Previous Meetings**: Last 5-10 matches between teams
- **H2H Statistics**: 
  - Wins/Draws/Losses
  - Goals scored/conceded
  - Average goals per match
- **Recent Form**: Last 5 matches for each team

### 9. League Context
**Location**: Sidebar or bottom section
**Components**:
- **Current League Table**: Showing both teams' positions
- **Upcoming Fixtures**: Next matches for both teams
- **League Standings Link**: Quick link to full league table

### 10. Navigation & Actions
**Location**: Sticky header or floating action buttons
**Components**:
- **Back Button**: Return to previous page
- **Share Button**: Share match link
- **Team Links**: Quick links to both team pages
- **League Link**: Link to league detail page
- **Favorite/Bookmark**: Save fixture for later

## Responsive Design

### Desktop (≥1024px)
- Two-column layout: Main content (70%) + Sidebar (30%)
- All sections visible, tabs for organization
- Sidebar: Odds, League context, Quick links

### Tablet (768px - 1023px)
- Single column with collapsible sections
- Tabs for Statistics, Lineups, Predictions
- Sidebar content moved to bottom

### Mobile (<768px)
- Single column, full width
- Accordion-style sections for space efficiency
- Horizontal scroll for stats
- Bottom navigation for quick actions

## Data Requirements

### API Endpoints Needed:
1. **Fixture Details**: `/fixtures/{fixtureId}` with includes:
   - `participants` (team info, logos)
   - `scores` (current scores, periods)
   - `state` (match status)
   - `league.country` (league context)
   - `venue` (stadium info)
   - `round.stage` (competition context)

2. **Statistics**: `/statistics/fixtures/{fixtureId}` with includes:
   - `participant` (team stats)
   - `type` (stat type)

3. **Lineups**: `/lineups/fixtures/{fixtureId}` with includes:
   - `player` (player details)
   - `position` (position info)
   - `formation` (formation details)

4. **Events**: Included in fixture with `events` include:
   - `type` (event type)
   - `period` (match period)
   - `player` (player involved)

5. **Predictions**: Included in fixture or `/predictions/probabilities/fixtures/{fixtureId}`
   - `type` (prediction type)

6. **Odds**: `/odds/pre-match/fixtures/{fixtureId}`
   - Bookmaker odds
   - Market types

7. **Head-to-Head**: `/fixtures/head-to-head/{team1Id}/{team2Id}`
   - Previous matches

## Performance Considerations

1. **Server-Side Rendering**: Use Next.js server components for initial page load
2. **Incremental Data Loading**: 
   - Load essential data (header, score) first
   - Load statistics, lineups, predictions progressively
3. **Caching**: Cache fixture data (TTL: 1-5 minutes for live matches, longer for finished)
4. **Real-time Updates**: For live matches, use polling or WebSocket for score updates
5. **Image Optimization**: Optimize team logos and player images

## SEO Considerations

1. **Meta Tags**:
   - Title: `{Team1} vs {Team2} - {League} | Prediops`
   - Description: Match date, time, and key information
   - Open Graph: Match preview image, score (if live/finished)

2. **Structured Data**: JSON-LD for:
   - SportsEvent schema
   - Organization schema (teams)
   - AggregateRating (if available)

3. **URL Structure**: SEO-friendly slugs with team names

## Accessibility

1. **ARIA Labels**: For all interactive elements
2. **Keyboard Navigation**: Full keyboard support
3. **Screen Reader**: Descriptive text for scores, stats, events
4. **Color Contrast**: WCAG AA compliant
5. **Focus Indicators**: Clear focus states

## Implementation Priority

### Phase 1 (MVP):
1. Match Header with basic info
2. Match Timeline (Events)
3. Basic Statistics
4. Predictions section

### Phase 2 (Enhanced):
5. Lineups
6. Head-to-Head
7. Odds display
8. League context

### Phase 3 (Advanced):
9. Real-time updates for live matches
10. Advanced statistics visualization
11. Formation diagrams
12. Player heatmaps (if available)

