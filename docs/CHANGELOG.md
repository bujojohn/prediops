# Changelog

All notable changes to Prediops will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2024-12-19

### Added
- **ValueBet Feature**: Added ValueBet indicators to fixtures with color-coded states
- **Rich Tooltips**: Enhanced ValueBet tooltips with detailed explanations and betting data
- **User Settings**: Added toggle for detailed ValueBet explanations in tooltips
- **Performance Optimizations**: Implemented component memoization and lazy loading
- **Sidebar Enhancements**: Restored full sidebar functionality with immediate loading skeleton
- **League Loading**: Fixed league loading functionality when expanding countries in sidebar

### Changed
- **API Include Parameters**: Updated all API calls to use correct include parameters
- **Mobile UI**: Improved mobile responsiveness for ValueBet icons and settings
- **Search Functionality**: Enhanced search with proper filtering and results display

### Fixed
- **Venue API Issues**: Removed venue include parameter causing data fetching errors
- **Invalid Include Parameters**: Fixed predictions.market and predictions.outcomes usage
- **Sidebar Loading**: Fixed sidebar appearing after page load with immediate skeleton
- **League Expansion**: Fixed league loading when expanding countries in sidebar
- **Mobile Layout**: Improved mobile layout for display settings and ValueBet icons

### Technical
- **API Configuration**: Updated all sportmonks API calls with valid include parameters
- **Type Safety**: Enhanced TypeScript types for ValueBet and prediction data
- **Error Handling**: Improved error handling for API calls with subscription limitations
- **Performance**: Added component memoization and optimization strategies

## [2.6.1] - 2024-12-18

### Fixed
- **Mobile Improvements**: Enhanced mobile layout for display settings
- **Icon Issues**: Fixed missing InfoOff icon import error

## [2.6.0] - 2024-12-18

### Added
- **ValueBet Feature**: Initial implementation with dollar icons and color states
- **Tooltip System**: Basic tooltips for ValueBet state explanations
- **Display Settings**: User toggle for ValueBet explanations

### Technical
- **API Integration**: Added ValueBet API endpoints and hooks
- **Schema Validation**: Added ValueBet schema validation
- **Component Architecture**: Created reusable ValueBet components

## [2.5.1] - 2024-12-17

### Added
- **Sidebar Enhancements**: Added favorite icons, country links, and search functionality
- **Region Support**: Added distinction between countries and regions with badges
- **Count System**: Added fixture count badges with automatic expiry
- **Performance**: Implemented lazy loading and virtualization for sidebar

### Fixed
- **Accordion Label**: Removed unnecessary "accordion" label from sidebar
- **Region Grouping**: Proper grouping of countries and regions in separate sections

## Previous Versions

For earlier versions, see git history and previous documentation.

---

## Migration Notes

### Version 2.7.0
- **API Changes**: Update any custom API calls to remove venue include parameters
- **ValueBet**: New ValueBet icons will appear automatically on fixtures
- **Settings**: Users can toggle ValueBet explanations in display settings

### Version 2.6.0
- **ValueBet**: New feature requires no migration, appears automatically
- **Settings**: New display settings available in user preferences

### Version 2.5.1
- **Sidebar**: Enhanced sidebar functionality with new features
- **Favorites**: User favorites are preserved across sessions
