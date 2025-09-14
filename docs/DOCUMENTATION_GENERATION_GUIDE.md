# Documentation Generation Guide

## Overview

Prediops includes a comprehensive documentation generation system that can create both **developer documentation** and **user-facing documentation** for your website. This guide explains how to use and extend these tools.

## Available Scripts

### Basic Documentation Generation
```bash
npm run docs:generate
```
- Generates TypeDoc documentation
- Creates component library docs
- Generates API reference
- Creates architecture documentation

### Enhanced Documentation Generation
```bash
npm run docs:generate-enhanced
npm run docs:user  # Alias for the same command
```
- Generates user-facing documentation
- Creates enhanced developer docs
- Includes FAQ and user guides
- Better organized output structure

### Other Documentation Commands
```bash
npm run docs:typedoc      # Generate TypeDoc only
npm run docs:storybook    # Start Storybook dev server
npm run docs:build-storybook  # Build Storybook
npm run docs:serve        # Serve generated docs locally
npm run docs:clean        # Clean generated documentation
```

## Documentation Types

### 1. Developer Documentation

#### Purpose
- Technical reference for developers
- API documentation
- Component library
- Architecture overview

#### Generated Files
- `docs/generated/api-reference-enhanced.md`
- `docs/generated/component-library-enhanced.md`
- `docs/generated/architecture.md`
- `docs/generated/typedoc/` (TypeDoc output)

#### Usage
```bash
# Generate all developer docs
npm run docs:generate-enhanced

# Serve locally for review
npm run docs:serve
# Visit http://localhost:8080
```

### 2. User-Facing Documentation

#### Purpose
- End-user guides and tutorials
- FAQ and help documentation
- Feature explanations
- Getting started guides

#### Generated Files
- `docs/generated/user/USER_GUIDE.md`
- `docs/generated/user/FAQ.md`
- `docs/generated/user/FEATURES.md`

#### Usage
```bash
# Generate user documentation
npm run docs:user

# The generated files can be:
# 1. Copied to your website's help section
# 2. Integrated into your app's help system
# 3. Published as standalone documentation
```

## Best Practices

### 1. For Developer Documentation

#### Keep Code Examples Updated
- Ensure code examples match current implementation
- Update API endpoints when they change
- Maintain TypeScript examples with current types

#### Document Breaking Changes
- Update API documentation when endpoints change
- Document deprecated features
- Provide migration guides

#### Include Performance Notes
- Document component performance characteristics
- Note when to use memoization
- Explain lazy loading strategies

### 2. For User-Facing Documentation

#### Write for Your Audience
- Use simple, clear language
- Avoid technical jargon
- Include visual cues and examples
- Focus on benefits, not features

#### Keep Content Fresh
- Update documentation when features change
- Remove outdated information
- Add new FAQ entries based on user feedback

#### Make it Accessible
- Use clear headings and structure
- Include alt text for images
- Ensure good contrast and readability
- Support screen readers

### 3. Integration with Website

#### Option 1: Static Documentation Site
```bash
# Generate docs
npm run docs:user

# Copy to website directory
cp -r docs/generated/user/* /path/to/website/help/

# Commit and deploy
git add .
git commit -m "Update user documentation"
git push
```

#### Option 2: Dynamic Integration
```typescript
// In your Next.js app
import { readFileSync } from 'fs';
import { join } from 'path';

export async function getHelpContent(page: string) {
  const filePath = join(process.cwd(), 'docs/generated/user', `${page}.md`);
  return readFileSync(filePath, 'utf8');
}

// Usage in a help page component
export default async function HelpPage({ params }: { params: { slug: string } }) {
  const content = await getHelpContent(params.slug);
  return <MarkdownContent content={content} />;
}
```

#### Option 3: API Integration
```typescript
// Create API route to serve documentation
// app/api/docs/[page]/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { page: string } }
) {
  try {
    const filePath = join(process.cwd(), 'docs/generated/user', `${params.page}.md`);
    const content = readFileSync(filePath, 'utf8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Documentation not found' }, { status: 404 });
  }
}
```

## Customizing Documentation Generation

### 1. Adding New User Documentation

Edit `scripts/generate-enhanced-docs.js`:

```javascript
// Add new documentation function
function generateCustomUserDocs() {
  console.log('📝 Generating custom user documentation...');
  
  const customDoc = `# Custom Documentation

