# Playwright MCP Setup Guide

## ✅ Setup Complete

Playwright MCP has been added to your Cursor MCP configuration. You can now use browser automation directly through Cursor!

## 🚀 What You Can Do

### Interactive Testing
Ask Cursor to test your UI in natural language:
- "Test the sidebar filter badges on mobile viewport"
- "Validate keyboard navigation on the enhanced search"
- "Check if the unified tools section works correctly"
- "Test responsive design on different screen sizes"

### Accessibility Testing
- "Verify ARIA labels are correct on sidebar components"
- "Test screen reader compatibility"
- "Check keyboard navigation for all interactive elements"

### UI Validation
- "Capture screenshots of the sidebar with filters active"
- "Test search functionality with different scopes"
- "Validate filter persistence works correctly"

## 📋 Configuration

The Playwright MCP server is configured in `~/.cursor/mcp.json`:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

## 🔄 Next Steps

1. **Restart Cursor** - Close and reopen Cursor to load the new MCP server
2. **Start your dev server** - Make sure `npm run dev` is running on `localhost:3000`
3. **Try it out** - Ask Cursor to test specific UI features

## 💡 Example Queries

### Basic UI Testing
```
"Use Playwright MCP to navigate to localhost:3000 and test the sidebar search"
```

### Accessibility Testing
```
"Use Playwright MCP to validate accessibility of the sidebar components"
```

### Responsive Testing
```
"Use Playwright MCP to test the sidebar on mobile viewport (375x667)"
```

### Visual Validation
```
"Use Playwright MCP to capture a screenshot of the sidebar with filters active"
```

## 🎯 Use Cases for Your Project

Based on your current features:

1. **Sidebar Tools Section**
   - Test filter button interactions (Favorites, Active, Today)
   - Validate count badges display correctly
   - Test filter persistence across page reloads

2. **Enhanced Search**
   - Test search input with different scopes
   - Validate search results rendering
   - Test keyboard shortcuts (Ctrl+K, Esc)

3. **Navigation**
   - Test sidebar country/league navigation
   - Validate URL changes correctly
   - Test back/forward browser buttons

4. **Responsive Design**
   - Test mobile sidebar behavior
   - Validate filter controls on small screens
   - Test search on different viewports

## ⚙️ Advanced Configuration

You can customize Playwright MCP behavior with additional options:

```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "@playwright/mcp@latest",
      "--headless",
      "--viewport-size", "1920x1080",
      "--browser", "chromium"
    ]
  }
}
```

### Available Options
- `--headless` - Run browser in headless mode
- `--browser <browser>` - Choose browser (chromium, firefox, webkit)
- `--viewport-size <size>` - Set viewport (e.g., "375x667" for mobile)
- `--device <device>` - Emulate device (e.g., "iPhone 15")
- `--timeout-action <ms>` - Action timeout (default: 5000ms)
- `--timeout-navigation <ms>` - Navigation timeout (default: 60000ms)

## 🔗 Related Documentation

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Your Screenshot Scripts](docs/SCREENSHOTS.md)
- [Testing Guide](docs/TESTING_AND_DEPLOYMENT_GUIDE.md)

## 📝 Notes

- Playwright MCP uses the accessibility tree (not pixels) - perfect for accessibility testing
- Works alongside your existing Playwright scripts
- Great for quick validation during development
- Use regular Playwright tests for CI/CD and comprehensive coverage

---

**Status**: ✅ Configured and ready to use after Cursor restart

