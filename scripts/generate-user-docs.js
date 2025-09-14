#!/usr/bin/env node

/**
 * User-Facing Documentation Generation Script
 * 
 * This script generates user-friendly documentation pages that can be served
 * as part of the website for end users, help pages, and feature guides.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const config = {
  outputDir: './docs/user-docs',
  sourceDir: './',
  templateDir: './docs/templates',
  publicDir: './public/docs'
};

/**
 * Generate user help documentation
 */
function generateUserHelpDocs() {
  console.log('👥 Generating user help documentation...');
  
  const helpDocs = {
    'getting-started.md': `# Getting Started with Prediops

## Welcome to Prediops! 🚀

Prediops is your ultimate football predictions and analytics platform. Here's how to get started:

### What is Prediops?
Prediops provides AI-powered football predictions, live match tracking, and value betting analysis to help you make informed decisions.

### Key Features
- **🎯 AI Predictions**: Get probability-based predictions for upcoming matches
- **💰 Value Bets**: Identify betting opportunities with positive expected value
- **📊 Live Scores**: Real-time match updates and statistics
- **🔍 Advanced Search**: Find teams, leagues, and matches quickly
- **⭐ Favorites**: Save your favorite teams and leagues for quick access

### Quick Start Guide

#### 1. Browse Predictions
- Navigate to the **Predictions** page to see today's matches
- Each fixture shows prediction probabilities and value bet indicators
- Click on fixtures to see detailed analysis

#### 2. Use Value Bet Indicators
- Look for **gold dollar icons** (💰) next to fixtures - these indicate value bets
- **White/black icons** show available betting markets without value
- **Gray icons** indicate no betting data available

#### 3. Explore by Country/League
- Use the sidebar to browse predictions by country or league
- Click the star icon to add countries/leagues to your favorites
- Expand countries to see available leagues

#### 4. Search for Specific Content
- Use the search bar to find teams, leagues, or fixtures
- Search results show relevant matches and competitions

### Understanding Prediction Markets

#### Full Time Result (1X2)
- **1**: Home team win
- **X**: Draw
- **2**: Away team win

The percentages show the AI's confidence in each outcome.

#### Value Betting
Value bets are identified when the AI's probability assessment suggests the bookmaker's odds offer positive expected value.

### Tips for Best Results
1. **Check regularly**: Predictions are updated as match time approaches
2. **Consider context**: Review team form and head-to-head records
3. **Use favorites**: Save frequently viewed content for quick access
4. **Explore features**: Try different filters and search options

### Need Help?
- Check the FAQ section below
- Review feature-specific guides
- Contact support if you need assistance

---

*Last updated: ${new Date().toLocaleDateString()}*
`,

    'valuebet-guide.md': `# Value Betting Guide 💰

## What is Value Betting?

Value betting occurs when the odds offered by a bookmaker are higher than the true probability of an event occurring. In other words, you're getting better odds than the actual likelihood suggests.

## How Prediops Identifies Value Bets

### AI Probability Assessment
Our AI analyzes multiple factors to determine the true probability of match outcomes:
- Team form and recent performance
- Head-to-head records
- Player availability and injuries
- Home/away advantage
- League-specific trends

### Value Bet Indicators

#### 🟡 Gold Dollar Icon
- **Meaning**: High-value betting opportunity
- **Action**: Consider placing a bet
- **Expected Value**: Positive expected return

#### ⚪ White/Black Dollar Icon
- **Meaning**: Betting market available but no significant value
- **Action**: Betting possible but not recommended for value
- **Expected Value**: Neutral or negative

#### ⚫ Gray Dollar Icon
- **Meaning**: No betting data available
- **Action**: Check back later or look for other markets
- **Expected Value**: Unknown

## Understanding Value Bet Data

When you see a value bet, the tooltip shows:
- **Bet Name**: The specific market (e.g., "Home Win")
- **Count**: Number of bookmakers offering this bet
- **Best Odds**: Highest available odds
- **Bookmaker**: Which bookmaker offers the best odds

## Value Betting Strategy

### 1. Bankroll Management
- Only bet what you can afford to lose
- Use a small percentage of your bankroll per bet
- Never chase losses

### 2. Shop for Odds
- Compare odds across different bookmakers
- The tooltip shows the best available odds
- Consider opening accounts with multiple bookmakers

### 3. Focus on Value
- Don't bet on every value bet identified
- Focus on bets where you have confidence in the analysis
- Consider the size of the value (margin)

### 4. Keep Records
- Track your betting performance
- Analyze which types of bets work best for you
- Adjust your strategy based on results

## Important Disclaimers

⚠️ **Gambling Responsibility**: 
- Value betting is still gambling and carries risk
- Past performance doesn't guarantee future results
- Only bet what you can afford to lose

⚠️ **Legal Compliance**:
- Ensure online betting is legal in your jurisdiction
- Check bookmaker licensing and regulation
- Be aware of tax implications in your country

⚠️ **Data Accuracy**:
- Odds change frequently
- Verify current odds before placing bets
- AI predictions are estimates, not guarantees

## Advanced Tips

### 1. Market Timing
- Odds change as match time approaches
- Early value bets may disappear quickly
- Monitor markets regularly

### 2. Multiple Markets
- Look beyond just match winner bets
- Consider over/under goals, both teams to score, etc.
- Different markets may offer better value

### 3. Context Matters
- Consider external factors (weather, crowd, etc.)
- Check team news and injury updates
- Review recent form and head-to-head records

---

*Remember: Value betting is a long-term strategy. Success requires patience, discipline, and proper bankroll management.*
`,

    'faq.md': `# Frequently Asked Questions (FAQ)

## General Questions

### What is Prediops?
Prediops is a football predictions and analytics platform that uses AI to analyze matches and identify value betting opportunities.

### How accurate are the predictions?
Our AI predictions are based on comprehensive data analysis, but no prediction system is 100% accurate. Use predictions as one factor in your decision-making process.

### Is Prediops free to use?
Yes, Prediops is currently free to use. We may introduce premium features in the future.

### Do I need to create an account?
No account is required to browse predictions and use basic features. Some advanced features may require registration in the future.

## Value Betting Questions

### What makes a bet a "value bet"?
A value bet occurs when the bookmaker's odds are higher than the true probability of an event occurring, offering positive expected value.

### How often are value bets identified?
Value bets are identified when our AI analysis suggests the bookmaker's odds offer positive expected value. This varies by match and market.

### Should I bet on every value bet?
No. Value betting is a long-term strategy. Focus on bets where you have confidence in the analysis and proper bankroll management.

### Can I trust the odds shown?
Odds change frequently. Always verify current odds with bookmakers before placing bets.

## Technical Questions

### Why don't I see predictions for some matches?
Predictions are typically available 1-21 days before matches. Some matches may not have predictions due to data limitations.

### Why is the venue information missing?
Venue data is not available in our current subscription plan. This doesn't affect the quality of predictions.

### Can I access the site on mobile?
Yes, Prediops is fully responsive and works on all devices.

### How often is the data updated?
Match data is updated in real-time. Predictions may be updated as new information becomes available.

## Navigation Questions

### How do I find predictions for specific leagues?
Use the sidebar to browse by country and league. Click on countries to expand and see available leagues.

### How do I save favorites?
Click the star icon next to countries or leagues in the sidebar to add them to your favorites.

### How do I search for specific teams?
Use the search bar at the top of the sidebar to find teams, leagues, or fixtures.

### Can I filter predictions by date?
Yes, use the date picker to view predictions for specific dates.

## Troubleshooting

### The page is loading slowly
- Check your internet connection
- Try refreshing the page
- Clear your browser cache

### I'm not seeing value bet indicators
- Ensure JavaScript is enabled
- Check if you have any ad blockers that might interfere
- Try refreshing the page

### Predictions seem outdated
- Refresh the page to get the latest data
- Check if you're viewing the correct date
- Some matches may have limited prediction data

### Mobile interface issues
- Ensure you're using a modern browser
- Try rotating your device for better layout
- Check if you have sufficient screen space

## Contact & Support

### How can I report a bug?
Please contact us through our support channels with details about the issue.

### Can I suggest new features?
Yes! We welcome feature suggestions. Please reach out through our support channels.

### Is there a roadmap for future features?
Yes, we're continuously working on improvements. Check our updates for the latest information.

---

*Can't find the answer to your question? Contact our support team for assistance.*
`
  };

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Write help documentation files
  Object.entries(helpDocs).forEach(([filename, content]) => {
    const filePath = path.join(config.outputDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Generated: ${filename}`);
  });

  // Generate help index
  const helpIndex = `# User Help Documentation

## Getting Started
- [Getting Started Guide](./getting-started.md) - New to Prediops? Start here!
- [Value Betting Guide](./valuebet-guide.md) - Learn about value betting
- [FAQ](./faq.md) - Frequently asked questions

## Feature Guides
- [Understanding Predictions](./feature-guides/predictions.md)
- [Using the Sidebar](./feature-guides/sidebar.md)
- [Search Functionality](./feature-guides/search.md)

## Advanced Topics
- [Betting Strategy](./advanced/betting-strategy.md)
- [Data Interpretation](./advanced/data-interpretation.md)
- [Mobile Usage](./advanced/mobile-usage.md)

---

*Generated on: ${new Date().toISOString()}*
*Version: 2.7.0*
`;

  fs.writeFileSync(path.join(config.outputDir, 'README.md'), helpIndex);
  console.log('✅ User help documentation generated');
}

/**
 * Generate feature-specific guides
 */
function generateFeatureGuides() {
  console.log('🎯 Generating feature guides...');
  
  const featureGuidesDir = path.join(config.outputDir, 'feature-guides');
  if (!fs.existsSync(featureGuidesDir)) {
    fs.mkdirSync(featureGuidesDir, { recursive: true });
  }

  const guides = {
    'predictions.md': `# Understanding Predictions 📊

## How Predictions Work

Our AI analyzes multiple data points to generate probability predictions for football matches:

### Data Sources
- Team performance statistics
- Recent form and results
- Head-to-head records
- Player availability and injuries
- Home/away advantage factors
- League-specific trends

### Prediction Display

#### Probability Percentages
Each prediction shows three percentages:
- **Home Win (%)**: Probability of home team winning
- **Draw (%)**: Probability of a draw
- **Away Win (%)**: Probability of away team winning

#### Market Types
- **Full Time Result (1X2)**: Most common prediction market
- **Both Teams to Score**: Whether both teams will score
- **Over/Under Goals**: Total goals in the match

### Reading Predictions

#### High Confidence Predictions
- Clear favorite with >60% probability
- Large margin between outcomes
- Consistent with recent form

#### Low Confidence Predictions
- Close probabilities (e.g., 35%, 30%, 35%)
- Unpredictable matchups
- Limited historical data

### Using Predictions Effectively

1. **Consider Context**: Look at recent form and head-to-head records
2. **Check Updates**: Predictions may change as match time approaches
3. **Compare Markets**: Different betting markets may offer better value
4. **Manage Expectations**: No prediction is guaranteed

### Prediction Accuracy

Our AI predictions are based on statistical analysis but remember:
- Football is inherently unpredictable
- External factors can influence outcomes
- Past performance doesn't guarantee future results
- Use predictions as guidance, not absolute truth

---

*Predictions are updated regularly. Check back closer to match time for the most current analysis.*
`,

    'sidebar.md': `# Using the Sidebar 🗂️

## Sidebar Overview

The sidebar is your navigation hub for exploring predictions by country and league.

### Main Features

#### Search Bar
- **Location**: Top of sidebar
- **Function**: Search for teams, leagues, or fixtures
- **Usage**: Type to filter results in real-time

#### Country List
- **Organization**: Alphabetical order
- **Grouping**: Countries and regions separated
- **Indicators**: 
  - 🌟 Star icon for favorites
  - 📊 Number badges for fixture counts
  - 🌍 Region badge for non-countries

#### League Navigation
- **Access**: Click country to expand
- **Display**: Available leagues for that country
- **Links**: Direct navigation to league predictions

### Navigation Tips

#### Finding Content
1. **By Country**: Scroll through the country list
2. **By Search**: Use the search bar for quick access
3. **By Favorites**: Look for starred items

#### Managing Favorites
- **Add**: Click the star icon next to any country/league
- **Remove**: Click the starred icon to unfavorite
- **Persistent**: Favorites are saved in your browser

#### Understanding Counts
- **Today's Fixtures**: Number of matches today
- **Auto-Update**: Counts refresh automatically
- **Color Coding**: Different colors for different types

### Mobile Usage

#### Touch Interactions
- **Tap to Expand**: Tap countries to see leagues
- **Swipe Navigation**: Scroll through the list
- **Search**: Tap search bar to open keyboard

#### Responsive Design
- **Collapsible**: Sidebar can be hidden on small screens
- **Full Width**: Expands to full width when open
- **Touch Friendly**: Large touch targets for easy navigation

### Advanced Features

#### Region Filtering
- **Hide Regions**: Toggle to show only countries
- **Region Badges**: Visual indicators for continents/world
- **Separate Sections**: Countries and regions grouped separately

#### Sort Options
- **Alphabetical**: Default sorting by name
- **By Fixtures**: Sort by number of matches
- **Custom**: Your preferred sorting method

### Troubleshooting

#### Common Issues
- **Not Loading**: Refresh the page
- **Missing Favorites**: Check browser settings
- **Slow Search**: Clear browser cache

#### Performance Tips
- **Limit Favorites**: Too many favorites may slow loading
- **Clear Search**: Clear search terms to improve performance
- **Regular Refresh**: Refresh periodically for latest data

---

*The sidebar is optimized for both desktop and mobile use. All features work across devices.*
`,

    'search.md': `# Search Functionality 🔍

## Search Overview

Prediops includes powerful search functionality to help you quickly find teams, leagues, and fixtures.

### Search Bar Location
- **Desktop**: Top of the sidebar
- **Mobile**: Collapsible search in sidebar
- **Always Available**: Accessible from any page

### What You Can Search For

#### Teams
- **Team Names**: "Manchester United", "Real Madrid"
- **Partial Names**: "Man", "Real", "Bayern"
- **Nicknames**: "Red Devils", "Galacticos"

#### Leagues
- **League Names**: "Premier League", "La Liga"
- **Competition Types**: "Champions League", "World Cup"
- **Partial Names**: "Premier", "Serie A"

#### Fixtures
- **Match Descriptions**: "Man United vs Liverpool"
- **Team Combinations**: "Barcelona Real Madrid"
- **Date References**: "Today", "Tomorrow"

### Search Tips

#### Effective Searching
1. **Use Keywords**: Focus on key team/league names
2. **Try Variations**: Different name formats may work
3. **Be Specific**: More specific terms yield better results
4. **Check Spelling**: Ensure correct spelling for best results

#### Search Results
- **Instant Results**: Results appear as you type
- **Relevant Matches**: Most relevant results shown first
- **Quick Access**: Click results for direct navigation

### Advanced Search Features

#### Filtering
- **By Type**: Filter results by teams, leagues, or fixtures
- **By Date**: Search within specific date ranges
- **By League**: Limit search to specific competitions

#### Result Display
- **Match Information**: Shows teams, date, and league
- **Quick Actions**: Direct links to relevant pages
- **Context**: Additional information about matches

### Mobile Search

#### Touch Interface
- **Easy Input**: Large, touch-friendly search bar
- **Keyboard Support**: Full keyboard functionality
- **Auto-Complete**: Suggestions as you type

#### Mobile Optimizations
- **Responsive Results**: Results adapt to screen size
- **Touch Targets**: Large, easy-to-tap result items
- **Swipe Gestures**: Swipe to dismiss search

### Search Performance

#### Speed Optimization
- **Real-time Results**: Instant search as you type
- **Debounced Input**: Optimized for performance
- **Cached Results**: Frequently searched items load faster

#### Best Practices
- **Clear Search**: Clear search terms when done
- **Specific Terms**: Use specific rather than general terms
- **Recent Searches**: Recent searches may appear in suggestions

### Troubleshooting Search

#### Common Issues
- **No Results**: Try different keywords or spelling
- **Slow Response**: Check internet connection
- **Missing Items**: Some content may not be indexed

#### Improving Results
- **Refine Terms**: Use more specific search terms
- **Check Filters**: Ensure filters aren't too restrictive
- **Try Synonyms**: Use alternative team/league names

---

*Search is continuously improved. If you can't find something, try different keywords or contact support.*
`
  };

  // Write feature guide files
  Object.entries(guides).forEach(([filename, content]) => {
    const filePath = path.join(featureGuidesDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Generated: ${filename}`);
  });

  console.log('✅ Feature guides generated');
}

