#!/usr/bin/env node

/**
 * Enhanced Documentation Generation Script
 * 
 * This script generates comprehensive documentation for the Prediops codebase
 * including API docs, component docs, architecture diagrams, and user-facing documentation.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  outputDir: './docs/generated',
  userDocsDir: './docs/generated/user',
  sourceDir: './',
  excludePatterns: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
    'docs/generated'
  ]
};

/**
 * Generate user-facing documentation
 */
function generateUserDocs() {
  console.log('👥 Generating user-facing documentation...');
  
  // Create user docs directory
  if (!fs.existsSync(config.userDocsDir)) {
    fs.mkdirSync(config.userDocsDir, { recursive: true });
  }

  // User Guide
  const userGuide = `# User Guide - Prediops

## Welcome to Prediops! 🚀

Prediops is your ultimate football predictions and analytics platform. This guide will help you get the most out of all our features.

## 🏠 Getting Started

### What is Prediops?
Prediops uses advanced AI and machine learning to provide accurate football predictions, live match tracking, and value betting opportunities.

### Key Features
- **AI-Powered Predictions**: Get probability-based predictions for football matches
- **Live Match Tracking**: Follow matches in real-time with live scores
- **Value Betting**: Identify profitable betting opportunities with our ValueBet indicators
- **Comprehensive Coverage**: Access predictions for leagues worldwide
- **Mobile-Friendly**: Optimized experience on all devices

## 🎯 How to Use Predictions

### Understanding Prediction Probabilities
Each match shows three main prediction markets:

#### 1. Full Time Result (1X2)
- **1** (Home Win): Probability of home team winning
- **X** (Draw): Probability of a draw
- **2** (Away Win): Probability of away team winning

#### 2. Over/Under Goals
- **Over 2.5**: Probability of 3 or more goals
- **Under 2.5**: Probability of 2 or fewer goals

#### 3. Both Teams to Score (BTTS)
- **Yes**: Probability both teams will score
- **No**: Probability one or both teams won't score

### Reading Prediction Displays
- **Percentage Values**: Higher percentages indicate more likely outcomes
- **Color Coding**: Green for high probability, yellow for medium, red for low
- **Market Selection**: Use dropdown to switch between different prediction markets

## 💰 ValueBet Feature

### What are ValueBets?
ValueBets are betting opportunities where the odds offered by bookmakers are higher than the true probability of the event occurring.

### ValueBet Indicators
Look for these icons next to fixtures:

- **🟡 Gold Dollar Icon**: High-value bet opportunity
- **⚪ White/Black Dollar Icon**: Betting available but not a value bet
- **⚫ Gray Dollar Icon**: No betting data available

### Understanding ValueBet Data
When you see a ValueBet indicator, hover over it to see:
- **Bet Type**: The specific market (e.g., "Over 2.5 Goals")
- **Recommended Odds**: Minimum odds to make this bet profitable
- **Value Percentage**: How much value this bet represents
- **Bookmaker**: Where you can find these odds

### ValueBet Settings
Toggle detailed explanations in your display settings to see:
- Why this is considered a value bet
- Historical performance data
- Risk assessment

## 🏆 Navigation & Search

### Sidebar Features
- **Favorites**: Star countries/leagues you follow most
- **Search**: Find specific teams, leagues, or countries quickly
- **Country Links**: Direct access to country-specific predictions
- **League Expansion**: Click to see all leagues in a country

### Finding Matches
1. **By Country**: Use the sidebar to select your country
2. **By League**: Expand countries to see specific leagues
3. **By Date**: Use the date picker to see future matches
4. **By Search**: Search for specific teams or leagues

## 📱 Mobile Experience

### Optimized for Mobile
- **Responsive Design**: Works perfectly on phones and tablets
- **Touch-Friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized for mobile networks
- **Offline Support**: Basic functionality works offline

### Mobile Features
- **Swipe Navigation**: Easy browsing between matches
- **Quick Actions**: Tap to expand/collapse match details
- **Share Functionality**: Share interesting matches with friends

## ⚙️ Settings & Preferences

### Display Settings
Access settings through the gear icon in the top navigation:

- **ValueBet Explanations**: Toggle detailed explanations for ValueBets
- **Dark/Light Mode**: Switch between themes
- **Notifications**: Manage match alerts and updates

### Personalization
- **Favorites**: Star your preferred countries and leagues
- **Recent Searches**: Quick access to recently viewed items
- **Custom Filters**: Set up filters for specific match types

## 📊 Understanding Match Data

### Match Information
Each match shows:
- **Teams**: Home vs Away with team logos
- **League**: Competition name and country
- **Date & Time**: Match start time in your local timezone
- **Venue**: Stadium information (when available)

### Live Match Features
- **Live Scores**: Real-time score updates
- **Match State**: Live, Finished, Postponed, etc.
- **Match Events**: Goals, cards, substitutions
- **Statistics**: Possession, shots, corners

## 🔍 Tips for Better Results

### Using Predictions Effectively
1. **Consider Multiple Markets**: Don't rely on just one prediction type
2. **Check Recent Form**: Look at team performance in recent matches
3. **Understand Context**: Consider injuries, suspensions, and motivation
4. **Use ValueBets Wisely**: Only bet what you can afford to lose

### Maximizing ValueBet Opportunities
1. **Compare Odds**: Check multiple bookmakers for best prices
2. **Understand Risk**: Higher value doesn't always mean higher probability
3. **Bankroll Management**: Never bet more than you can afford
4. **Track Performance**: Keep records of your betting results

## ❓ Frequently Asked Questions

### Q: How accurate are the predictions?
A: Our AI model is trained on extensive historical data and achieves high accuracy, but no prediction is 100% guaranteed.

### Q: Are ValueBets guaranteed to win?
A: No. ValueBets identify opportunities where odds are favorable, but there's always risk involved in betting.

### Q: Can I use this for live betting?
A: Yes! Our live scores and real-time data help inform live betting decisions.

### Q: Is there a mobile app?
A: Currently, Prediops is optimized for mobile browsers. A dedicated app may be available in the future.

### Q: How often are predictions updated?
A: Predictions are updated regularly as new information becomes available, typically several times per day.

## 🆘 Getting Help

### Support Resources
- **Help Center**: Check our FAQ section
- **Contact Support**: Reach out through our contact form
- **Community**: Join our user community for tips and discussions

### Reporting Issues
If you encounter any problems:
1. Check your internet connection
2. Try refreshing the page
3. Clear your browser cache
4. Contact support with specific error details

---

**Last Updated**: ${new Date().toLocaleDateString()}
**Version**: 2.7.0
`;

  fs.writeFileSync(path.join(config.userDocsDir, 'USER_GUIDE.md'), userGuide);

  // FAQ
  const faq = `# Frequently Asked Questions

## General Questions

### What is Prediops?
Prediops is a football predictions and analytics platform that uses AI to provide accurate match predictions, live scores, and value betting opportunities.

### Is Prediops free to use?
Yes! Prediops offers free access to predictions, live scores, and basic features. Premium features may be available in the future.

### Which leagues and countries are covered?
Prediops covers major football leagues worldwide including:
- Premier League (England)
- La Liga (Spain)
- Serie A (Italy)
- Bundesliga (Germany)
- Ligue 1 (France)
- And many more leagues across different countries

## Predictions & Analytics

### How accurate are the predictions?
Our AI model analyzes extensive historical data and achieves high accuracy rates. However, football is unpredictable, and no prediction is 100% guaranteed.

### What prediction markets are available?
We offer predictions for:
- Full Time Result (1X2)
- Over/Under Goals
- Both Teams to Score (BTTS)
- And other popular markets

### How often are predictions updated?
Predictions are updated regularly throughout the day as new information becomes available, including team news, injuries, and other factors.

## ValueBet Feature

### What is a ValueBet?
A ValueBet occurs when the odds offered by bookmakers are higher than the true probability of an event happening, creating a profitable opportunity.

### How do I identify ValueBets?
Look for the gold dollar icon (🟡) next to matches. Hover over it to see detailed information about the betting opportunity.

### Are ValueBets guaranteed to win?
No. While ValueBets represent good opportunities based on probability, there's always risk involved in betting.

## Technical Questions

### What browsers are supported?
Prediops works on all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Is there a mobile app?
Currently, Prediops is optimized for mobile browsers. A dedicated mobile app may be available in the future.

### Why are some matches missing venue information?
Venue information depends on data availability from our providers. Some matches may not have complete venue details.

## Account & Settings

### Do I need to create an account?
No account is required to use basic features. However, creating an account allows you to:
- Save favorites
- Access personalized features
- Get notifications

### How do I change my preferences?
Use the settings icon in the top navigation to adjust:
- Display preferences
- Notification settings
- Theme (dark/light mode)

## Troubleshooting

### The page isn't loading properly
Try these solutions:
1. Refresh the page
2. Clear your browser cache
3. Check your internet connection
4. Try a different browser

### Predictions aren't showing
This could be due to:
- No upcoming matches for the selected date
- Temporary data loading issues
- Network connectivity problems

### Live scores aren't updating
Live scores update automatically. If they seem stuck:
1. Refresh the page
2. Check your internet connection
3. Ensure JavaScript is enabled in your browser

## Contact & Support

### How can I get help?
- Check this FAQ first
- Contact our support team
- Join our community discussions

### Can I suggest new features?
Yes! We welcome feedback and suggestions. Contact us through our support channels.

### How do I report a bug?
Please contact support with:
- Description of the issue
- Steps to reproduce
- Browser and device information
- Screenshots if applicable
`;

  fs.writeFileSync(path.join(config.userDocsDir, 'FAQ.md'), faq);

  // Feature Overview
  const features = `# Feature Overview

## 🎯 Core Features

### AI-Powered Predictions
- **Machine Learning Models**: Advanced algorithms trained on historical data
- **Multiple Markets**: Predictions for various betting markets
- **Real-time Updates**: Predictions updated as new information becomes available
- **Probability Display**: Clear percentage-based probability indicators

### Live Match Tracking
- **Real-time Scores**: Live score updates during matches
- **Match Statistics**: Possession, shots, corners, and more
- **Match Events**: Goals, cards, substitutions in real-time
- **Match State**: Live, finished, postponed status indicators

### ValueBet Identification
- **Smart Analysis**: AI identifies profitable betting opportunities
- **Visual Indicators**: Color-coded dollar icons for easy identification
- **Detailed Information**: Hover for comprehensive betting data
- **Odds Comparison**: Recommended minimum odds for profitability

## 🏆 Navigation Features

### Smart Sidebar
- **Favorites System**: Star countries and leagues you follow
- **Quick Search**: Find teams, leagues, and countries instantly
- **Country Links**: Direct navigation to country-specific predictions
- **League Expansion**: Hierarchical league organization by country

### Advanced Filtering
- **Date Selection**: Choose specific dates for match viewing
- **League Filtering**: Filter matches by specific leagues
- **Country Filtering**: Focus on specific countries
- **Search Functionality**: Find specific teams or matches

## 📱 Mobile Experience

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Fast Loading**: Optimized for mobile networks
- **Offline Support**: Basic functionality without internet

### Mobile-Specific Features
- **Swipe Navigation**: Easy browsing between matches
- **Quick Actions**: Tap to expand/collapse details
- **Share Integration**: Share matches with friends
- **Push Notifications**: Match alerts and updates

## ⚙️ Personalization

### User Preferences
- **Display Settings**: Customize your viewing experience
- **Theme Selection**: Dark and light mode options
- **ValueBet Explanations**: Toggle detailed explanations
- **Notification Preferences**: Control what alerts you receive

### Customization Options
- **Favorite Countries**: Quick access to preferred countries
- **Favorite Leagues**: Star leagues you follow closely
- **Recent Searches**: Quick access to recently viewed items
- **Custom Filters**: Set up personalized match filters

## 🔍 Data & Analytics

### Comprehensive Coverage
- **Global Reach**: Matches from leagues worldwide
- **Historical Data**: Access to extensive historical information
- **Team Statistics**: Detailed team performance data
- **League Information**: Complete league standings and information

### Data Quality
- **Real-time Updates**: Fresh data throughout the day
- **Multiple Sources**: Data aggregated from reliable sources
- **Error Handling**: Graceful handling of data issues
- **Data Validation**: Ensures data accuracy and consistency

## 🚀 Performance Features

### Speed & Reliability
- **Fast Loading**: Optimized for quick page loads
- **Caching**: Intelligent caching for better performance
- **Error Recovery**: Automatic retry mechanisms
- **Progressive Loading**: Load content as needed

### User Experience
- **Intuitive Interface**: Easy-to-use design
- **Consistent Navigation**: Familiar patterns throughout
- **Accessibility**: Support for users with disabilities
- **Cross-Platform**: Works on all devices and browsers

## 🔮 Future Features

### Planned Enhancements
- **Advanced Analytics**: More detailed statistical analysis
- **Social Features**: Share and discuss predictions
- **Mobile App**: Dedicated mobile application
- **API Access**: Developer API for third-party integrations

### Continuous Improvement
- **Regular Updates**: New features and improvements
- **User Feedback**: Incorporating user suggestions
- **Performance Optimization**: Ongoing speed and reliability improvements
- **Data Expansion**: Adding more leagues and markets
`;

  fs.writeFileSync(path.join(config.userDocsDir, 'FEATURES.md'), features);

  console.log('✅ User-facing documentation generated');
}

