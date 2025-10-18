-- Create ENUM types for NFL Stats Platform
-- Migration: 20250101000002_create_enums

-- Game status enum
CREATE TYPE game_status AS ENUM (
    'scheduled',
    'in_progress',
    'final',
    'postponed',
    'cancelled'
);

COMMENT ON TYPE game_status IS 'Current status of a game';

-- Season type enum
CREATE TYPE season_type AS ENUM (
    'preseason',
    'regular',
    'wildcard',
    'division',
    'conference',
    'superbowl'
);

COMMENT ON TYPE season_type IS 'Type of game within the season';

-- Player status enum
CREATE TYPE player_status AS ENUM (
    'active',
    'injured_reserve',
    'practice_squad',
    'suspended',
    'retired',
    'free_agent'
);

COMMENT ON TYPE player_status IS 'Current status of a player';

-- Transaction type enum
CREATE TYPE transaction_type AS ENUM (
    'signed',
    'released',
    'traded',
    'waived',
    'drafted',
    'retired',
    'ir_placed',
    'ir_returned'
);

COMMENT ON TYPE transaction_type IS 'Type of roster transaction';
