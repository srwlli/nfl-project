/**
 * Supabase Client Utility
 *
 * Provides reusable Supabase connection with error handling,
 * batch operations, and retry logic.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { logger } from './logger.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
  )
}

/**
 * Get Supabase client instance
 * Uses service role key for admin operations (bypasses RLS)
 */
export function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Insert batch of records into a table
 *
 * @param {string} table - Table name
 * @param {Array} data - Array of records to insert
 * @param {number} batchSize - Number of records per batch (default: 1000)
 * @returns {Promise<Object>} Result object with success count and errors
 */
export async function insertBatch(table, data, batchSize = 1000) {
  const supabase = getSupabaseClient()
  const results = {
    success: 0,
    errors: [],
    total: data.length
  }

  logger.info(`Inserting ${data.length} records into ${table}...`)

  // Process in batches to avoid payload size limits
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(data.length / batchSize)

    logger.info(`Processing batch ${batchNum}/${totalBatches} (${batch.length} records)`)

    try {
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(batch)
        .select()

      if (error) {
        logger.error(`Batch ${batchNum} failed:`, error)
        results.errors.push({
          batch: batchNum,
          error: error.message,
          records: batch.length
        })
      } else {
        results.success += inserted.length
        logger.info(`Batch ${batchNum} inserted successfully (${inserted.length} records)`)
      }
    } catch (err) {
      logger.error(`Batch ${batchNum} exception:`, err)
      results.errors.push({
        batch: batchNum,
        error: err.message,
        records: batch.length
      })
    }
  }

  logger.info(`Insert complete: ${results.success}/${results.total} successful`)
  return results
}

/**
 * Upsert batch of records (insert or update on conflict)
 *
 * @param {string} table - Table name
 * @param {Array} data - Array of records to upsert
 * @param {Array<string>} conflictColumns - Columns to use for conflict detection
 * @param {number} batchSize - Number of records per batch (default: 1000)
 * @returns {Promise<Object>} Result object with success count and errors
 */
export async function upsertBatch(table, data, conflictColumns, batchSize = 1000) {
  const supabase = getSupabaseClient()
  const results = {
    success: 0,
    errors: [],
    total: data.length
  }

  logger.info(`Upserting ${data.length} records into ${table} (conflict on: ${conflictColumns.join(', ')})...`)

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(data.length / batchSize)

    logger.info(`Processing batch ${batchNum}/${totalBatches} (${batch.length} records)`)

    try {
      const { data: upserted, error } = await supabase
        .from(table)
        .upsert(batch, {
          onConflict: conflictColumns.join(','),
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        logger.error(`Batch ${batchNum} failed:`, error)
        results.errors.push({
          batch: batchNum,
          error: error.message,
          records: batch.length
        })
      } else {
        results.success += upserted.length
        logger.info(`Batch ${batchNum} upserted successfully (${upserted.length} records)`)
      }
    } catch (err) {
      logger.error(`Batch ${batchNum} exception:`, err)
      results.errors.push({
        batch: batchNum,
        error: err.message,
        records: batch.length
      })
    }
  }

  logger.info(`Upsert complete: ${results.success}/${results.total} successful`)
  return results
}

/**
 * Execute query with retry logic
 *
 * @param {Function} queryFn - Function that returns a Supabase query
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} delayMs - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise<Object>} Query result
 */
export async function queryWithRetry(queryFn, maxRetries = 3, delayMs = 1000) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn()

      if (result.error) {
        lastError = result.error
        logger.warn(`Query attempt ${attempt}/${maxRetries} failed: ${result.error.message}`)

        if (attempt < maxRetries) {
          logger.info(`Retrying in ${delayMs}ms...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }
      } else {
        if (attempt > 1) {
          logger.info(`Query succeeded on attempt ${attempt}/${maxRetries}`)
        }
        return result
      }
    } catch (err) {
      lastError = err
      logger.warn(`Query attempt ${attempt}/${maxRetries} threw exception: ${err.message}`)

      if (attempt < maxRetries) {
        logger.info(`Retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new Error(`Query failed after ${maxRetries} attempts: ${lastError.message || lastError}`)
}

/**
 * Test database connection
 *
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('teams')
      .select('count')
      .limit(1)

    if (error) {
      logger.error('Connection test failed:', error)
      return false
    }

    logger.info('Connection test successful')
    return true
  } catch (err) {
    logger.error('Connection test exception:', err)
    return false
  }
}

/**
 * Get record count from a table
 *
 * @param {string} table - Table name
 * @returns {Promise<number>} Number of records in table
 */
export async function getRecordCount(table) {
  const supabase = getSupabaseClient()
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (error) {
    logger.error(`Failed to get count from ${table}:`, error)
    throw error
  }

  return count
}

/**
 * Truncate a table (delete all records)
 * WARNING: Use with caution!
 *
 * @param {string} table - Table name
 * @returns {Promise<boolean>} True if successful
 */
export async function truncateTable(table) {
  const supabase = getSupabaseClient()

  logger.warn(`TRUNCATING TABLE: ${table}`)

  const { error } = await supabase
    .from(table)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all where id is not impossible UUID

  if (error) {
    logger.error(`Failed to truncate ${table}:`, error)
    return false
  }

  logger.info(`Table ${table} truncated successfully`)
  return true
}
