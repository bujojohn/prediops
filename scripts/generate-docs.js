#!/usr/bin/env node

/**
 * Documentation Generation Script
 * 
 * This script generates comprehensive documentation for the Prediops codebase
 * including API docs, component docs, and architecture diagrams.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const config = {
  outputDir: './docs/generated',
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
 * Generate TypeDoc documentation
 */
function generateTypeDoc() {
  console.log('📚 Generating TypeDoc documentation...');
  
  try {
    execSync('npx typedoc --out ./docs/generated/typedoc --entryPoints ./lib --entryPoints ./app --exclude "**/*.test.*" --exclude "**/*.spec.*"', {
      stdio: 'inherit'
    });
    console.log('✅ TypeDoc documentation generated');
  } catch (error) {
    console.error('❌ TypeDoc generation failed:', error.message);
  }
}

/**
 * Generate component documentation
 */
function generateComponentDocs() {
  console.log('🧩 Generating component documentation...');
  
  const componentsDir = './app/components';
  const componentDocs = [];
  
  function scanDirectory(dir, relativePath = '') {
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
  
  // Generate component index
  const componentIndex = `# Component Library

## Overview
This section contains documentation for all React components in the Prediops application.

## Components

${componentDocs.map(comp => `- [${comp.name}](./components/${comp.path})`).join('\n')}

## Usage
Each component includes:
- Props documentation
- Usage examples
- Styling guidelines
- Accessibility notes

## Contributing
When adding new components:
1. Include JSDoc comments
2. Add usage examples
3. Document all props
4. Include accessibility notes
`;

  fs.writeFileSync('./docs/generated/component-library.md', componentIndex);
  console.log('✅ Component documentation generated');
}

/**
 * Generate API documentation
 */
function generateApiDocs() {
  console.log('🔌 Generating API documentation...');
  
  const apiDir = './app/api';
  const apiDocs = [];
  
  function scanApiDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanApiDirectory(fullPath, path.join(relativePath, item));
      } else if (item === 'route.ts') {
        const endpointPath = relativePath.replace(/\\/g, '/');
        apiDocs.push({
          path: endpointPath,
          fullPath: fullPath
        });
      }
    });
  }
  
  scanApiDirectory(apiDir);
  
  // Generate API index
  const apiIndex = `# API Reference

## Overview
This section contains documentation for all API endpoints in the Prediops application.

## Endpoints

${apiDocs.map(api => `- [${api.path}](./api/${api.path})`).join('\n')}

## Authentication
All API endpoints require proper authentication headers.

## Rate Limiting
API calls are rate limited to prevent abuse.

## Error Handling
All endpoints return consistent error responses.

## Contributing
When adding new endpoints:
1. Include JSDoc comments
2. Document request/response schemas
3. Add error handling
4. Include examples
`;

  fs.writeFileSync('./docs/generated/api-reference.md', apiIndex);
  console.log('✅ API documentation generated');
}

/**
 * Generate architecture diagrams
 */
