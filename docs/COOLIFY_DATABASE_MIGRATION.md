# Coolify Database Migration Implementation

## Your Current Setup
```
GitHub Repository → GitHub Actions → Coolify → Production Server
```

## Step-by-Step Implementation

### 1. Create Migration Files

#### Create the migration directory structure
```bash
mkdir -p prisma/migrations/20240115000000_add_slug_columns
mkdir -p prisma/migrations/20240115000001_populate_slugs
mkdir -p prisma/migrations/20240115000002_add_constraints
```

#### Migration 1: Add Slug Columns
```sql
-- prisma/migrations/20240115000000_add_slug_columns/migration.sql
-- Add slug columns to existing tables

ALTER TABLE teams ADD COLUMN slug VARCHAR(255);
ALTER TABLE countries ADD COLUMN slug VARCHAR(255);
ALTER TABLE leagues ADD COLUMN slug VARCHAR(255);
ALTER TABLE fixtures ADD COLUMN slug VARCHAR(255);
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

-- Handle duplicate slugs by appending ID
UPDATE teams 
SET slug = slug || '-' || id
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
    FROM teams
    WHERE slug IS NOT NULL
  ) t WHERE rn > 1
);
```

#### Migration 3: Add Constraints and Indexes
```sql
-- prisma/migrations/20240115000002_add_constraints/migration.sql
-- Add unique constraints and indexes

-- Add indexes for performance
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_countries_slug ON countries(slug);
CREATE INDEX idx_leagues_slug ON leagues(slug);
CREATE INDEX idx_fixtures_slug ON fixtures(slug);

-- Add unique constraints
ALTER TABLE teams ADD CONSTRAINT teams_slug_unique UNIQUE (slug);
ALTER TABLE countries ADD CONSTRAINT countries_slug_unique UNIQUE (slug);
ALTER TABLE leagues ADD CONSTRAINT leagues_slug_unique UNIQUE (slug);
ALTER TABLE fixtures ADD CONSTRAINT fixtures_slug_unique UNIQUE (slug);

-- Add NOT NULL constraints
ALTER TABLE teams ALTER COLUMN slug SET NOT NULL;
ALTER TABLE countries ALTER COLUMN slug SET NOT NULL;
ALTER TABLE leagues ALTER COLUMN slug SET NOT NULL;
ALTER TABLE fixtures ALTER COLUMN slug SET NOT NULL;
```

### 2. Update Prisma Schema

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

### 3. Create GitHub Actions Workflow

```yaml
# .github/workflows/database-migration.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'prisma/migrations/**'
      - 'prisma/schema.prisma'
  workflow_dispatch:

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
      
      - name: Run migrations
        run: prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
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

### 4. Create Slug Resolution Utilities

```typescript
// lib/data/slug-resolver.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTeamIdBySlug(slug: string): Promise<number | null> {
  const team = await prisma.team.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  return team?.id || null;
}

export async function getCountryIdBySlug(slug: string): Promise<number | null> {
  const country = await prisma.country.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  return country?.id || null;
}

export async function getLeagueIdBySlug(slug: string): Promise<number | null> {
  const league = await prisma.league.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  return league?.id || null;
}

export async function getFixtureIdBySlug(slug: string): Promise<number | null> {
  const fixture = await prisma.fixture.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  return fixture?.id || null;
}
```

### 5. Update API Routes

```typescript
// app/api/teams/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTeamIdBySlug } from '@/lib/data/slug-resolver';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    // Resolve slug to ID
    const teamId = await getTeamIdBySlug(slug);
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // Fetch team data using ID
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        country: true,
        venue: true,
        // ... other relations
      }
    });
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 6. Update Page Components

```typescript
// app/teams/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getTeamIdBySlug } from '@/lib/data/slug-resolver';
import { generateTeamSlug } from '@/lib/utils/team-utils';

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  
  try {
    // Resolve slug to ID
    const teamId = await getTeamIdBySlug(slug);
    
    if (!teamId) {
      notFound();
    }
    
    // Fetch team data using ID
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        country: true,
        venue: true,
        // ... other relations
      }
    });
    
    if (!team) {
      notFound();
    }
    
    // Verify slug is still correct
    const currentSlug = generateTeamSlug(team);
    if (currentSlug !== slug) {
      // Redirect to correct slug
      redirect(`/teams/${currentSlug}`, { status: 301 });
    }
    
    return <TeamClient team={team} />;
  } catch (error) {
    console.error('Error fetching team:', error);
    notFound();
  }
}
```

### 7. Environment Variables for Coolify

#### Add to Coolify Environment Variables
```bash
# Database URL
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Prisma
PRISMA_GENERATE_DATAPROXY=false
```

### 8. Deployment Process

#### Step 1: Test Locally
```bash
# 1. Create migration files
npx prisma migrate dev --name add_slug_columns

# 2. Test migrations
npx prisma migrate dev

# 3. Generate Prisma client
npx prisma generate

# 4. Test application
npm run dev
```

#### Step 2: Deploy to Coolify
```bash
# 1. Commit and push changes
git add .
git commit -m "feat: add slug columns for SEO-friendly URLs"
git push origin main

# 2. GitHub Actions will:
#    - Run migrations on your database
#    - Generate Prisma client
#    - Deploy to Coolify
#    - Restart your application
```

### 9. Monitoring and Validation

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
    
    console.log(`✅ Teams with slugs: ${teamsWithSlugs}`);
    console.log(`✅ Countries with slugs: ${countriesWithSlugs}`);
    console.log(`✅ Leagues with slugs: ${leaguesWithSlugs}`);
    
    // Check for duplicate slugs
    const duplicateTeams = await prisma.$queryRaw`
      SELECT slug, COUNT(*) as count
      FROM teams
      GROUP BY slug
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateTeams.length > 0) {
      throw new Error(`❌ Duplicate team slugs found: ${JSON.stringify(duplicateTeams)}`);
    }
    
    console.log('✅ Health check passed - all slugs are unique');
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

healthCheck();
```

#### Add to package.json
```json
{
  "scripts": {
    "health-check": "tsx scripts/health-check.ts",
    "migrate": "prisma migrate deploy",
    "generate": "prisma generate"
  }
}
```

### 10. Rollback Plan

#### Rollback Migration
```sql
-- prisma/migrations/rollback_remove_slugs.sql
-- Remove slug columns if needed

-- Remove indexes
DROP INDEX IF EXISTS idx_teams_slug;
DROP INDEX IF EXISTS idx_countries_slug;
DROP INDEX IF EXISTS idx_leagues_slug;
DROP INDEX IF EXISTS idx_fixtures_slug;

-- Remove constraints
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

## Summary

This implementation provides:

1. **Safe Database Migrations**: Step-by-step approach with proper rollback
2. **Automated CI/CD**: GitHub Actions handles the deployment
3. **Coolify Integration**: Seamless deployment to your hosting
4. **Health Monitoring**: Validation scripts to ensure everything works
5. **Zero Downtime**: Gradual rollout with proper planning

The key is to:
- ✅ Test migrations locally first
- ✅ Use GitHub Actions for automated deployment
- ✅ Monitor the deployment process
- ✅ Have a rollback plan ready
- ✅ Validate data integrity after deployment

This approach ensures your database changes are deployed safely through your existing GitHub → Coolify pipeline!
