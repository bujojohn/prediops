# Database Deployment Strategy for GitHub → Coolify CI/CD

## Overview

This document outlines how to safely introduce database schema changes (like adding slug columns) in a CI/CD pipeline that runs from GitHub to Coolify.

## Current Architecture

```
GitHub Repository → GitHub Actions → Coolify → Production Server
```

## Database Migration Strategy

### 1. Database Migration Files

#### Create Migration Directory Structure
```
prisma/
├── migrations/
│   ├── 20240115000000_add_slug_columns/
│   │   ├── migration.sql
│   │   └── README.md
│   ├── 20240115000001_populate_slugs/
│   │   ├── migration.sql
│   │   └── README.md
│   └── 20240115000002_add_slug_indexes/
│       ├── migration.sql
│       └── README.md
├── schema.prisma
└── seed.ts
```

#### Migration 1: Add Slug Columns
```sql
-- prisma/migrations/20240115000000_add_slug_columns/migration.sql
-- Add slug columns to existing tables

ALTER TABLE teams ADD COLUMN slug VARCHAR(255);
ALTER TABLE countries ADD COLUMN slug VARCHAR(255);
ALTER TABLE leagues ADD COLUMN slug VARCHAR(255);
ALTER TABLE fixtures ADD COLUMN slug VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN teams.slug IS 'URL-friendly slug for teams';
COMMENT ON COLUMN countries.slug IS 'URL-friendly slug for countries';
COMMENT ON COLUMN leagues.slug IS 'URL-friendly slug for leagues';
COMMENT ON COLUMN fixtures.slug IS 'URL-friendly slug for fixtures';
```

#### Migration 2: Populate Slugs
```sql
-- prisma/migrations/20240115000001_populate_slugs/migration.sql
-- Populate slugs for existing data

-- Teams
UPDATE teams 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Countries
UPDATE countries 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Leagues
UPDATE leagues 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, 'UEFA ', '', 'g'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Handle duplicate slugs
WITH duplicates AS (
  SELECT slug, COUNT(*) as count
  FROM teams
  WHERE slug IS NOT NULL
  GROUP BY slug
  HAVING COUNT(*) > 1
)
UPDATE teams 
SET slug = slug || '-' || id
WHERE slug IN (SELECT slug FROM duplicates);
```

#### Migration 3: Add Constraints and Indexes
```sql
-- prisma/migrations/20240115000002_add_slug_indexes/migration.sql
-- Add unique constraints and indexes

-- Add unique constraints
ALTER TABLE teams ADD CONSTRAINT teams_slug_unique UNIQUE (slug);
ALTER TABLE countries ADD CONSTRAINT countries_slug_unique UNIQUE (slug);
ALTER TABLE leagues ADD CONSTRAINT leagues_slug_unique UNIQUE (slug);
ALTER TABLE fixtures ADD CONSTRAINT fixtures_slug_unique UNIQUE (slug);

-- Add indexes for performance
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_countries_slug ON countries(slug);
CREATE INDEX idx_leagues_slug ON leagues(slug);
CREATE INDEX idx_fixtures_slug ON fixtures(slug);

-- Add NOT NULL constraints after populating
ALTER TABLE teams ALTER COLUMN slug SET NOT NULL;
ALTER TABLE countries ALTER COLUMN slug SET NOT NULL;
ALTER TABLE leagues ALTER COLUMN slug SET NOT NULL;
ALTER TABLE fixtures ALTER COLUMN slug SET NOT NULL;
```

### 2. Prisma Schema Updates

#### Updated Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or your database type
  url      = env("DATABASE_URL")
}

model Team {
  id       Int     @id @default(autoincrement())
  name     String
  slug     String  @unique
  // ... other existing fields
  
  @@map("teams")
}

model Country {
  id       Int     @id @default(autoincrement())
  name     String
  slug     String  @unique
  // ... other existing fields
  
  @@map("countries")
}

model League {
  id       Int     @id @default(autoincrement())
  name     String
  slug     String  @unique
  // ... other existing fields
  
  @@map("leagues")
}

model Fixture {
  id       Int     @id @default(autoincrement())
  slug     String  @unique
  // ... other existing fields
  
  @@map("fixtures")
}
```

### 3. GitHub Actions Workflow

#### Database Migration Workflow
```yaml
# .github/workflows/database-migration.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'prisma/migrations/**'
      - 'prisma/schema.prisma'
  pull_request:
    branches: [main]
    paths:
      - 'prisma/migrations/**'
      - 'prisma/schema.prisma'

jobs:
  migrate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Prisma CLI
        run: npm install -g prisma
      
      - name: Validate migrations
        run: prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run migrations (staging)
        if: github.ref == 'refs/heads/main'
        run: prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      
      - name: Run migrations (production)
        if: github.ref == 'refs/heads/main'
        run: prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
      
      - name: Generate Prisma client
        run: prisma generate
      
      - name: Deploy to Coolify
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.COOLIFY_HOST }}
          username: ${{ secrets.COOLIFY_USER }}
          key: ${{ secrets.COOLIFY_SSH_KEY }}
          script: |
            cd /path/to/your/app
            git pull origin main
            npm ci
            npx prisma generate
            npm run build
            pm2 restart your-app