/**
 * Generate advanced topics documentation
 */
function generateAdvancedDocs() {
  console.log('🎓 Generating advanced topics...');
  
  const advancedDir = path.join(config.outputDir, 'advanced');
  if (!fs.existsSync(advancedDir)) {
    fs.mkdirSync(advancedDir, { recursive: true });
  }

  const advancedDocs = {
    'betting-strategy.md': `# Betting Strategy Guide 🎯

## Introduction to Betting Strategy

While Prediops provides predictions and value bet identification, successful betting requires a comprehensive strategy.

### Core Principles

#### 1. Bankroll Management
- **Rule of Thumb**: Never bet more than 5% of your bankroll on a single bet
- **Unit System**: Use consistent bet sizes (e.g., 1-5 units per bet)
- **Emergency Fund**: Keep reserves separate from betting bankroll

#### 2. Value Betting Philosophy
- **Long-term Focus**: Value betting is about long-term profitability
- **Expect Variance**: Short-term results can vary significantly
- **Patience Required**: Success comes from consistent application

#### 3. Discipline and Psychology
- **Stick to Strategy**: Don't deviate from your plan due to emotions
- **Avoid Chasing Losses**: Never increase bet sizes after losses
- **Take Breaks**: Step away when feeling frustrated or overconfident

### Advanced Value Betting

#### Kelly Criterion
A mathematical approach to bet sizing based on edge and odds:

\`\`\`
Optimal Bet Size = (bp - q) / b
Where:
b = decimal odds - 1
p = probability of winning
q = probability of losing (1 - p)
\`\`\`

#### Expected Value Calculation
\`\`\`
EV = (Probability × Odds × Stake) - Stake
Positive EV = Profitable bet
Negative EV = Unprofitable bet
\`\`\`

### Market Analysis

#### Pre-Match Analysis
1. **Team Form**: Recent results and performance trends
2. **Head-to-Head**: Historical matchups between teams
3. **Injuries/Suspensions**: Key player availability
4. **Motivation**: League position and importance of match
5. **External Factors**: Weather, crowd, travel, etc.

#### In-Play Considerations
- **Momentum Shifts**: How the match is developing
- **Tactical Changes**: Substitutions and formation changes
- **Score Effects**: How current score affects team behavior

### Risk Management

#### Diversification
- **Multiple Markets**: Don't focus on just one type of bet
- **Different Leagues**: Spread risk across competitions
- **Time Diversification**: Don't bet all at once

#### Stop-Loss Strategies
- **Daily Limits**: Maximum loss per day
- **Weekly Limits**: Maximum loss per week
- **Drawdown Limits**: Stop when down a certain percentage

### Common Mistakes to Avoid

#### Emotional Betting
- **Favoritism**: Don't bet on your favorite team without analysis
- **Recency Bias**: Don't overreact to recent results
- **Confirmation Bias**: Don't ignore contradictory information

#### Technical Mistakes
- **Poor Bankroll Management**: Betting too much on single bets
- **Chasing Losses**: Increasing stakes after losses
- **Overconfidence**: Betting more after wins

### Record