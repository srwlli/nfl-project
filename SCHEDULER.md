# NFL Stats Platform - Scheduler Documentation

## Overview

The scheduler automates all data collection scrapers using cron jobs. It runs continuously in the background and executes scrapers at optimal times to keep your database up-to-date with the latest NFL data.

## Quick Start

### Production Mode (Normal Schedule)

```bash
npm run scheduler
```

This runs the scheduler with the standard NFL-optimized schedule:
- **Daily 6:00 AM ET**: Injuries scraper
- **Daily 5:00 PM ET**: Roster updates scraper
- **Game days during game windows**: Live games scraper (every 30 seconds)
- **Monday 3:00 AM ET**: Weekly schedule refresh

### Development Mode (Testing)

```bash
SCHEDULER_MODE=development npm run scheduler
```

Accelerated schedule for testing:
- **Every 5 minutes**: Injuries scraper
- **Every 10 minutes**: Roster updates scraper
- **Every 30 seconds** (during game windows): Live games scraper
- **Every 15 minutes**: Schedule refresh

### Disable Live Games

```bash
LIVE_GAMES_ENABLED=false npm run scheduler
```

Runs all scheduled tasks except live game polling (useful for off-season or testing).

## Scheduled Tasks

### 1. Injuries Scraper
- **Schedule**: Daily at 6:00 AM ET
- **Purpose**: Fetch latest injury reports from ESPN
- **Script**: `scripts/scrapers/injuries-scraper.js`
- **Note**: ESPN API has limited injury data availability

### 2. Roster Updates Scraper
- **Schedule**: Daily at 5:00 PM ET
- **Purpose**: Detect roster changes (signings, releases, IR moves)
- **Script**: `scripts/scrapers/roster-updates-scraper.js`
- **Method**: Compares ESPN rosters with database to identify changes
- **Updates**: `roster_transactions`, `players`, `player_teams` tables

### 3. Live Games Scraper
- **Schedule**: Every 30 seconds during game windows
- **Game Days**: Thursday, Sunday, Monday (+ Saturday for Weeks 15-18)
- **Game Windows**:
  - Thursday: 8:00 PM - 11:30 PM ET
  - Sunday: 1:00 PM - 11:30 PM ET
  - Monday: 8:00 PM - 11:30 PM ET
  - Saturday: 1:00 PM - 11:30 PM ET (Weeks 15-18)
- **Purpose**: Real-time game score updates
- **Auto-triggers**: `game-stats-scraper.js` when games complete
- **Script**: `scripts/scrapers/live-games-scraper.js`

### 4. Schedule Refresh
- **Schedule**: Monday at 3:00 AM ET
- **Purpose**: Update schedule for upcoming weeks
- **Script**: `scripts/seed/04-schedule.js`
- **Updates**: Fetch latest schedule data from ESPN

## Game Day Detection

The scheduler automatically detects game days and time windows:

```javascript
// Game Days
isGameDay() // Returns true on Thu/Sun/Mon (+ Sat for Weeks 15-18)

// Game Windows
isGameTimeWindow() // Returns true during active game hours
```

Only during these windows does the live games scraper poll every 30 seconds.

## Status Monitoring

The scheduler logs status every hour:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SCHEDULER STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time: 10/18/2025, 7:56:32 PM ET
Mode: PRODUCTION
Season: 2025 | Week: 7
Game Day: NO | Game Window: NO
Running Jobs: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Manual Scraper Execution

You can still run scrapers manually while the scheduler is running:

```bash
# Run specific scraper manually
npm run scrape:injuries
npm run scrape:roster
npm run scrape:live -- --week=7
npm run scrape:game-stats -- --game=401772510
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SCHEDULER_MODE` | `production` | Set to `development` for accelerated testing schedule |
| `LIVE_GAMES_ENABLED` | `true` | Set to `false` to disable live game polling |

## Logs

All scheduler activity is logged to:
- **Console**: Real-time output
- **Log files**: `logs/` directory (via Winston logger)
  - `combined.log`: All logs
  - `error.log`: Errors only

## Stopping the Scheduler

Press `Ctrl+C` to gracefully stop the scheduler.

The scheduler will log shutdown information:

```
═══════════════════════════════════════════════════════════════
🛑 SCHEDULER STOPPED
═══════════════════════════════════════════════════════════════
Active jobs terminated: 0
Goodbye!
```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start scheduler with PM2
pm2 start scripts/scheduler.js --name nfl-scheduler

# View logs
pm2 logs nfl-scheduler

# Monitor status
pm2 status

# Restart scheduler
pm2 restart nfl-scheduler

# Stop scheduler
pm2 stop nfl-scheduler
```

### Using systemd (Linux)

Create `/etc/systemd/system/nfl-scheduler.service`:

```ini
[Unit]
Description=NFL Stats Platform Scheduler
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/next-scraper
ExecStart=/usr/bin/node scripts/scheduler.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable nfl-scheduler
sudo systemctl start nfl-scheduler
sudo systemctl status nfl-scheduler
```

### Using Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

CMD ["node", "scripts/scheduler.js"]
```

```bash
docker build -t nfl-scheduler .
docker run -d --name nfl-scheduler nfl-scheduler
```

## Troubleshooting

### Scheduler not running scrapers

1. Check if it's a game day: `isGameDay()` must return true for live games
2. Check if it's game time: `isGameTimeWindow()` must return true
3. Verify cron schedule in logs
4. Try development mode: `SCHEDULER_MODE=development npm run scheduler`

### Scrapers failing

1. Check database connection (`.env` file)
2. Verify ESPN API is accessible
3. Check logs in `logs/error.log`
4. Run scraper manually to see detailed errors

### High CPU usage

- Live games scraper polls every 30 seconds during game windows
- This is normal on game days
- Disable if not needed: `LIVE_GAMES_ENABLED=false`

## Architecture

```
scheduler.js
├─ Cron Jobs
│  ├─ Injuries (daily 6 AM)
│  ├─ Roster Updates (daily 5 PM)
│  ├─ Live Games (30s intervals, game windows only)
│  └─ Schedule Refresh (Monday 3 AM)
├─ Status Monitoring (hourly)
└─ Manual Triggers (CLI)
```

## Future Enhancements

Potential additions to the scheduler:
- [ ] Web dashboard for monitoring
- [ ] Slack/Discord notifications for errors
- [ ] API endpoints for manual triggers
- [ ] Retry logic with exponential backoff
- [ ] Health checks and alerting
- [ ] Scraper prioritization and queuing
- [ ] Database backup scheduling
- [ ] Performance metrics collection