```

### 4. Environment-Specific Configuration

#### Environment Variables
```bash
# .env.example
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# .env.staging
DATABASE_URL="postgresql://username:password@staging-db:5432/staging_db"

# .env.production
DATABASE_URL="postgresql://username:password@production-db:5432/production_db"
```

#### Coolify Environment Configuration
```yaml
# coolify.yml
version: '3.8'

services:
  app:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - ./prisma:/app/prisma
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/migrations:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

### 5. Deployment Strategy

#### Phase 1: Preparation
```bash
# 1. Create migration files locally
npx prisma migrate dev --name add_slug_columns

# 2. Test migrations locally
npx prisma migrate dev

# 3. Generate Prisma client
npx prisma generate

# 4. Test application locally
npm run dev
```

#### Phase 2: Staging Deployment
```bash
# 1. Push to staging branch
git push origin staging

# 2. GitHub Actions runs migrations on staging
# 3. Test staging environment
# 4. Verify data integrity
```

#### Phase 3: Production Deployment
```bash
# 1. Merge to main branch
git push origin main

# 2. GitHub Actions runs migrations on production
# 3. Deploy application to Coolify
# 4. Monitor application health
```

### 6. Rollback Strategy

#### Rollback Migration
```sql
-- prisma/migrations/rollback_remove_slugs.sql
-- Rollback script to remove slug columns

-- Remove indexes first
DROP INDEX IF EXISTS idx_teams_slug;
DROP INDEX IF EXISTS idx_countries_slug;
DROP INDEX IF EXISTS idx_leagues_slug;
DROP INDEX IF EXISTS idx_fixtures_slug;

-- Remove unique constraints
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_slug_unique;
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_slug_unique;
ALTER TABLE leagues DROP CONSTRAINT IF EXISTS leagues_slug_unique;
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_slug_unique;

-- Remove columns
ALTER TABLE teams DROP COLUMN IF EXISTS slug;
ALTER TABLE countries DROP COLUMN IF EXISTS slug;
ALTER TABLE leagues DROP COLUMN IF EXISTS slug;
ALTER TABLE fixtures DROP COLUMN IF EXISTS slug;
```

#### Automated Rollback Workflow
```yaml
# .github/workflows/rollback.yml
name: Database Rollback

on:
  workflow_dispatch:
    inputs:
      migration_name:
        description: 'Migration name to rollback'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Prisma CLI
        run: npm install -g prisma
      
      - name: Rollback migration
        run: prisma migrate rollback
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
      
      - name: Deploy rolled back version
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.COOLIFY_HOST }}
          username: ${{ secrets.COOLIFY_USER }}
          key: ${{ secrets.COOLIFY_SSH_KEY }}
          script: |
            cd /path/to/your/app
            git pull origin main
            npm ci
            npx prisma generate
            npm run build
            pm2 restart your-app
```

### 7. Monitoring and Validation

#### Health Check Script
```typescript
// scripts/health-check.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function healthCheck() {
  try {
    // Check if slug columns exist and have data
    const teamsWithSlugs = await prisma.team.count({
      where: { slug: { not: null } }
    });
    
    const countriesWithSlugs = await prisma.country.count({
      where: { slug: { not: null } }
    });
    
    const leaguesWithSlugs = await prisma.league.count({
      where: { slug: { not: null } }
    });
    
    console.log(`Teams with slugs: ${teamsWithSlugs}`);
    console.log(`Countries with slugs: ${countriesWithSlugs}`);
    console.log(`Leagues with slugs: ${leaguesWithSlugs}`);
    
    // Check for duplicate slugs
    const duplicateTeams = await prisma.$queryRaw`
      SELECT slug, COUNT(*) as count
      FROM teams
      GROUP BY slug
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateTeams.length > 0) {
      throw new Error(`Duplicate team slugs found: ${JSON.stringify(duplicateTeams)}`);
    }
    
    console.log('✅ Health check passed');
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

healthCheck();
```

#### Post-Deployment Validation
```yaml
# .github/workflows/post-deployment-validation.yml
name: Post-Deployment Validation

on:
  workflow_run:
    workflows: ["Database Migration"]
    types: [completed]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run health check
        run: npm run health-check
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
      
      - name: Test API endpoints
        run: npm run test:api
        env:
          API_URL: ${{ secrets.PRODUCTION_API_URL }}
```

### 8. Best Practices

#### Migration Best Practices
1. **Always test migrations locally first**
2. **Use transactions for atomic changes**
3. **Create rollback scripts**
4. **Monitor migration performance**
5. **Backup database before major changes**

#### Deployment Best Practices
1. **Deploy to staging first**
2. **Use feature flags for gradual rollout**
3. **Monitor application health**
4. **Have rollback plan ready**
5. **Communicate changes to team**

#### Code Best Practices
1. **Handle slug generation gracefully**
2. **Add proper error handling**
3. **Implement caching for slug lookups**
4. **Add comprehensive logging**
5. **Write tests for slug functionality**

## Summary

This approach provides:
- ✅ **Safe database migrations** with proper rollback
- ✅ **Automated CI/CD integration** with GitHub Actions
- ✅ **Environment-specific deployments** (staging → production)
- ✅ **Health monitoring** and validation
- ✅ **Zero-downtime deployments** with proper planning

The key is to implement changes gradually, test thoroughly, and always have a rollback plan ready.
