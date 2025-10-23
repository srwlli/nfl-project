/**
 * Rate Limiter Utility
 *
 * Provides rate limiting and throttling for API calls to prevent
 * hitting rate limits on external APIs (ESPN, etc.)
 */

import { logger } from './logger.js'

/**
 * Create a rate limiter
 *
 * @param {number} requestsPerSecond - Maximum requests per second
 * @returns {Object} Rate limiter with execute method
 */
export function createRateLimiter(requestsPerSecond) {
  const minInterval = 1000 / requestsPerSecond // Minimum ms between requests
  let lastCallTime = 0
  let queue = []
  let processing = false

  const processQueue = async () => {
    if (processing || queue.length === 0) return

    processing = true

    while (queue.length > 0) {
      const { fn, resolve, reject } = queue.shift()
      const now = Date.now()
      const timeSinceLastCall = now - lastCallTime

      // If not enough time has passed, wait
      if (timeSinceLastCall < minInterval) {
        const delay = minInterval - timeSinceLastCall
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      try {
        lastCallTime = Date.now()
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    processing = false
  }

  return {
    /**
     * Execute a function with rate limiting
     *
     * @param {Function} fn - Async function to execute
     * @returns {Promise} Result of the function
     */
    execute: (fn) => {
      return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject })
        processQueue()
      })
    },

    /**
     * Get current queue length
     *
     * @returns {number} Number of pending requests
     */
    queueLength: () => queue.length
  }
}

/**
 * Throttle a function (simple delay-based throttling)
 *
 * @param {Function} fn - Function to throttle
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, delayMs) {
  let lastCall = 0

  return async function (...args) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall < delayMs) {
      const waitTime = delayMs - timeSinceLastCall
      logger.debug(`Throttling: waiting ${waitTime}ms`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    lastCall = Date.now()
    return fn(...args)
  }
}

/**
 * Add delay between operations
 *
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @returns {Promise} Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2
  } = options

  let lastError
  let currentDelay = initialDelay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        logger.warn(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`)
        logger.info(`Retrying in ${currentDelay}ms...`)

        await delay(currentDelay)

        // Exponential backoff
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay)
      } else {
        logger.error(`All ${maxRetries} attempts failed`)
      }
    }
  }

  throw lastError
}

/**
 * Batch process items with rate limiting
 *
 * @param {Array} items - Items to process
 * @param {Function} processFn - Async function to process each item
 * @param {Object} options - Processing options
 * @param {number} options.batchSize - Items per batch (default: 10)
 * @param {number} options.delayBetweenBatches - Delay between batches in ms (default: 1000)
 * @param {Function} options.onProgress - Progress callback (current, total)
 * @returns {Promise<Array>} Results array
 */
export async function batchProcess(items, processFn, options = {}) {
  const {
    batchSize = 10,
    delayBetweenBatches = 1000,
    onProgress = null
  } = options

  const results = []
  const totalBatches = Math.ceil(items.length / batchSize)

  logger.info(`Processing ${items.length} items in ${totalBatches} batches (${batchSize} per batch)`)

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1

    logger.info(`Processing batch ${batchNum}/${totalBatches}`)

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(item => processFn(item))
    )

    // Collect results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        logger.error(`Item ${i + index} failed:`, result.reason)
        results.push(null)
      }
    })

    // Progress callback
    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length)
    }

    // Delay between batches (except for last batch)
    if (i + batchSize < items.length) {
      logger.debug(`Waiting ${delayBetweenBatches}ms before next batch...`)
      await delay(delayBetweenBatches)
    }
  }

  const successCount = results.filter(r => r !== null).length
  logger.info(`Batch processing complete: ${successCount}/${items.length} successful`)

  return results
}

/**
 * Create a request queue with concurrency limit
 *
 * @param {number} concurrency - Maximum concurrent requests (default: 5)
 * @returns {Object} Queue with add and waitForAll methods
 */
export function createRequestQueue(concurrency = 5) {
  const queue = []
  let activeCount = 0

  const processNext = async () => {
    if (queue.length === 0 || activeCount >= concurrency) {
      return
    }

    const { fn, resolve, reject } = queue.shift()
    activeCount++

    try {
      const result = await fn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      activeCount--
      processNext()
    }
  }

  return {
    /**
     * Add request to queue
     *
     * @param {Function} fn - Async function to execute
     * @returns {Promise} Result of the function
     */
    add: (fn) => {
      return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject })
        processNext()
      })
    },

    /**
     * Wait for all queued requests to complete
     *
     * @returns {Promise<void>}
     */
    waitForAll: () => {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (queue.length === 0 && activeCount === 0) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      })
    },

    /**
     * Get queue stats
     *
     * @returns {Object} Queue statistics
     */
    stats: () => ({
      queued: queue.length,
      active: activeCount,
      concurrency
    })
  }
}
