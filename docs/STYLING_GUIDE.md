# Prediops Styling Guide

## Overview
This guide documents the enhanced styling system for Prediops, including CSS variables, utility classes, and component patterns.

## CSS Variables System

### Light Theme Colors
```css
--background: oklch(1 0 0)           /* Pure white */
--foreground: oklch(0.145 0 0)       /* Near black */
--primary: oklch(0.205 0 0)          /* Dark gray */
--secondary: oklch(0.97 0 0)         /* Light gray */
--muted: oklch(0.97 0 0)             /* Light gray */
--accent: oklch(0.97 0 0)            /* Light gray */
--destructive: oklch(0.577 0.245 27.325) /* Red */
--border: oklch(0.922 0 0)           /* Light border */
--input: oklch(0.922 0 0)            /* Input background */
--ring: oklch(0.708 0 0)             /* Focus ring */
```

### Dark Theme Colors
```css
--background: oklch(0.145 0 0)       /* Dark background */
--foreground: oklch(0.985 0 0)       /* Light text */
--primary: oklch(0.922 0 0)          /* Light primary */
--secondary: oklch(0.269 0 0)        /* Dark secondary */
--muted: oklch(0.269 0 0)            /* Dark muted */
--accent: oklch(0.269 0 0)           /* Dark accent */
--destructive: oklch(0.704 0.191 22.216) /* Dark red */
--border: oklch(1 0 0 / 10%)         /* Transparent border */
--input: oklch(1 0 0 / 15%)          /* Transparent input */
--ring: oklch(0.551 0.027 264.364)   /* Blue focus ring */
```

### Sidebar Colors
```css
--sidebar: oklch(0.985 0 0)          /* Sidebar background */
--sidebar-foreground: oklch(0.145 0 0) /* Sidebar text */
--sidebar-primary: oklch(0.205 0 0)  /* Sidebar primary */
--sidebar-accent: oklch(0.97 0 0)    /* Sidebar accent */
--sidebar-border: oklch(0.922 0 0)   /* Sidebar border */
--sidebar-ring: oklch(0.708 0 0)     /* Sidebar focus ring */
```

### Chart Colors
```css
--chart-1: oklch(0.646 0.222 41.116) /* Chart color 1 */
--chart-2: oklch(0.6 0.118 184.704)  /* Chart color 2 */
--chart-3: oklch(0.398 0.07 227.392) /* Chart color 3 */
--chart-4: oklch(0.828 0.189 84.429) /* Chart color 4 */
--chart-5: oklch(0.769 0.188 70.08)  /* Chart color 5 */
```

## Component Classes

### Card Styles
```css
.card-hover          /* Hover effect with shadow and scale */
.glass               /* Glass morphism effect */
```

### Status Indicators
```css
.status-live         /* Red styling for live matches */
.status-finished     /* Green styling for finished matches */
.status-scheduled    /* Blue styling for scheduled matches */
```

### Prediction Markets
```css
.prediction-button           /* Base prediction button */
.prediction-button.active    /* Active prediction button */
```

### Team and Match Elements
```css
.team-name           /* Team name with hover effect */
.score-display       /* Bold score display */
.league-info         /* League information styling */
```

## Utility Classes

### Animation Utilities
```css
.animate-fade-in     /* Fade in animation */
.animate-slide-up    /* Slide up animation */
.animate-slide-down  /* Slide down animation */
```

### Text Utilities
```css
.text-balance        /* Balanced text wrapping */
.text-gradient       /* Gradient text effect */
.text-shadow         /* Text shadow */
.gradient-text       /* Primary gradient text */
```

### Layout Utilities
```css
.container-padding   /* Responsive container padding */
.section-spacing     /* Responsive section spacing */
.scrollbar-hide      /* Hide scrollbars */
```

### Interactive Utilities
```css
.interactive         /* Hover and active scale effects */
.focus-ring          /* Consistent focus ring */
.loading-pulse       /* Loading animation */
```

## Usage Examples

### Card with Hover Effect
```jsx
<div className="card-hover bg-card p-6 rounded-lg border">
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Status Badge
```jsx
<span className="status-live px-2 py-1 rounded-full text-xs font-medium">
  Live
</span>
```

### Prediction Button
```jsx
<button className="prediction-button">
  <span>1</span>
  <span>45%</span>
</button>
```

### Team Display
```jsx
<div className="flex items-center gap-3">
  <img src="/team-logo.png" alt="Team" className="w-8 h-8" />
  <span className="team-name">Team Name</span>
  <span className="score-display">2</span>
</div>
```

### Loading State
```jsx
<div className="loading-pulse w-full h-32 rounded-lg"></div>
```

### Gradient Text
```jsx
<h1 className="gradient-text text-4xl font-bold">
  Prediops
</h1>
```

## Best Practices

### 1. Use Semantic Colors
Always use CSS variables for colors to maintain consistency:
```jsx
// ✅ Good
<div className="bg-card text-card-foreground">

// ❌ Avoid
<div className="bg-white text-black">
```

### 2. Responsive Design
Use responsive utilities for different screen sizes:
```jsx
<div className="container-padding section-spacing">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Content */}
  </div>
</div>
```

### 3. Accessibility
Always include focus states and proper contrast:
```jsx
<button className="focus-ring interactive">
  Click me
</button>
```

### 4. Animation Performance
Use transform and opacity for smooth animations:
```jsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

### 5. Dark Mode Support
All components automatically support dark mode through CSS variables:
```jsx
// No additional code needed - dark mode works automatically
<div className="bg-card border-border">
  <p className="text-foreground">Content</p>
</div>
```

## Customization

### Adding New Colors
1. Add CSS variables to `:root` and `.dark`
2. Update `tailwind.config.ts` with color mappings
3. Use in components with Tailwind classes

### Adding New Components
1. Create component classes in `@layer components`
2. Use semantic naming conventions
3. Include hover and focus states
4. Test in both light and dark modes

### Adding New Utilities
1. Create utility classes in `@layer utilities`
2. Use Tailwind's `@apply` directive when possible
3. Keep utilities focused and reusable

## Browser Support

- **Modern Browsers**: Full support for all features
- **CSS Variables**: IE11+ (with polyfill)
- **OKLCH Colors**: Chrome 111+, Firefox 113+, Safari 16.4+
- **CSS Grid**: All modern browsers
- **Flexbox**: All modern browsers

## Performance Considerations

- CSS variables are performant and cached
- Animations use GPU acceleration
- Minimal CSS bundle size with Tailwind
- Optimized for mobile devices

## Troubleshooting

### Colors Not Updating
- Check if CSS variables are properly defined
- Ensure Tailwind config includes color mappings
- Verify dark mode class is applied

### Animations Not Working
- Check if animation classes are applied
- Verify keyframes are defined
- Ensure no conflicting CSS

### Responsive Issues
- Use responsive prefixes (sm:, md:, lg:, xl:)
- Test on actual devices
- Check viewport meta tag
