/**
 * NFL Stats Platform - Automated Scraper Scheduler
 *
 * Orchestrates all data scrapers using cron jobs for automated data collection.
 *
 * Schedule Overview:
 * - Daily 6:00 AM ET: Injuries scraper
 * - Daily 5:00 PM ET: Roster updates scraper
 * - Game Days: Live games scraper (30-second intervals during game windows)
 * - Weekly: Schedule refresh (Monday 3 AM ET)
 *
 * Usage:
 * - Start scheduler: npm run scheduler
 * - Scheduler runs continuously until stopped (Ctrl+C)
 *
 * Environment Variables:
 * - SCHEDULER_MODE: 'production' (full schedule) or 'development' (testing)
 * - LIVE_GAMES_ENABLED: 'true' to enable live game polling
 */

import cron from 'node-cron'
import { execSync } from 'child_process'
import { logger } from './utils/logger.js'

const SEASON_YEAR = 2025

// Timezone: ET (America/New_York)
const TIMEZONE = 'America/New_York'

// Mode: production or development
const MODE = process.env.SCHEDULER_MODE || 'production'
const LIVE_GAMES_ENABLED = process.env.LIVE_GAMES_ENABLED !== 'false'

// Track running jobs
const runningJobs = new Map()

/**
 * Execute a scraper script
 */
async function runScript(scriptName, args = '') {
  const jobId = `${scriptName}-${Date.now()}`

  try {
    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    logger.info(`🚀 Starting: ${scriptName} ${args}`)
    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    runningJobs.set(jobId, { scriptName, startTime: Date.now() })

    const command = `node scripts/scrapers/${scriptName} ${args}`

    execSync(command, {
      cwd: process.cwd(),
      stdio: 'inherit'
    })

    const duration = Date.now() - runningJobs.get(jobId).startTime
    runningJobs.delete(jobId)

    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    logger.info(`✅ Completed: ${scriptName} (${(duration / 1000).toFixed(2)}s)`)
    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    logger.info('')

  } catch (error) {
    runningJobs.delete(jobId)
    logger.error(`❌ Failed: ${scriptName}`)
    logger.error(error.message)
    logger.info('')
  }
}

/**
 * Get current NFL week based on date
 */
function getCurrentWeek() {
  const now = new Date()
  const seasonStart = new Date('2025-09-04') // Week 1 start

  if (now < seasonStart) {
    return 1
  }

  const diffTime = Math.abs(now - seasonStart)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)

  return Math.min(week, 18) // Cap at week 18
}

/**
 * Check if today is a game day
 * NFL games: Thursday, Sunday, Monday (+ Saturday late season)
 */
function isGameDay() {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday, 4 = Thursday, 1 = Monday

  // Regular season game days
  if (day === 0 || day === 4 || day === 1) {
    return true
  }

  // Saturday games (Weeks 15-18)
  const week = getCurrentWeek()
  if (day === 6 && week >= 15) {
    return true
  }

  return false
}

/**
 * Check if we're in game time window
 * Thursday: 8:00 PM - 11:30 PM ET
 * Sunday: 1:00 PM - 11:30 PM ET
 * Monday: 8:00 PM - 11:30 PM ET
 * Saturday: 1:00 PM - 11:30 PM ET
 */
function isGameTimeWindow() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const timeInMinutes = hour * 60 + minute

  // Sunday: 1:00 PM - 11:30 PM (13:00 - 23:30)
  if (day === 0) {
    return timeInMinutes >= 780 && timeInMinutes <= 1410 // 13:00 - 23:30
  }

  // Thursday: 8:00 PM - 11:30 PM (20:00 - 23:30)
  if (day === 4) {
    return timeInMinutes >= 1200 && timeInMinutes <= 1410 // 20:00 - 23:30
  }

  // Monday: 8:00 PM - 11:30 PM (20:00 - 23:30)
  if (day === 1) {
    return timeInMinutes >= 1200 && timeInMinutes <= 1410 // 20:00 - 23:30
  }

  // Saturday: 1:00 PM - 11:30 PM (13:00 - 23:30)
  if (day === 6) {
    const week = getCurrentWeek()
    if (week >= 15) {
      return timeInMinutes >= 780 && timeInMinutes <= 1410 // 13:00 - 23:30
    }
  }

  return false
}

/**
 * Schedule: Daily injuries scraper at 6:00 AM ET
 */
function scheduleInjuriesScraper() {
  // Cron: 0 6 * * * (6 AM daily)
  const schedule = MODE === 'development' ? '*/5 * * * *' : '0 6 * * *'

  cron.schedule(schedule, async () => {
    logger.info('⏰ Scheduled task: Injuries scraper')
    await runScript('injuries-scraper.js')
  }, {
    timezone: TIMEZONE
  })

  logger.info(`✓ Scheduled: Injuries scraper (${MODE === 'development' ? 'every 5 min' : 'daily 6 AM ET'})`)
}

/**
 * Schedule: Daily roster updates scraper at 5:00 PM ET
 */
function scheduleRosterUpdatesScraper() {
  // Cron: 0 17 * * * (5 PM daily)
  const schedule = MODE === 'development' ? '*/10 * * * *' : '0 17 * * *'

  cron.schedule(schedule, async () => {
    logger.info('⏰ Scheduled task: Roster updates scraper')
    await runScript('roster-updates-scraper.js')
  }, {
    timezone: TIMEZONE
  })

  logger.info(`✓ Scheduled: Roster updates scraper (${MODE === 'development' ? 'every 10 min' : 'daily 5 PM ET'})`)
}