Your custom content here...
`;

  fs.writeFileSync(path.join(config.userDocsDir, 'CUSTOM.md'), customDoc);
  console.log('✅ Custom documentation generated');
}

// Add to main function
function main() {
  // ... existing code ...
  generateCustomUserDocs();
}
```

### 2. Modifying Existing Documentation

#### Update User Guide
- Edit the `userGuide` variable in `generateUserDocs()` function
- Add new sections or modify existing content
- Update version numbers and dates

#### Update FAQ
- Edit the `faq` variable in `generateUserDocs()` function
- Add new questions based on user feedback
- Remove outdated questions

#### Update Feature Overview
- Edit the `features` variable in `generateUserDocs()` function
- Add new features as they're released
- Update descriptions to match current functionality

### 3. Adding New Developer Documentation

#### Component Documentation
```javascript
function generateCustomComponentDocs() {
  // Scan for specific components
  const customComponents = [
    'ValueBetIcon',
    'PredictionMarkets',
    'Sidebar'
  ];
  
  customComponents.forEach(component => {
    // Generate specific documentation for each component
  });
}
```

#### API Documentation
```javascript
function generateCustomApiDocs() {
  // Add custom API documentation
  const customApiDoc = `# Custom API Documentation

## New Endpoints
- GET /api/custom/endpoint
- POST /api/custom/data

## Custom Features
- Feature 1
- Feature 2
`;

  fs.writeFileSync(path.join(config.outputDir, 'custom-api.md'), customApiDoc);
}
```

## Automation and CI/CD

### 1. GitHub Actions Integration

Create `.github/workflows/docs.yml`:

```yaml
name: Generate Documentation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate documentation
      run: npm run docs:generate-enhanced
    
    - name: Upload documentation
      uses: actions/upload-artifact@v3
      with:
        name: documentation
        path: docs/generated/
    
    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs/generated
```

### 2. Pre-commit Hooks

Add to `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run docs:generate && git add docs/generated/"
    }
  }
}
```

### 3. Scheduled Updates

```yaml
# .github/workflows/scheduled-docs.yml
name: Scheduled Documentation Update

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday at midnight

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Generate documentation
      run: npm run docs:generate-enhanced
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add docs/generated/
        git commit -m "Auto-update documentation" || exit 0
        git push
```

## Publishing Documentation

### 1. GitHub Pages
```bash
# Generate docs
npm run docs:generate-enhanced

# Push to gh-pages branch
git subtree push --prefix docs/generated origin gh-pages
```

### 2. Netlify
```bash
# Add to netlify.toml
[build]
  command = "npm run docs:generate-enhanced && npm run build"
  publish = "docs/generated"
```

### 3. Vercel
```bash
# Add to vercel.json
{
  "builds": [
    {
      "src": "docs/generated/**/*",
      "use": "@vercel/static"
    }
  ]
}
```

## Maintenance

### Regular Tasks

1. **Weekly**: Review and update FAQ based on user feedback
2. **Monthly**: Update feature documentation with new releases
3. **Quarterly**: Review and refresh all documentation for accuracy
4. **As needed**: Update API documentation when endpoints change

### Quality Checklist

- [ ] All code examples work and are up-to-date
- [ ] Screenshots and images are current
- [ ] Links are working and point to correct pages
- [ ] Version numbers match current release
- [ ] FAQ covers common user questions
- [ ] User guide covers all major features
- [ ] API documentation includes all endpoints
- [ ] Component documentation includes all props

## Troubleshooting

### Common Issues

#### Script Won't Run
```bash
# Check Node.js version
node --version  # Should be 18+

# Check if type: "module" is in package.json
cat package.json | grep "type"

# Try running directly
node scripts/generate-enhanced-docs.js
```

#### Missing Dependencies
```bash
# Install TypeDoc if missing
npm install --save-dev typedoc

# Install other dev dependencies
npm install --save-dev @types/node
```

#### Permission Issues
```bash
# Fix file permissions (Linux/Mac)
chmod +x scripts/generate-enhanced-docs.js

# Check directory permissions
ls -la docs/
```

### Getting Help

1. Check the console output for specific error messages
2. Verify all dependencies are installed
3. Ensure Node.js version compatibility
4. Check file permissions and directory structure

---

**Last Updated**: ${new Date().toLocaleDateString()}
**Version**: 2.7.0
