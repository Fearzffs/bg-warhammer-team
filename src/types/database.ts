export type UserRole = 'admin' | 'team_member' | 'tryout' | 'guest'

export interface Team {
  id: string
  name: string
}

export interface Profile {
  id: string
  email: string
  role: UserRole
  player_id: string | null
}

export interface Player {
  id: string
  name: string
  nickname: string | null
  army: string | null
  created_at: string
}

export interface Match {
  id: string
  player_id: string
  opponent_name: string
  opponent_army: string | null
  points_for: number
  points_against: number
  result: 'big_win' | 'small_win' | 'draw' | 'small_loss' | 'big_loss'
  army_list: string | null
  mission: string | null
  event_name: string | null
  match_date: string
  created_at: string
  opponent_team: string | null
  opponent_army_list: string | null
  deployment_type: string | null
  table_number: number | null
  normal_points_for: number | null
  normal_points_against: number | null
}

export interface NewsPost {
  id: string
  title: string
  content: string
  author_id: string
  is_meta_post: boolean
  published_at: string
  created_at: string
}

export interface TeamDocument {
  id: string
  title: string
  url: string
  document_type: 'matrix' | 'other'
  created_at: string
}

export interface PlayerStats {
  total_matches: number
  total_points_for: number
  total_points_against: number
  average_points_for: number
  average_points_against: number
  big_wins: number
  small_wins: number
  draws: number
  small_losses: number
  big_losses: number
  win_rate: number
}

export interface Event {
  id: string
  title: string
  content: string | null
  event_date: string
  event_time: string | null
  created_at: string
}
