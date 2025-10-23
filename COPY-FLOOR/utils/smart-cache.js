/**
 * Smart Cache with Time-To-Live (TTL) eviction
 * Phase 2.2 (V3): Prevents memory leaks with automatic expiration
 *
 * Features:
 * - TTL-based eviction (auto-cleanup stale entries)
 * - Configurable default TTL per cache instance
 * - Manual invalidation support
 * - Memory-efficient (auto-cleanup on get/set)
 * - Stats tracking (hits, misses, evictions)
 */

export class SmartCache {
  /**
   * @param {Object} options - Cache configuration
   * @param {number} options.defaultTTL - Default TTL in milliseconds (default: 1 hour)
   * @param {number} options.cleanupInterval - Cleanup interval in milliseconds (default: 5 minutes)
   * @param {string} options.name - Cache name for logging (optional)
   */
  constructor(options = {}) {
    this.cache = new Map()
    this.defaultTTL = options.defaultTTL || 60 * 60 * 1000 // 1 hour default
    this.cleanupInterval = options.cleanupInterval || 5 * 60 * 1000 // 5 minutes
    this.name = options.name || 'SmartCache'

    // Stats tracking
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      manualInvalidations: 0
    }

    // Start periodic cleanup
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  /**
   * Get value from cache (returns undefined if expired or missing)
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return undefined
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.evictions++
      this.stats.misses++
      return undefined
    }

    this.stats.hits++
    return entry.value
  }

  /**
   * Set value in cache with optional custom TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time-to-live in milliseconds (optional, uses defaultTTL if not provided)
   */
  set(key, value, ttl) {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    })

    this.stats.sets++

    // Opportunistic cleanup on set (if cache is large)
    if (this.cache.size > 1000) {
      this.cleanup()
    }
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.stats.evictions++
      return false
    }

    return true
  }

  /**
   * Manually invalidate (delete) a key
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.manualInvalidations++
    }
  }

  /**
   * Clear all entries from cache
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    this.stats.manualInvalidations += size
  }

  /**
   * Cleanup expired entries (called automatically on interval)
   */
  cleanup() {
    const now = Date.now()
    let evicted = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        evicted++
      }
    }

    if (evicted > 0) {
      this.stats.evictions += evicted
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100)
        : 0
    }
  }

  /**
   * Stop the cleanup timer (important for graceful shutdown)
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

/**
 * Create a cache instance with sensible defaults
 * @param {string} name - Cache name
 * @param {number} ttl - TTL in milliseconds
 * @returns {SmartCache}
 */
export function createCache(name, ttl = 60 * 60 * 1000) {
  return new SmartCache({
    name,
    defaultTTL: ttl,
    cleanupInterval: 5 * 60 * 1000
  })
}
