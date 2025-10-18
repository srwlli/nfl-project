# Production Deployment Guide

## Overview

This guide covers deploying the NFL Stats Platform to production using Docker and cloud Supabase.

**Architecture:**
- Next.js application containerized with Docker
- Supabase cloud database (PostgreSQL 15+)
- Container orchestration with Docker Compose
- Health checks and auto-restart policies

---

## Prerequisites

Before deploying, ensure you have:

- [x] Docker installed (v20.10+)
- [x] Docker Compose installed (v2.0+)
- [x] Supabase cloud project created
- [x] Environment variables configured
- [x] Database migrations ready to run

---

## Step 1: Environment Configuration

### 1.1 Create Production Environment File

Copy the template and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

### 1.2 Configure Variables

Edit `.env.local` with your actual Supabase credentials:

```bash
# Required Variables
NEXT_PUBLIC_SUPABASE_URL=https://fuzouuxhxluqjmiyabal.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Never commit `.env.local` to git. This file contains sensitive credentials.

---

## Step 2: Database Setup

### 2.1 Run Migrations

The database needs to be initialized with the schema before the app can run.

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your cloud project
supabase link --project-ref fuzouuxhxluqjmiyabal

# Run all migrations
supabase db push
```

**Option B: Manual Migration via Supabase Dashboard**

1. Go to https://fuzouuxhxluqjmiyabal.supabase.co
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `20250101000000_initial_schema.sql`
   - `20250101000001_players_and_teams.sql`
   - `20250101000002_games_and_schedules.sql`
   - `20250101000003_stats_tables.sql`
   - `20250101000004_advanced_stats.sql`
   - `20250101000005_player_info.sql`
   - `20250101000006_team_info.sql`
   - `20250101000007_game_info.sql`
   - `20250101000008_indexes.sql`
   - `20250101000009_rls_policies.sql`

### 2.2 Verify Schema

After running migrations, verify all 41 tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- player_season_stats
- player_career_stats
- player_game_logs
- player_profiles
- player_bio
- player_awards
- player_career_timeline
- player_transactions
- teams
- team_season_stats
- team_rosters
- team_depth_charts
- team_coaching_staff
- team_history
- games
- game_schedules
- game_box_scores
- game_play_by_play
- game_drive_charts
- game_scoring_plays
- injuries
- news
- stadiums
- ...and 18 more

---

## Step 3: Build and Deploy with Docker

### 3.1 Update next.config.js

Ensure your `next.config.js` has standalone output enabled:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... other config
}

module.exports = nextConfig
```

### 3.2 Build the Docker Image

```bash
# Build the production image
docker-compose build

# This will:
# 1. Install dependencies (Stage 1: deps)
# 2. Build Next.js app (Stage 2: builder)
# 3. Create minimal runtime image (Stage 3: runner)
```

**Build time:** ~3-5 minutes depending on your machine

### 3.3 Start the Application

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 3.4 Verify Health

The app includes a health check that runs every 30 seconds:

```bash
# Check container status
docker ps

# You should see "healthy" in the STATUS column after ~40 seconds
```

Manual health check:

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T12:34:56.789Z",
  "database": "connected"
}
```

---

## Step 4: Create Health Check Endpoint

Create the health check API route:

**File:** `app/api/health/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test database connection
    const { error } = await supabase.from('teams').select('count').limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
```

---

## Step 5: Verify Deployment

### 5.1 Access the Application

Open your browser to:
```
http://localhost:3000
```

### 5.2 Test Database Connection

Navigate to a stats page or check the health endpoint to verify Supabase connectivity.

### 5.3 Monitor Logs

```bash
# Follow application logs
docker-compose logs -f app

# Check for errors
docker-compose logs app | grep -i error
```

---

## Container Management

### Start/Stop

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Restart

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
```

### View Logs

```bash
# All logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Rebuild

```bash
# Rebuild after code changes
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs app

# Common issues:
# - Missing environment variables
# - Port 3000 already in use
# - Build errors
```

### Health Check Failing

```bash
# Check if app is responding
curl http://localhost:3000/api/health

# Common causes:
# - Health check endpoint not implemented
# - Database connection issues
# - App not fully started (wait 40s)
```

### Database Connection Errors

```bash
# Verify environment variables are loaded
docker-compose exec app env | grep SUPABASE

# Test Supabase connectivity
curl https://fuzouuxhxluqjmiyabal.supabase.co/rest/v1/

# Common issues:
# - Wrong Supabase URL
# - Invalid API keys
# - RLS policies blocking queries
```

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use 8080 instead
```

---

## Production Deployment (Cloud)

When deploying to a cloud provider (AWS, GCP, Azure, DigitalOcean):

### Environment Variables

Set these in your hosting platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://fuzouuxhxluqjmiyabal.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NODE_ENV=production
PORT=3000
```

### Docker Registry

```bash
# Tag image
docker tag nfl-stats-app:latest your-registry/nfl-stats-app:latest

# Push to registry
docker push your-registry/nfl-stats-app:latest
```

### SSL/HTTPS

Configure your cloud provider's load balancer or reverse proxy for HTTPS.

### Scaling

To scale horizontally:

```bash
# Scale to 3 replicas
docker-compose up -d --scale app=3
```

Or use Kubernetes/ECS for advanced orchestration.

---

## Security Checklist

- [x] `.env.local` is in `.gitignore`
- [x] Service role key is never exposed to frontend
- [x] RLS policies are enabled on all tables
- [ ] SSL/HTTPS configured (production only)
- [ ] Firewall rules configured (production only)
- [ ] Regular security updates scheduled

---

## Performance Optimization

### Docker Image Size

Current image: ~150MB (Node 20 Alpine + standalone Next.js)

To optimize further:
- Remove unnecessary dependencies
- Use multi-stage builds (already implemented)
- Enable output file tracing in Next.js

### Database Performance

- Indexes already created via `20250101000008_indexes.sql`
- Consider connection pooling for high traffic
- Monitor slow queries in Supabase dashboard

### Caching

Add Redis for session/data caching:

```yaml
# Add to docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

---

## Monitoring and Maintenance

### Health Monitoring

The health check runs every 30 seconds. Set up alerts for:
- Container restart count
- Health check failures
- High memory/CPU usage

### Log Rotation

```bash
# Configure log rotation in docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Database Backups

Supabase cloud automatically backs up your database daily. To create manual backups:

1. Go to Supabase Dashboard → Database → Backups
2. Click "Create backup"

Or use pg_dump:

```bash
pg_dump -h db.fuzouuxhxluqjmiyabal.supabase.co \
  -U postgres \
  -d postgres \
  > backup.sql
```

---

## Next Steps

1. **Load Sample Data** - Populate tables with initial NFL data
2. **Set Up CI/CD** - Automate builds and deployments
3. **Configure Monitoring** - Set up error tracking (Sentry, etc.)
4. **Performance Testing** - Load test with realistic traffic
5. **Documentation** - Document API endpoints and data flows

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review Supabase logs: Dashboard → Logs
- Check Next.js build output: `.next/` directory

---

**Last Updated:** 2025-10-18
**Docker Version:** 3.8
**Next.js Version:** 14+
**Node Version:** 20 LTS
