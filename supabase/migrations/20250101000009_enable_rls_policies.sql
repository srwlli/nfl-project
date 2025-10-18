-- Enable Row Level Security (RLS) and create policies
-- Migration: 20250101000009_enable_rls_policies
-- This provides secure public read access while restricting writes

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

-- Core Entities
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_seasons ENABLE ROW LEVEL SECURITY;

-- Player Stats
ALTER TABLE player_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_career_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_passing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_rushing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_receiving_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_defensive_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_kicking_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_returning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_advanced_stats ENABLE ROW LEVEL SECURITY;

-- Team Stats
ALTER TABLE team_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_offense_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_defense_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_special_teams_stats ENABLE ROW LEVEL SECURITY;

-- Game Details
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_by_play ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_officials ENABLE ROW LEVEL SECURITY;

-- Leaderboards
ALTER TABLE season_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rookie_leaderboards ENABLE ROW LEVEL SECURITY;

-- Reference & Relationships
ALTER TABLE player_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PUBLIC READ ACCESS (authenticated and anon users can read non-deleted records)
-- =============================================================================

-- Helper function to check if record is not soft-deleted
CREATE OR REPLACE FUNCTION is_not_deleted()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create read policies for all tables
-- Pattern: Allow SELECT for all users, filter out soft-deleted records

-- Core Entities
CREATE POLICY "Public read access" ON teams FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON stadiums FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON positions FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON award_types FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON stat_categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON divisions FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON conferences FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON seasons FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON players FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON coaches FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON games FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON team_seasons FOR SELECT USING (deleted_at IS NULL);

-- Player Stats
CREATE POLICY "Public read access" ON player_season_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_game_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_career_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_passing_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_rushing_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_receiving_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_defensive_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_kicking_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_returning_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_advanced_stats FOR SELECT USING (deleted_at IS NULL);

-- Team Stats
CREATE POLICY "Public read access" ON team_season_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON team_game_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON team_offense_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON team_defense_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON team_special_teams_stats FOR SELECT USING (deleted_at IS NULL);

-- Game Details
CREATE POLICY "Public read access" ON game_stats FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON game_drives FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON play_by_play FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON scoring_plays FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON key_plays FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON game_weather FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON game_officials FOR SELECT USING (deleted_at IS NULL);

-- Leaderboards
CREATE POLICY "Public read access" ON season_leaderboards FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON career_leaderboards FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON active_leaderboards FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON rookie_leaderboards FOR SELECT USING (deleted_at IS NULL);

-- Reference & Relationships
CREATE POLICY "Public read access" ON player_teams FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_awards FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_milestones FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_injuries FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON player_contracts FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON roster_transactions FOR SELECT USING (deleted_at IS NULL);

-- =============================================================================
-- ADMIN WRITE ACCESS (service_role only)
-- =============================================================================
-- Note: These policies use auth.uid() and auth.jwt() which require Supabase Auth
-- For now, we'll use a simple approach: only service_role can write

-- Create a function to check if user is service_role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'service_role';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Example INSERT policy for teams (repeat pattern for other tables)
CREATE POLICY "Service role can insert" ON teams
  FOR INSERT
  WITH CHECK (is_service_role());

CREATE POLICY "Service role can update" ON teams
  FOR UPDATE
  USING (is_service_role());

CREATE POLICY "Service role can delete" ON teams
  FOR DELETE
  USING (is_service_role());

-- For brevity, the pattern above should be repeated for all 41 tables
-- In production, you might want more granular policies based on user roles

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Public read access" ON teams IS 'Allow anyone to read teams (excluding soft-deleted)';
COMMENT ON POLICY "Service role can insert" ON teams IS 'Only service_role (backend/ETL) can insert teams';
COMMENT ON POLICY "Service role can update" ON teams IS 'Only service_role (backend/ETL) can update teams';
COMMENT ON POLICY "Service role can delete" ON teams IS 'Only service_role (backend/ETL) can delete teams';

-- =============================================================================
-- BYPASS RLS FOR SERVICE ROLE
-- =============================================================================
-- Alternative approach: Grant full access to service_role, bypass RLS

-- This allows your backend to use service_role key for all write operations
-- while the anon/authenticated keys are read-only via RLS policies

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant SELECT to anon and authenticated for read access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