function generateArchitectureDocs() {
  console.log('🏗️ Generating architecture documentation...');
  
  const architectureDoc = `# System Architecture

## Overview
Prediops is built using Next.js 14 with the App Router, TypeScript, and Tailwind CSS.

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Query**: Data fetching and caching

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **SportMonks API**: Football data provider
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeDoc**: Documentation generation
- **Storybook**: Component development

## Architecture Diagram

\`\`\`mermaid
graph TB
    A[User Interface] --> B[Next.js App Router]
    B --> C[API Routes]
    C --> D[SportMonks API]
    B --> E[React Components]
    E --> F[Context Providers]
    E --> G[Custom Hooks]
    F --> H[State Management]
    G --> I[Data Fetching]
    I --> C
\`\`\`

## Data Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Component
    participant API as API Route
    participant SM as SportMonks API
    
    U->>UI: User Action
    UI->>API: API Request
    API->>SM: External API Call
    SM-->>API: Data Response
    API-->>UI: Processed Data
    UI-->>U: Updated UI
\`\`\`

## Component Architecture

\`\`\`mermaid
graph TD
    A[App Layout] --> B[Navigation]
    A --> C[Main Content]
    C --> D[Page Components]
    D --> E[Feature Components]
    E --> F[UI Components]
    F --> G[Base Components]
\`\`\`

## File Structure

\`\`\`
app/
├── api/                 # API routes
├── components/          # React components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── (routes)/           # Page routes
lib/
├── api/               # API utilities
├── hooks/             # Shared hooks
├── stores/            # State management
├── utils/             # Utility functions
├── validation/        # Schema validation
docs/                  # Documentation
schemas/               # TypeScript schemas
\`\`\`

## Key Design Decisions

### 1. App Router vs Pages Router
- **Decision**: App Router
- **Rationale**: Better performance, improved developer experience, future-proof

### 2. TypeScript
- **Decision**: Strict TypeScript
- **Rationale**: Type safety, better developer experience, fewer runtime errors

### 3. Tailwind CSS
- **Decision**: Utility-first CSS
- **Rationale**: Rapid development, consistent design, small bundle size

### 4. React Query
- **Decision**: Data fetching library
- **Rationale**: Caching, background updates, error handling

## Performance Considerations

### 1. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### 2. Caching Strategy
- React Query for API caching
- Next.js built-in caching
- Browser caching for static assets

### 3. Bundle Optimization
- Tree shaking for unused code
- Dynamic imports for large libraries
- Image optimization with Next.js

## Security Considerations

### 1. API Security
- Input validation with Zod
- Rate limiting on API routes
- Secure headers configuration

### 2. Data Protection
- No sensitive data in client-side code
- Environment variables for secrets
- Secure API key management

## Monitoring & Observability

### 1. Error Tracking
- Error boundaries for React components
- API error logging
- User error reporting

### 2. Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- API response time tracking

## Deployment Architecture

\`\`\`mermaid
graph TB
    A[GitHub Repository] --> B[CI/CD Pipeline]
    B --> C[Build Process]
    C --> D[Deployment]
    D --> E[Production Environment]
    E --> F[CDN]
    F --> G[Users]
\`\`\`

## Future Considerations

### 1. Scalability
- Microservices architecture
- Database optimization
- CDN implementation

### 2. Features
- Real-time updates
- Advanced analytics
- Mobile app development

### 3. Performance
- Server-side rendering optimization
- Edge computing
- Advanced caching strategies
`;

  fs.writeFileSync('./docs/generated/architecture.md', architectureDoc);
  console.log('✅ Architecture documentation generated');
}

/**
 * Generate main documentation index
 */
function generateMainIndex() {
  console.log('📋 Generating main documentation index...');
  
  const mainIndex = `# Prediops Documentation

## 🚀 Quick Start
- [Getting Started](./README.md)
- [Architecture Overview](./generated/architecture.md)
- [Development Setup](./IMMEDIATE_START_GUIDE.md)

## 📚 Technical Reference
- [API Reference](./generated/api-reference.md)
- [Component Library](./generated/component-library.md)
- [TypeDoc Documentation](./generated/typedoc/)

## 🎯 Feature Documentation
- [Prediction System](./PREDICTION_SYSTEM_DOCUMENTATION.md)
- [ValueBet Feature](./VALUEBET_FEATURE.md)
- [SportMonks Integration](./SPORTMONKS_API_ANALYSIS.md)

## 🔧 Development
- [Technical Guidelines](./TECHNICAL_GUIDELINES.md)
- [Styling Guide](./STYLING_GUIDE.md)
- [Testing Strategy](./generated/testing.md)

## 📈 Planning
- [Post-Launch Expansion](./POST_LAUNCH_EXPANSION_PLAN.md)
- [Documentation Strategy](./DOCUMENTATION_STRATEGY.md)

---

**Last Generated**: ${new Date().toISOString()}
**Version**: 1.0.0
`;

  fs.writeFileSync('./docs/generated/README.md', mainIndex);
  console.log('✅ Main documentation index generated');
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting documentation generation...');
  
  // Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  // Generate all documentation
  generateArchitectureDocs();
  generateComponentDocs();
  generateApiDocs();
  generateTypeDoc();
  generateMainIndex();
  
  console.log('✅ Documentation generation completed!');
  console.log(`📁 Output directory: ${config.outputDir}`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateTypeDoc,
  generateComponentDocs,
  generateApiDocs,
  generateArchitectureDocs,
  generateMainIndex
};
