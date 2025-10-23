/**
 * Logger Utility
 *
 * Winston-based logging with file and console transports.
 * Logs are written to logs/ directory with daily rotation.
 */

import winston from 'winston'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure logs directory exists
const logsDir = join(__dirname, '../../logs')
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true })
}

// Custom format for console output (colorized, readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`
    }

    return msg
  })
)

// Custom format for file output (JSON with full details)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport - human-readable, colorized
    new winston.transports.Console({
      format: consoleFormat
    }),

    // File transport - all logs (JSON format)
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),

    // File transport - errors only
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
})

/**
 * Create a child logger with a specific label/context
 *
 * @param {string} label - Context label (e.g., script name)
 * @returns {winston.Logger} Child logger with label
 */
export function createLogger(label) {
  return logger.child({ context: label })
}

/**
 * Log script start
 *
 * @param {string} scriptName - Name of the script
 */
export function logScriptStart(scriptName) {
  logger.info('═'.repeat(60))
  logger.info(`SCRIPT START: ${scriptName}`)
  logger.info(`Timestamp: ${new Date().toISOString()}`)
  logger.info('═'.repeat(60))
}

/**
 * Log script end with summary
 *
 * @param {string} scriptName - Name of the script
 * @param {Object} summary - Summary object with stats
 */
export function logScriptEnd(scriptName, summary = {}) {
  logger.info('═'.repeat(60))
  logger.info(`SCRIPT END: ${scriptName}`)

  if (summary.success !== undefined) {
    logger.info(`Success: ${summary.success}`)
  }

  if (summary.failed !== undefined) {
    logger.info(`Failed: ${summary.failed}`)
  }

  if (summary.total !== undefined) {
    logger.info(`Total: ${summary.total}`)
  }

  if (summary.duration !== undefined) {
    logger.info(`Duration: ${summary.duration}ms`)
  }

  logger.info(`Timestamp: ${new Date().toISOString()}`)
  logger.info('═'.repeat(60))
}

/**
 * Log error with context
 *
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export function logError(message, error, context = {}) {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...context
  })
}

/**
 * Log progress (useful for long-running operations)
 *
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {string} item - Item name (e.g., "records", "files")
 */
export function logProgress(current, total, item = 'items') {
  const percentage = ((current / total) * 100).toFixed(1)
  logger.info(`Progress: ${current}/${total} ${item} (${percentage}%)`)
}

// Export default logger
export default logger
