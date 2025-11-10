# 📸 Screenshot Capture Guide

This guide explains how to capture screenshots of the sidebar features for documentation purposes.

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Capture screenshots (interactive mode):**
   ```bash
   npm run screenshots
   ```

3. **Capture screenshots (headless mode for CI/CD):**
   ```bash
   npm run screenshots:headless
   ```

## 📁 Output Location

Screenshots are saved to: `public/images/screenshots/`

- `enhanced-search.png` - Enhanced search with scope dropdown and inline results
- `sidebar-tools.png` - Unified tools section (filters, sort, actions)
- `help-modal.png` - Help modal showing keyboard shortcuts
- `sidebar-static-counts.png` - Static sidebar with real count badges

## 🛠️ Customization

### Modifying Screenshot Scripts

Edit the scripts in `scripts/` directory:

- `capture-screenshots.js` - Interactive mode with visible browser
- `capture-screenshots-headless.js` - Headless mode for automation

### Key Configuration Options

```javascript
// Viewport size
viewport: { width: 1920, height: 1080 }

// Image quality (higher = better quality, larger files)
deviceScaleFactor: 2

// Browser behavior
headless: false, // Set to true for headless mode
slowMo: 1000    // Delay between actions (milliseconds)
```

### Adding New Screenshots

1. Add a new screenshot capture section in the script:

```javascript
// 5. New Feature Screenshot
console.log('📸 Capturing new feature...');
await page.goto('http://localhost:3000/new-page', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ 
  path: path.join(SCREENSHOTS_DIR, 'new-feature.png'),
  fullPage: true
});
console.log('✅ New feature screenshot saved');
```

2. Update the README.md screenshots section with the new image path.

## 🎯 Best Practices

### Before Capturing

1. **Clean State**: Ensure the app is in a clean, default state
2. **Data Available**: Make sure there's sample data to display
3. **No Modals**: Close any open modals or overlays
4. **Consistent Viewport**: Use the same viewport size for consistency

### During Capture

1. **Wait for Loading**: Use `waitForTimeout()` to ensure content loads
2. **Check Visibility**: Verify elements are visible before interacting
3. **Handle Errors**: Wrap interactions in try-catch blocks
4. **Clean Up**: Close modals and reset state after capture

### After Capture

1. **Review Images**: Check that screenshots show the intended features
2. **Optimize Size**: Consider compressing images for web use
3. **Update Documentation**: Update README and docs with new images
4. **Version Control**: Commit screenshots to track UI changes

## 🔧 Troubleshooting

### Common Issues

**Screenshots are blank or incomplete:**
- Increase `waitForTimeout()` values
- Check that the development server is running
- Verify element selectors are correct

**Elements not found:**
- Update selectors in the script
- Add more specific data-testid attributes to components
- Use more generic selectors as fallbacks

**Poor image quality:**
- Increase `deviceScaleFactor` (2-3 recommended)
- Use higher viewport resolution
- Ensure elements are fully loaded before capture

### Debug Mode

Run with debug logging:

```javascript
// Add to script for debugging
await page.screenshot({ 
  path: path.join(SCREENSHOTS_DIR, 'debug-step.png'),
  fullPage: true
});
```

## 📋 Checklist

Before capturing screenshots:

- [ ] Development server is running (`npm run dev`)
- [ ] App loads without errors
- [ ] Sample data is available
- [ ] No console errors
- [ ] All features are accessible
- [ ] Screenshots directory exists

After capturing:

- [ ] All 4 screenshots were created
- [ ] Images show the intended features
- [ ] File sizes are reasonable
- [ ] Images are clear and readable
- [ ] Documentation is updated

## 🚀 Automation

### GitHub Actions

Add to `.github/workflows/screenshots.yml`:

```yaml
name: Capture Screenshots
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: sleep 10
      - run: npm run screenshots:headless
      - uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: public/images/screenshots/
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run screenshots:headless
git add public/images/screenshots/
```

## 📚 Related Documentation

- [Sidebar Feature Placement](SIDEBAR-FEATURE-PLACEMENT.md)
- [Sidebar Tools Recommendations](SIDEBAR-TOOLS-RECOMMENDATIONS.md)
- [Main README](../README.md)
