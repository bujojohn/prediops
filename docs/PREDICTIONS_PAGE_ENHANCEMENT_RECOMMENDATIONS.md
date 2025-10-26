Great question! Let me analyze the current `/predictions` page to understand its structure and identify areas for enhancement and cleanup.


[4 tools called]

Based on my analysis of the `/predictions` page structure, here are my recommendations for enhancements and cleanups:

## 🎯 **Predictions Page Enhancement Recommendations**

### **🚀 High Priority Enhancements**

#### **1. Performance & Loading Optimizations**
- **⚡ Implement React Query**: Replace manual state management with React Query for better caching, background updates, and error handling
- **🔄 Skeleton Loading**: Replace basic "Loading predictions..." with proper skeleton components
- **📦 Code Splitting**: Split large components (LatestFixturesClient) into smaller, lazy-loaded components
- **🎯 Memoization**: Add React.memo to expensive components like FixtureCard

#### **2. User Experience Improvements**
- **🔍 Search & Filtering**: Add search functionality to filter fixtures by team, league, or prediction type
- **📊 Prediction Confidence Indicators**: Visual indicators for prediction confidence levels
- **⭐ Favorite Fixtures**: Allow users to mark fixtures as favorites
- **📱 Mobile Optimization**: Improve mobile layout and touch interactions
- **🎨 Dark Mode Consistency**: Ensure all components follow the design system

#### **3. Data & State Management**
- **🗄️ Centralized State**: Use Zustand or Context API for global state management
- **💾 Local Storage**: Persist user preferences (date, filters, collapsed states)
- **�� Real-time Updates**: Implement WebSocket or polling for live fixture updates
- **📈 Analytics**: Track user interactions and popular fixtures

### **🧹 Code Cleanup & Refactoring**

#### **4. Component Architecture**
```typescript
// Current issues:
// - Large monolithic components (LatestFixturesClient.tsx is 400+ lines)
// - Mixed concerns (data fetching + UI logic)
// - Duplicate grouping logic across components

// Recommended structure (Note: Project use App Router for navigation): 
app/predictions/
├── components/
│   ├── PredictionsHeader.tsx
│   ├── PredictionsFilters.tsx
│   ├── FixturesList/
│   │   ├── index.tsx
│   │   ├── FixturesGroup.tsx
│   │   └── FixtureCard.tsx
│   └── PredictionsSidebar.tsx
├── hooks/
│   ├── usePredictions.ts
│   ├── useDatePicker.ts
│   └── useFixturesGrouping.ts
└── utils/
    ├── predictions-utils.ts
    └── grouping-utils.ts
```

#### **5. Technical Debt Issues**
- **🔧 Fix TODO Comments**: Address the TODO in line 61 about date collapse logic
- **📝 Type Safety**: Improve type definitions and reduce `any` usage (Note: `any` really not useful)
- **🔄 API Error Handling**: Standardize error handling across all API calls
- **🧪 Testing**: Add unit tests for utility functions and components

### **�� UI/UX Enhancements**

#### **6. Visual Improvements**
- **📊 Prediction Visualization**: Charts showing prediction probabilities
- **🏆 League Standings Integration**: Show current standings alongside fixtures (Note: I assume this is a different feature from tha t implemented in leagues pages )
- **⏰ Time Zone Support**: Better time zone handling and display (Note: current setup seems to be working acurately)
- **🎯 Value Bet Highlighting**: Prominently display high-value predictions (Note: current setup seems to be working acurately unless useful enhancement is made)

#### **7. Accessibility & SEO**
- **♿ ARIA Labels**: Improve screen reader support
- **🔍 SEO Optimization**: Better meta tags and structured data
- **⌨️ Keyboard Navigation**: Full keyboard accessibility
- **📱 Touch Gestures**: Swipe actions for mobile

### **🔧 Implementation Priority**

#### **Phase 1 (Immediate - 1-2 weeks)**
1. **Component Splitting**: Break down large components
2. **React Query Integration**: Replace manual API state management
3. **Skeleton Loading**: Improve loading states
4. **Fix TODOs**: Address existing technical debt

#### **Phase 2 (Short-term - 2-4 weeks)**
1. **Search & Filtering**: Add comprehensive search functionality
2. **Performance Optimization**: Memoization and code splitting
3. **Mobile Optimization**: Improve mobile experience
4. **Error Handling**: Standardize error states

#### **Phase 3 (Medium-term - 1-2 months)**
1. **Real-time Updates**: Live fixture updates
2. **Advanced Features**: Favorites, prediction confidence
3. **Analytics Integration**: User behavior tracking
4. **Testing Suite**: Comprehensive test coverage

### **📋 Specific Code Issues to Address**

1. **Line 61 TODO**: Fix date collapse logic to work with selected date
2. **Duplicate Grouping Logic**: Consolidate `groupByDate` and `groupByLeague` functions
3. **Error Boundaries**: Add proper error boundaries for each section
4. **API Response Handling**: Standardize how API responses are processed
5. **State Management**: Reduce prop drilling with better state management

Would you like me to start implementing any of these enhancements? I'd recommend beginning with **Phase 1** items as they provide the most immediate value and set the foundation for future improvements.