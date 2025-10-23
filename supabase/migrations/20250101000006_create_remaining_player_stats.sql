-- Create remaining player statistics tables
-- Migration: 20250101000006_create_remaining_player_stats
-- Domain 2: Player Stats (continued) - REMOVED 4 redundant stat tables

-- REMOVED: player_defensive_stats (redundant - 15 defensive fields in player_game_stats)
-- REMOVED: player_kicking_stats (redundant - 12 kicking/punting fields in player_game_stats)
-- REMOVED: player_returning_stats (redundant - 10 return fields in player_game_stats)
-- REMOVED: player_advanced_stats (redundant - EPA/WPA in play_by_play table)
