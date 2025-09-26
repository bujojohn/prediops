# Prediops Brand Guidelines

## Logo Usage Guidelines

### Logo Files
The Prediops logo is available in multiple formats and sizes:

```
public/logo/
├── logo.svg              # Primary vector logo (light theme)
├── logo-dark.svg         # Dark theme variant
├── logo.png              # High-res PNG fallback
├── logo-dark.png         # Dark theme PNG fallback
├── favicon.ico           # 32x32 favicon
├── apple-touch-icon.png  # 180x180 iOS icon
├── icon-192.png          # 192x192 PWA icon
├── icon-512.png          # 512x512 PWA icon
└── manifest.json         # Web app manifest
```

### Logo Component Usage

The logo is implemented as a reusable React component with the following props:

```typescript
<Logo
  linkToHome={true}        // Make logo clickable (default: true)
  className=""             // Custom styling
  size="default"          // Size preset: 'sm' | 'default' | 'lg' | 'xl'
  showText={true}         // Show brand name (default: true)
  alt="Prediops Logo"     // Alt text for accessibility
  width={32}              // Custom width (overrides size)
  height={32}             // Custom height (overrides size)
/>
```

### Pre-built Variants

```typescript
// Logo with text (default)
<LogoWithText size="default" />

// Icon only (no text)
<LogoIcon size="default" />

// Sidebar variant (small with text)
<LogoSidebar />
```

### Size Guidelines

| Size | Dimensions | Use Case |
|------|------------|----------|
| `sm` | 24x24px | Sidebar, compact spaces |
| `default` | 32x32px | Navigation bars, headers |
| `lg` | 48x48px | Landing pages, hero sections |
| `xl` | 64x64px | Large displays, marketing |

### Theme Support

The logo automatically adapts to light/dark themes:
- **Light Theme**: Uses `logo.svg` (blue with yellow accents)
- **Dark Theme**: Uses `logo-dark.svg` (lighter blue with yellow accents)

### Accessibility

- All logo instances include proper `alt` text
- Logo links include `aria-label` for screen readers
- Sufficient color contrast in both themes
- Scalable SVG format for all screen sizes

### Implementation Locations

The logo is currently implemented in:

1. **Main Navigation** (`app/components/navigation/Navbar.tsx`)
   - Size: `default` (32x32px)
   - Shows text and icon
   - Links to homepage

2. **Sidebar** (`app/components/navigation/SidebarStatic.tsx`)
   - Size: `sm` (24x24px)
   - Shows text and icon
   - Links to homepage

### Color Palette

#### Light Theme
- **Primary Blue**: `#3B82F6`
- **Dark Blue**: `#1E40AF`
- **Accent Yellow**: `#FBBF24`
- **Yellow Border**: `#F59E0B`

#### Dark Theme
- **Primary Blue**: `#60A5FA`
- **Dark Blue**: `#3B82F6`
- **Accent Yellow**: `#FDE047`
- **Yellow Border**: `#FACC15`

### Best Practices

1. **Consistency**: Always use the Logo component, never static images
2. **Responsiveness**: Use appropriate size presets for different contexts
3. **Accessibility**: Never remove alt text or aria-labels
4. **Theme Support**: Let the component handle theme switching automatically
5. **Performance**: SVG format ensures crisp rendering at any size
6. **Fallback**: PNG fallbacks are included for SVG loading failures

### Customization

To modify the logo:
1. Update SVG files in `public/logo/`
2. Maintain the same viewBox (`0 0 32 32`)
3. Test in both light and dark themes
4. Update color values in both variants
5. Ensure accessibility standards are maintained

### Browser Support

- **SVG**: All modern browsers
- **PNG Fallback**: Legacy browser support
- **ICO**: Favicon support across all browsers
- **Web App Manifest**: PWA installation support
