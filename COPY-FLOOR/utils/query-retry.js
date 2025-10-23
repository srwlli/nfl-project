/**
 * Query Retry Utility with Exponential Backoff
 * Phase 2.6 (V3): Handles transient database failures
 *
 * Features:
 * - Exponential backoff (delay * 2^(attempt-1))
 * - Configurable max retries and initial delay
 * - Catches Supabase connection errors (PGRST116, network errors)
 * - Detailed logging of retry attempts
 */

/**
 * Execute a query function with retry logic and exponential backoff
 * @param {Function} queryFn - Async function that returns a Supabase query result
 * @param {Object} options - Retry configuration
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.delayMs - Initial delay in milliseconds (default: 1000)
 * @param {Function} options.onRetry - Optional callback for retry events
 * @returns {Promise} - Query result or throws error after max retries
 */
export async function queryWithRetry(queryFn, options = {}) {
  const {
    maxRetries = 3,
    delayMs = 1000,
    onRetry = null
  } = options

  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Execute the query
      const result = await queryFn()

      // Check for Supabase error in response
      if (result.error) {
        throw new Error(result.error.message || 'Supabase query error')
      }

      // Success - return result
      return result

    } catch (error) {
      lastError = error

      // Check if error is retryable
      const isRetryable = isRetryableError(error)

      if (!isRetryable || attempt === maxRetries) {
        // Non-retryable error or max retries reached - throw immediately
        if (attempt === maxRetries) {
          throw new Error(`Query failed after ${maxRetries} attempts: ${error.message}`)
        }
        throw error
      }

      // Calculate exponential backoff delay
      const backoffDelay = delayMs * Math.pow(2, attempt - 1)

      // Call retry callback if provided
      if (onRetry) {
        onRetry({
          attempt,
          maxRetries,
          delay: backoffDelay,
          error: error.message
        })
      }

      // Wait before retrying
      await sleep(backoffDelay)
    }
  }

  // Should never reach here, but TypeScript/linters like it
  throw lastError
}

/**
 * Determine if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - True if error is retryable
 */
function isRetryableError(error) {
  const message = error.message?.toLowerCase() || ''

  // Retryable error patterns
  const retryablePatterns = [
    'pgrst116',           // Supabase connection error
    'econnrefused',       // Connection refused
    'etimedout',          // Timeout
    'enotfound',          // DNS resolution failed
    'network error',      // Generic network error
    'socket hang up',     // Connection dropped
    'epipe',              // Broken pipe
    '503',                // Service unavailable
    '504',                // Gateway timeout
    'fetch failed',       // Fetch API error
    'too many connections' // Database connection pool exhausted
  ]

  return retryablePatterns.some(pattern => message.includes(pattern))
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Batch execute multiple queries with retry logic
 * @param {Array<Function>} queryFns - Array of async query functions
 * @param {Object} options - Retry configuration (same as queryWithRetry)
 * @returns {Promise<Array>} - Array of query results
 */
export async function batchQueryWithRetry(queryFns, options = {}) {
  return Promise.all(
    queryFns.map(queryFn => queryWithRetry(queryFn, options))
  )
}

/**
 * Create a retry-wrapped Supabase client proxy
 * Usage: const retryClient = createRetryClient(supabase, { maxRetries: 3 })
 * @param {Object} supabaseClient - Supabase client instance
 * @param {Object} options - Retry configuration
 * @returns {Proxy} - Proxied Supabase client with auto-retry
 */
export function createRetryClient(supabaseClient, options = {}) {
  return new Proxy(supabaseClient, {
    get(target, prop) {
      if (prop === 'from') {
        return function(table) {
          const builder = target.from(table)

          // Wrap the query execution methods with retry logic
          const wrapMethod = (method) => {
            const original = builder[method]
            if (typeof original !== 'function') return original

            return async function(...args) {
              return queryWithRetry(
                () => original.apply(builder, args),
                options
              )
            }
          }

          // Proxy the query builder to wrap execution methods
          return new Proxy(builder, {
            get(builderTarget, builderProp) {
              // Methods that execute queries
              if (['select', 'insert', 'update', 'delete', 'upsert'].includes(builderProp)) {
                return wrapMethod(builderProp)
              }
              return builderTarget[builderProp]
            }
          })
        }
      }

      return target[prop]
    }
  })
}