/**
 * Generate developer documentation (enhanced version)
 */
function generateDevDocs() {
  console.log('👨‍💻 Generating enhanced developer documentation...');
  
  // Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Enhanced API documentation
  const apiDoc = `# API Reference - Enhanced

## Overview
This section contains comprehensive documentation for all API endpoints in the Prediops application.

## Authentication
All API endpoints require proper authentication headers.

## Rate Limiting
API calls are rate limited to prevent abuse.

## Error Handling
All endpoints return consistent error responses.

## Available Endpoints

### Predictions API
- **GET** \`/api/sportmonks/predictions\` - Get prediction probabilities
- **GET** \`/api/sportmonks/predictions/fixtures/[fixtureId]\` - Get predictions for specific fixture

### Fixtures API
- **GET** \`/api/sportmonks/fixtures\` - Get upcoming fixtures
- **GET** \`/api/sportmonks/fixtures/date/[date]\` - Get fixtures for specific date
- **GET** \`/api/sportmonks/fixtures/live\` - Get live fixtures

### ValueBet API
- **GET** \`/api/sportmonks/value-bets\` - Get value bets
- **GET** \`/api/sportmonks/value-bets/fixture/[fixtureId]\` - Get value bets for fixture

### Search API
- **GET** \`/api/search\` - Global search functionality

## API Limitations

### Subscription Limitations
- **Venue Endpoint**: Not available in current subscription
- **Head-to-Head**: Suspended due to subscription limitations

### Valid Include Parameters
- \`participants\` - Team/participant information
- \`scores\` - Match scores and results
- \`state\` - Match state (live, finished, etc.)
- \`predictions.type\` - Prediction type information
- \`league.country\` - League and country details
- \`stage\` - Match stage information
- \`round\` - Match round information

## Response Formats

### Success Response
\`\`\`json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-12-19T10:00:00.000Z",
  "count": 25
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
\`\`\`

## Best Practices

### Include Parameters
- Always use valid include parameters
- Avoid venue include (not available in subscription)
- Use \`predictions.type\` instead of \`predictions.market\` or \`predictions.outcomes\`

### Error Handling
- Implement proper error handling for all API calls
- Handle subscription limitations gracefully
- Provide fallback data when possible

### Performance
- Use appropriate pagination
- Implement caching where possible
- Avoid unnecessary API calls
`;

  fs.writeFileSync(path.join(config.outputDir, 'api-reference-enhanced.md'), apiDoc);

  console.log('✅ Enhanced developer documentation generated');
}

