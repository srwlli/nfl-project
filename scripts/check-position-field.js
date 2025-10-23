import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function test() {
  const { data } = await supabase
    .from('player_game_stats')
    .select('player_id, position')
    .limit(5)

  console.log('Data with position field:', data)
}

test()
