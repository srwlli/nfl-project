-- Create foundation tables (no foreign key dependencies)
-- Migration: 20250101000003_create_foundation_tables
-- Domain 1: Core Entities - Foundation

-- =============================================================================
-- TABLE: teams
-- =============================================================================
CREATE TABLE teams (
    team_id VARCHAR(10) PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    team_abbr VARCHAR(5) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    conference VARCHAR(3) CHECK (conference IN ('AFC', 'NFC')),
    division VARCHAR(10) CHECK (division IN ('North', 'South', 'East', 'West')),
    founded_year INTEGER CHECK (founded_year >= 1920),
    stadium_id VARCHAR(50),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    logo_url TEXT,
    franchise_history JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_teams_conference_division ON teams(conference, division) WHERE deleted_at IS NULL;
CREATE INDEX idx_teams_name_trgm ON teams USING gin(team_name gin_trgm_ops);
CREATE INDEX idx_teams_is_active ON teams(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE teams IS 'NFL teams/franchises with historical franchise data';
COMMENT ON COLUMN teams.team_id IS 'Unique team identifier (e.g., "KC", "NE")';
COMMENT ON COLUMN teams.franchise_history IS 'JSON array of relocations and name changes';

-- =============================================================================
-- TABLE: stadiums
-- =============================================================================
CREATE TABLE stadiums (
    stadium_id VARCHAR(50) PRIMARY KEY,
    stadium_name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    capacity INTEGER,
    surface_type VARCHAR(50),
    roof_type VARCHAR(50) CHECK (roof_type IN ('Open', 'Retractable', 'Dome')),
    opened_year INTEGER,
    closed_year INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    elevation_feet INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_stadiums_city_state ON stadiums(city, state) WHERE deleted_at IS NULL;
CREATE INDEX idx_stadiums_is_active ON stadiums(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE stadiums IS 'NFL stadiums (historical and current)';
COMMENT ON COLUMN stadiums.surface_type IS 'e.g., "Grass", "FieldTurf", "Artificial"';

-- =============================================================================
-- TABLE: positions
-- =============================================================================
CREATE TABLE positions (
    position_id VARCHAR(10) PRIMARY KEY,
    position_name VARCHAR(50) NOT NULL,
    position_group VARCHAR(20) CHECK (position_group IN ('Offense', 'Defense', 'Special Teams')),
    abbreviation VARCHAR(5) NOT NULL UNIQUE,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_positions_group ON positions(position_group) WHERE deleted_at IS NULL;

COMMENT ON TABLE positions IS 'NFL position definitions';
COMMENT ON COLUMN positions.sort_order IS 'Display order for position lists';

-- =============================================================================
-- TABLE: award_types
-- =============================================================================
CREATE TABLE award_types (
    award_type_id VARCHAR(50) PRIMARY KEY,
    award_name VARCHAR(200) NOT NULL,
    award_category VARCHAR(50) CHECK (award_category IN ('Individual', 'Team', 'Statistical')),
    award_level VARCHAR(50) CHECK (award_level IN ('League', 'Conference', 'Team')),
    description TEXT,
    first_awarded_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_award_types_category ON award_types(award_category) WHERE deleted_at IS NULL;

COMMENT ON TABLE award_types IS 'Types of NFL awards (MVP, Pro Bowl, All-Pro, etc.)';

-- =============================================================================
-- TABLE: stat_categories
-- =============================================================================
CREATE TABLE stat_categories (
    category_id VARCHAR(50) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    position_group VARCHAR(20) CHECK (position_group IN ('Offense', 'Defense', 'Special Teams')),
    stat_type VARCHAR(50) CHECK (stat_type IN ('Counting', 'Rate', 'Advanced')),
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_stat_categories_position_group ON stat_categories(position_group) WHERE deleted_at IS NULL;

COMMENT ON TABLE stat_categories IS 'Statistical categories for organizing stats';

-- =============================================================================
-- TABLE: divisions
-- =============================================================================
CREATE TABLE divisions (
    division_id VARCHAR(10) PRIMARY KEY,
    division_name VARCHAR(50) NOT NULL,
    conference VARCHAR(3) CHECK (conference IN ('AFC', 'NFC')),
    established_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

COMMENT ON TABLE divisions IS 'NFL divisions (AFC/NFC North/South/East/West)';

-- =============================================================================
-- TABLE: conferences
-- =============================================================================
CREATE TABLE conferences (
    conference_id VARCHAR(3) PRIMARY KEY CHECK (conference_id IN ('AFC', 'NFC')),
    conference_name VARCHAR(50) NOT NULL,
    established_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

COMMENT ON TABLE conferences IS 'NFL conferences (AFC and NFC)';

-- =============================================================================
-- Add foreign key from teams to stadiums
-- =============================================================================
ALTER TABLE teams
    ADD CONSTRAINT fk_teams_stadium
    FOREIGN KEY (stadium_id) REFERENCES stadiums(stadium_id)
    ON DELETE SET NULL;