/**
 * Generate component documentation with examples
 */
function generateComponentDocs() {
  console.log('🧩 Generating enhanced component documentation...');
  
  const componentsDir = './app/components';
  const componentDocs = [];
  
  function scanDirectory(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(relativePath, item));
      } else if (item.endsWith('.tsx') && !item.includes('.test.') && !item.includes('.spec.')) {
        const componentName = item.replace('.tsx', '');
        const componentPath = path.join(relativePath, item);
        
        componentDocs.push({
          name: componentName,
          path: componentPath,
          fullPath: fullPath
        });
      }
    });
  }
  
  scanDirectory(componentsDir);
  
  // Generate enhanced component index
  const componentIndex = `# Enhanced Component Library

## Overview
This section contains comprehensive documentation for all React components in the Prediops application.

## Component Categories

### Navigation Components
- **Sidebar** - Main navigation with favorites and search
- **Navbar** - Top navigation bar
- **SidebarStatic** - Static sidebar shell for immediate loading

### Fixture Components
- **FixtureCard** - Individual fixture display with predictions
- **PredictionMarkets** - Prediction market display
- **ValueBetIcon** - ValueBet indicator with tooltips

### UI Components
- **LoadingIndicator** - Loading states and skeletons
- **Tooltip** - Enhanced tooltip system
- **Badge** - Status and category badges

### Feature Components
- **DisplaySettingsToggle** - User preference controls
- **Search** - Global search functionality
- **DatePicker** - Date selection component

## Component Guidelines

### Props Documentation
Each component includes:
- **Required Props**: Essential properties
- **Optional Props**: Additional configuration
- **Default Values**: Default prop values
- **Type Definitions**: TypeScript interfaces

### Usage Examples
- **Basic Usage**: Simple implementation examples
- **Advanced Usage**: Complex use cases
- **Styling Examples**: Custom styling approaches
- **Integration Examples**: How to use with other components

### Accessibility
- **ARIA Labels**: Proper accessibility labels
- **Keyboard Navigation**: Keyboard interaction support
- **Screen Reader**: Screen reader compatibility
- **Focus Management**: Focus handling and management

### Performance
- **Memoization**: React.memo usage where appropriate
- **Lazy Loading**: Dynamic imports for large components
- **Optimization**: Performance optimization strategies
- **Bundle Size**: Impact on application bundle size

## Development Guidelines

### Creating New Components
1. **Use TypeScript**: Always use TypeScript for type safety
2. **Add JSDoc Comments**: Document all props and methods
3. **Include Examples**: Provide usage examples
4. **Test Accessibility**: Ensure accessibility compliance
5. **Optimize Performance**: Consider memoization and lazy loading

### Component Structure
\`\`\`typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component implementation
  return (
    <div className={cn('base-classes', props.className)}>
      {/* Component content */}
    </div>
  );
};
\`\`\`

### Styling Guidelines
- **Use Tailwind CSS**: Utility-first approach
- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: Support for dark/light themes
- **Consistent Spacing**: Use design system spacing

## Component Examples

### Basic Component
\`\`\`typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md'
}) => {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant} btn-\${size}\`}
    >
      {children}
    </button>
  );
};
\`\`\`

### Advanced Component
\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { memo } from 'react';

interface DataComponentProps {
  data: any[];
  loading?: boolean;
  error?: string;
}

export const DataComponent = memo<DataComponentProps>(({
  data,
  loading = false,
  error
}) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="data-container">
      {localData.map(item => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  );
});
\`\`\`
`;

  fs.writeFileSync(path.join(config.outputDir, 'component-library-enhanced.md'), componentIndex);
  
  console.log('✅ Enhanced component documentation generated');
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting enhanced documentation generation...');
  
  try {
    // Generate all documentation
    generateUserDocs();
    generateDevDocs();
    generateComponentDocs();
    
    console.log('✅ Enhanced documentation generation completed!');
    console.log(`📁 Output directory: ${config.outputDir}`);
    console.log(`👥 User docs directory: ${config.userDocsDir}`);
    console.log('\n📚 Generated Documentation:');
    console.log('  - User Guide');
    console.log('  - FAQ');
    console.log('  - Feature Overview');
    console.log('  - Enhanced API Reference');
    console.log('  - Enhanced Component Library');
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateUserDocs,
  generateDevDocs,
  generateComponentDocs
};
