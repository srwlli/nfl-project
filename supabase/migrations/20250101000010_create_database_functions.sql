-- Create useful database functions for complex queries
-- Migration: 20250101000010_create_database_functions

-- =============================================================================
-- FUNCTION: Get player career stats summary
-- =============================================================================
CREATE OR REPLACE FUNCTION get_player_career_summary(p_player_id VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'player_id', p.player_id,
    'full_name', p.full_name,
    'position', p.primary_position,
    'seasons', pcs.total_seasons,
    'games', pcs.total_games,
    'passing', json_build_object(
      'yards', pcs.career_passing_yards,
      'touchdowns', pcs.career_passing_touchdowns,
      'interceptions', pcs.career_passing_interceptions
    ),
    'rushing', json_build_object(
      'yards', pcs.career_rushing_yards,
      'touchdowns', pcs.career_rushing_touchdowns
    ),
    'receiving', json_build_object(
      'receptions', pcs.career_receptions,
      'yards', pcs.career_receiving_yards,
      'touchdowns', pcs.career_receiving_touchdowns
    )
  ) INTO result
  FROM players p
  LEFT JOIN player_career_stats pcs ON p.player_id = pcs.player_id
  WHERE p.player_id = p_player_id
    AND p.deleted_at IS NULL;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_player_career_summary IS 'Get comprehensive career stats for a player';

-- Usage: SELECT get_player_career_summary('brady-tom');

-- =============================================================================
-- FUNCTION: Get season leaderboard
-- =============================================================================
CREATE OR REPLACE FUNCTION get_season_leaderboard(
  p_season INTEGER,
  p_stat_category VARCHAR,
  p_position VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank INTEGER,
  player_id VARCHAR,
  player_name VARCHAR,
  team_id VARCHAR,
  stat_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY
      CASE p_stat_category
        WHEN 'passing_yards' THEN pss.passing_yards
        WHEN 'rushing_yards' THEN pss.rushing_yards
        WHEN 'receiving_yards' THEN pss.receiving_yards
        WHEN 'sacks' THEN pss.sacks::NUMERIC
        ELSE 0
      END DESC
    )::INTEGER as rank,
    p.player_id,
    p.full_name as player_name,
    pss.team_id,
    CASE p_stat_category
      WHEN 'passing_yards' THEN pss.passing_yards::DECIMAL
      WHEN 'rushing_yards' THEN pss.rushing_yards::DECIMAL
      WHEN 'receiving_yards' THEN pss.receiving_yards::DECIMAL
      WHEN 'sacks' THEN pss.sacks
      ELSE 0
    END as stat_value
  FROM player_season_stats pss
  JOIN players p ON pss.player_id = p.player_id
  WHERE pss.season = p_season
    AND pss.deleted_at IS NULL
    AND p.deleted_at IS NULL
    AND (p_position IS NULL OR p.primary_position = p_position)
    AND CASE p_stat_category
      WHEN 'passing_yards' THEN pss.passing_attempts >= 100
      WHEN 'rushing_yards' THEN pss.rushing_attempts >= 50
      WHEN 'receiving_yards' THEN pss.receptions >= 20
      WHEN 'sacks' THEN TRUE
      ELSE TRUE
    END
  ORDER BY stat_value DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_season_leaderboard IS 'Get leaderboard for a specific stat category and season';

-- Usage: SELECT * FROM get_season_leaderboard(2024, 'passing_yards', 'QB', 10);

-- =============================================================================
-- FUNCTION: Get team season record
-- =============================================================================
CREATE OR REPLACE FUNCTION get_team_season_record(
  p_team_id VARCHAR,
  p_season INTEGER
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'team_id', tss.team_id,
    'season', tss.season,
    'wins', tss.wins,
    'losses', tss.losses,
    'ties', tss.ties,
    'win_percentage', tss.win_percentage,
    'points_for', tss.points_for,
    'points_against', tss.points_against,
    'point_differential', tss.point_differential,
    'division_rank', tss.division_rank,
    'made_playoffs', ts.made_playoffs,
    'playoff_result', ts.playoff_result
  ) INTO result
  FROM team_season_stats tss
  LEFT JOIN team_seasons ts ON tss.team_id = ts.team_id AND tss.season = ts.season
  WHERE tss.team_id = p_team_id
    AND tss.season = p_season
    AND tss.deleted_at IS NULL;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_team_season_record IS 'Get complete team record for a season';

-- Usage: SELECT get_team_season_record('KC', 2024);

