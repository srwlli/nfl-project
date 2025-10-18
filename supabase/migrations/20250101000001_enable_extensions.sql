-- Enable required PostgreSQL extensions for NFL Stats Platform
-- Migration: 20250101000001_enable_extensions

-- UUID generation (for potential use in future tables)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fuzzy text search (for player/team name searches)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Composite indexes on JSONB columns
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Comments
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram similarity for fuzzy text search';
COMMENT ON EXTENSION "btree_gin" IS 'GIN indexes for composite queries on JSONB';