/**
 * Schedule: Live games scraper (30-second intervals during game windows)
 */
function scheduleLiveGamesScraper() {
  if (!LIVE_GAMES_ENABLED) {
    logger.info('⊘ Live games scraper: DISABLED')
    return
  }

  // Check every 30 seconds if we should poll
  cron.schedule('*/30 * * * * *', async () => {
    // Only run on game days during game time windows
    if (isGameDay() && isGameTimeWindow()) {
      const week = getCurrentWeek()
      logger.info('⏰ Scheduled task: Live games scraper (polling)')
      await runScript('live-games-scraper.js', `--week=${week}`)
    }
  }, {
    timezone: TIMEZONE
  })

  logger.info('✓ Scheduled: Live games scraper (every 30s during game windows)')
}

/**
 * Schedule: Weekly schedule refresh (Monday 3:00 AM ET)
 */
function scheduleWeeklyScheduleRefresh() {
  // Cron: 0 3 * * 1 (3 AM every Monday)
  const schedule = MODE === 'development' ? '*/15 * * * *' : '0 3 * * 1'

  cron.schedule(schedule, async () => {
    logger.info('⏰ Scheduled task: Schedule refresh')
    await runScript('../seed/04-schedule.js')
  }, {
    timezone: TIMEZONE
  })

  logger.info(`✓ Scheduled: Schedule refresh (${MODE === 'development' ? 'every 15 min' : 'Monday 3 AM ET'})`)
}

/**
 * Manual trigger: Run specific scraper on demand
 */
function setupManualTriggers() {
  // Watch for trigger files or API endpoints (future enhancement)
  logger.info('✓ Manual triggers: Available via command line')
}

/**
 * Status monitoring
 */
function startStatusMonitoring() {
  // Log status every hour
  cron.schedule('0 * * * *', () => {
    const now = new Date()
    const week = getCurrentWeek()
    const gameDay = isGameDay() ? 'YES' : 'NO'
    const gameWindow = isGameTimeWindow() ? 'YES' : 'NO'

    logger.info('')
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info('📊 SCHEDULER STATUS')
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info(`Time: ${now.toLocaleString('en-US', { timeZone: TIMEZONE })} ET`)
    logger.info(`Mode: ${MODE.toUpperCase()}`)
    logger.info(`Season: ${SEASON_YEAR} | Week: ${week}`)
    logger.info(`Game Day: ${gameDay} | Game Window: ${gameWindow}`)
    logger.info(`Running Jobs: ${runningJobs.size}`)
    if (runningJobs.size > 0) {
      runningJobs.forEach((job, id) => {
        const duration = Date.now() - job.startTime
        logger.info(`  - ${job.scriptName} (${(duration / 1000).toFixed(0)}s)`)
      })
    }
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info('')
  }, {
    timezone: TIMEZONE
  })

  logger.info('✓ Status monitoring: Enabled (hourly)')
}

/**
 * Main scheduler initialization
 */
async function main() {
  logger.info('')
  logger.info('═'.repeat(80))
  logger.info('NFL STATS PLATFORM - AUTOMATED SCHEDULER')
  logger.info('═'.repeat(80))
  logger.info(`Mode: ${MODE.toUpperCase()}`)
  logger.info(`Season: ${SEASON_YEAR}`)
  logger.info(`Timezone: ${TIMEZONE}`)
  logger.info(`Live Games: ${LIVE_GAMES_ENABLED ? 'ENABLED' : 'DISABLED'}`)
  logger.info('')
  logger.info('Initializing scheduled tasks...')
  logger.info('')

  // Initialize all schedulers
  scheduleInjuriesScraper()
  scheduleRosterUpdatesScraper()
  scheduleLiveGamesScraper()
  scheduleWeeklyScheduleRefresh()
  setupManualTriggers()
  startStatusMonitoring()

  logger.info('')
  logger.info('═'.repeat(80))
  logger.info('🎯 SCHEDULER RUNNING')
  logger.info('═'.repeat(80))
  logger.info('')
  logger.info('Current status:')
  logger.info(`  Week: ${getCurrentWeek()}`)
  logger.info(`  Game Day: ${isGameDay() ? 'YES' : 'NO'}`)
  logger.info(`  Game Window: ${isGameTimeWindow() ? 'YES' : 'NO'}`)
  logger.info('')
  logger.info('Press Ctrl+C to stop the scheduler')
  logger.info('')

  // Keep process alive
  process.on('SIGINT', () => {
    logger.info('')
    logger.info('═'.repeat(80))
    logger.info('🛑 SCHEDULER STOPPED')
    logger.info('═'.repeat(80))
    logger.info(`Active jobs terminated: ${runningJobs.size}`)
    logger.info('Goodbye!')
    process.exit(0)
  })

  // Initial status in development mode
  if (MODE === 'development') {
    logger.info('⚠️  DEVELOPMENT MODE')
    logger.info('   - Injuries: Every 5 minutes')
    logger.info('   - Roster: Every 10 minutes')
    logger.info('   - Live Games: Every 30 seconds (if game window)')
    logger.info('   - Schedule: Every 15 minutes')
    logger.info('')
    logger.info('💡 Set SCHEDULER_MODE=production for normal schedule')
    logger.info('')
  }
}

// Start scheduler
main()