-- =============================================================================
-- FUNCTION: Get upcoming games
-- =============================================================================
CREATE OR REPLACE FUNCTION get_upcoming_games(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  game_id VARCHAR,
  game_date DATE,
  home_team VARCHAR,
  away_team VARCHAR,
  week INTEGER,
  season INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.game_id,
    g.game_date,
    ht.team_name as home_team,
    at.team_name as away_team,
    g.week,
    g.season
  FROM games g
  JOIN teams ht ON g.home_team_id = ht.team_id
  JOIN teams at ON g.away_team_id = at.team_id
  WHERE g.status = 'scheduled'
    AND g.game_date >= CURRENT_DATE
    AND g.deleted_at IS NULL
  ORDER BY g.game_date ASC, g.game_time ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_upcoming_games IS 'Get upcoming scheduled games';

-- Usage: SELECT * FROM get_upcoming_games(20);

-- =============================================================================
-- FUNCTION: Search players
-- =============================================================================
CREATE OR REPLACE FUNCTION search_players(
  p_search_term VARCHAR,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  player_id VARCHAR,
  full_name VARCHAR,
  player_position VARCHAR,
  current_team VARCHAR,
  status player_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.player_id,
    p.full_name,
    p.primary_position as player_position,
    COALESCE(
      (SELECT team_id FROM player_teams pt
       WHERE pt.player_id = p.player_id
       AND pt.end_season IS NULL
       ORDER BY pt.start_season DESC
       LIMIT 1),
      'Free Agent'
    ) as current_team,
    p.status
  FROM players p
  WHERE p.deleted_at IS NULL
    AND (
      p.full_name ILIKE '%' || p_search_term || '%'
      OR p.last_name ILIKE '%' || p_search_term || '%'
    )
  ORDER BY
    CASE
      WHEN p.full_name ILIKE p_search_term || '%' THEN 1
      WHEN p.last_name ILIKE p_search_term || '%' THEN 2
      ELSE 3
    END,
    p.full_name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_players IS 'Fuzzy search for players by name';

-- Usage: SELECT * FROM search_players('Tom Brady');

-- =============================================================================
-- FUNCTION: Get player stats by season
-- =============================================================================
CREATE OR REPLACE FUNCTION get_player_stats_by_season(
  p_player_id VARCHAR,
  p_season INTEGER
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'player_id', pss.player_id,
    'season', pss.season,
    'team_id', pss.team_id,
    'games_played', pss.games_played,
    'games_started', pss.games_started,
    'passing', json_build_object(
      'attempts', pss.passing_attempts,
      'completions', pss.passing_completions,
      'yards', pss.passing_yards,
      'touchdowns', pss.passing_touchdowns,
      'interceptions', pss.passing_interceptions
    ),
    'rushing', json_build_object(
      'attempts', pss.rushing_attempts,
      'yards', pss.rushing_yards,
      'touchdowns', pss.rushing_touchdowns
    ),
    'receiving', json_build_object(
      'receptions', pss.receptions,
      'targets', pss.receiving_targets,
      'yards', pss.receiving_yards,
      'touchdowns', pss.receiving_touchdowns
    ),
    'defense', json_build_object(
      'tackles', pss.tackles_total,
      'sacks', pss.sacks,
      'interceptions', pss.interceptions
    )
  ) INTO result
  FROM player_season_stats pss
  WHERE pss.player_id = p_player_id
    AND pss.season = p_season
    AND pss.deleted_at IS NULL;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_player_stats_by_season IS 'Get all stats for a player in a specific season';

-- Usage: SELECT get_player_stats_by_season('brady-tom', 2007);

-- =============================================================================
-- FUNCTION: Get game summary
-- =============================================================================
CREATE OR REPLACE FUNCTION get_game_summary(p_game_id VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'game_id', g.game_id,
    'season', g.season,
    'week', g.week,
    'game_type', g.game_type,
    'game_date', g.game_date,
    'status', g.status,
    'home_team', json_build_object(
      'team_id', ht.team_id,
      'team_name', ht.team_name,
      'score', g.home_score
    ),
    'away_team', json_build_object(
      'team_id', at.team_id,
      'team_name', at.team_name,
      'score', g.away_score
    ),
    'stadium', json_build_object(
      'stadium_name', s.stadium_name,
      'city', s.city,
      'state', s.state
    ),
    'attendance', g.attendance,
    'overtime', g.overtime
  ) INTO result
  FROM games g
  JOIN teams ht ON g.home_team_id = ht.team_id
  JOIN teams at ON g.away_team_id = at.team_id
  LEFT JOIN stadiums s ON g.stadium_id = s.stadium_id
  WHERE g.game_id = p_game_id
    AND g.deleted_at IS NULL;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_game_summary IS 'Get complete game summary with teams and venue';

-- Usage: SELECT get_game_summary('2024_01_KC_BUF');

-- =============================================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables (example for a few tables)
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for all 41 tables in production

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically update updated_at timestamp on row updates';

-- =============================================================================
-- FUNCTION: Soft delete helper
-- =============================================================================
CREATE OR REPLACE FUNCTION soft_delete(
  p_table_name VARCHAR,
  p_id_column VARCHAR,
  p_id_value VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
BEGIN
  sql_query := format(
    'UPDATE %I SET deleted_at = CURRENT_TIMESTAMP WHERE %I = $1 AND deleted_at IS NULL',
    p_table_name,
    p_id_column
  );

  EXECUTE sql_query USING p_id_value;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION soft_delete IS 'Soft delete a record by setting deleted_at timestamp';

-- Usage: SELECT soft_delete('players', 'player_id', 'some-player-id');
