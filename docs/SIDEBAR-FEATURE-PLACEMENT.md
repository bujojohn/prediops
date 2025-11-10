
# 🧭 Sidebar Feature Placement – Version 2

This document outlines the finalized layout and sidebar structure for the MVP version of the football prediction website.

---

## ✅ Sidebar Contents (Current)

The sidebar now includes:

- 🔍 **Enhanced Search Input** – With scope selection (All, Countries, Leagues, Teams, Fixtures) and inline results.
- 🌍 **Countries, Top Leagues, Tournaments** – Collapsible sections with favorites support.
- 🛠️ **Unified Tools Section** – Shared tools across all sidebar variants:
  - ⭐ Favorites, 👁 Active, 📅 Today filters (with minimal count badges)
  - ↕️ Sorting (Name, Favorites; Fixtures optional per variant)
  - 🔄 Refresh and a Help modal with keyboard shortcuts
- 🧠 **Persisted Filters per Scope** – Favorites/Active/Today states remembered by scope.
- 📂 **Collapsible Sidebar** – Optimized for small screens.

---

## ✅ Top Navigation Bar Contents (MVP)

The top navigation bar will contain:

- 🖼️ **Logo / Brand** – "Prediops" with football icon
- 🏠 **Home Link** – Return to dashboard
- 🎯 **Predictions** – Link to predictions page
- 💰 **Value Bets** – Link to value bets page
- ⚽ **Live Matches** – Link to live matches page
- 🌗 **Dark Mode Toggle** – Theme switching
- 🙍 **User Profile/Login** – User authentication
- 🔔 **Notifications** – User notifications (future)

---

## ❌ Not in Sidebar

| Feature                | Recommended Location       | Reason                                                      |
|------------------------|----------------------------|-------------------------------------------------------------|
| 🌐 Country Selector    | Top Bar or Home Page       | Enables localized experiences                               |
| ⭐ Favorite Items       | User Dashboard/Profile     | Personalized content should be scoped to user context       |
| ⚖️ Legal Links (Terms) | Footer                     | Footer is the conventional place for legal information      |
| 🧪 API Test            | Development Only           | Should be removed from production navigation                |

---

## 🆕 What Changed Recently

- Introduced a unified tools system used by `SidebarOptimized`, `SidebarStatic`, and `SidebarWithTanStackQuery`.
- Added per-scope filter persistence via `useFilterPreferences` (stored in localStorage).
- Replaced alert-based help with a non-blocking `HelpModal` listing shortcuts.
- Added minimal count badges for filters (favorites/active/today). Static variant now computes real counts.
- Normalized styling and spacing to match the enhanced search component.

### Keyboard Shortcuts
- Ctrl/Cmd + K: Focus search
- Ctrl/Cmd + F: Toggle favorites
- Ctrl/Cmd + A: Toggle active
- Ctrl/Cmd + T: Toggle today
- Ctrl/Cmd + R: Refresh

### Developer Notes
- Unified tools live under `app/components/navigation/sidebar/tools/*`.
- Prefer reusing `FilterTools`, `SortControl`, `ActionButtons`, and `HelpModal` instead of custom UIs.
- Persisted filters are scoped by the current search scope string key.

---

## 🚫 Excluded from MVP (Reserved for Future Development)

- AI Confidence & Value Bet
- AI Success in H2H Predictions
- AI Betting Trends
- Any other AI-generated insights
- Advanced filtering and sorting options
- User preferences and settings
- Social features (sharing, comments)

These features are planned for post-MVP iterations once core features are validated and adopted.

---

## 🔖 Layout Summary

| Layout Area          | Key Elements                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Sidebar**          | Search bar, country list, quick filters, collapsible behavior, navigation links |
| **Top Navigation**   | Logo, main navigation links, dark mode toggle, user profile/login, notifications |
| **Main Content**     | Match listings, league content, team pages, prediction cards, dashboard widgets |
| **Footer**           | Terms of service, privacy policy, app version, social media links            |

---

## 📱 Responsive Design Considerations

- **Desktop**: Full sidebar with all features visible
- **Tablet**: Collapsible sidebar with hamburger menu
- **Mobile**: Bottom navigation bar with key features, sidebar accessible via menu

---

## 🎯 Implementation Priority

### Phase 1 (Current)
- ✅ Basic navigation structure (implemented)
- ✅ Core pages (Dashboard, Predictions, Value Bets, Live Matches)
- 🔄 Sidebar with countries list
- 🔄 Search functionality
- 🔄 Quick filters

### Phase 2 (Next)
- 🔄 Dark mode toggle
- 🔄 User authentication
- 🔄 Notifications system
- 🔄 Advanced filtering

### Phase 3 (Future)
- 🔄 AI-powered features
- 🔄 Social features
- 🔄 Advanced analytics
