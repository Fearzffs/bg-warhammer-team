'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Match, Player, Team } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlayer, setFilterPlayer] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const { profile } = useAuth()
  const supabase = createClient()

  const canView = profile?.role === 'admin' || profile?.role === 'team_member' || profile?.role === 'tryout'

  useEffect(() => {
    if (canView) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [canView])

  useEffect(() => {
    if (canView) {
      fetchMatches()
    }
  }, [filterPlayer, filterTeam])

  async function fetchData() {
    await Promise.all([fetchMatches(), fetchPlayers(), fetchTeams()])
  }

  async function fetchMatches() {
    let query = supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })

    if (filterPlayer) {
      query = query.eq('player_id', filterPlayer)
    }

    if (filterTeam) {
      query = query.eq('opponent_team', filterTeam)
    }

    const { data } = await query
    if (data) setMatches(data as Match[])
    setLoading(false)
  }

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*').order('name')
    if (data) setPlayers(data as Player[])
  }

  async function fetchTeams() {
    const { data } = await supabase.from('teams').select('*').order('name')
    if (data) setTeams(data as Team[])
  }

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name || 'Unknown'

  if (!canView) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">You need to be a team member to view matches.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Matches</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={filterPlayer}
          onChange={(e) => setFilterPlayer(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Players</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.name}>{team.name}</option>
          ))}
        </select>

        {(filterPlayer || filterTeam) && (
          <button
            onClick={() => {
              setFilterPlayer('')
              setFilterTeam('')
            }}
            className="px-4 py-2 text-zinc-400 hover:text-white"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-900 rounded-xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">No matches found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <div key={match.id}>
              <div 
                className={`bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors ${
                  expandedMatch === match.id ? 'rounded-b-none border-b-0' : ''
                }`}
                onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-6">
                    <span className="text-zinc-400 text-sm w-24">
                      {new Date(match.match_date).toLocaleDateString()}
                    </span>
                    <span className="text-white font-medium w-32">{getPlayerName(match.player_id)}</span>
                    <span className="text-zinc-400 w-32">vs {match.opponent_name}</span>
                    <span className="text-zinc-500 w-24">{match.opponent_team || '-'}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-white font-semibold w-20 text-center">
                      {match.points_for} - {match.points_against}
                    </span>
                    <div className="w-28">
                      <ResultBadge result={match.result} />
                    </div>
                    <span className="text-zinc-500 w-32">{match.mission || '-'}</span>
                    {expandedMatch === match.id ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedMatch === match.id && (
                <div className="bg-zinc-800 rounded-b-xl border-t-0 border-x-zinc-800 border-b-zinc-800 p-6 -mt-px">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-zinc-500 text-sm mb-1">Event</h4>
                      <p className="text-white">{match.event_name || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-zinc-500 text-sm mb-1">Deployment</h4>
                      <p className="text-white">{match.deployment_type || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-zinc-500 text-sm mb-1">Table</h4>
                      <p className="text-white">{match.table_number || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-zinc-500 text-sm mb-1">Normal Points</h4>
                      <p className="text-white">
                        {match.normal_points_for || match.normal_points ? match.normal_points_for || match.normal_points : '-'}
                        {' - '}
                        {match.normal_points_against ? match.normal_points_against : '-'}
                      </p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-4">
                      <h4 className="text-zinc-500 text-sm mb-1">Your Army List</h4>
                      <pre className="bg-zinc-900 p-3 rounded-lg text-zinc-300 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                        {match.army_list || 'No army list recorded'}
                      </pre>
                    </div>
                    
                    <div className="col-span-2 md:col-span-4">
                      <h4 className="text-zinc-500 text-sm mb-1">Opponent Army</h4>
                      <p className="text-white mb-2">{match.opponent_army || '-'}</p>
                      <pre className="bg-zinc-900 p-3 rounded-lg text-zinc-300 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                        {match.opponent_army_list || 'No army list recorded'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResultBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    big_win: 'bg-emerald-500/20 text-emerald-400',
    small_win: 'bg-emerald-300/20 text-emerald-300',
    draw: 'bg-zinc-500/20 text-zinc-400',
    small_loss: 'bg-red-300/20 text-red-300',
    big_loss: 'bg-red-500/20 text-red-400',
  }

  const labels: Record<string, string> = {
    big_win: 'Big Win',
    small_win: 'Small Win',
    draw: 'Draw',
    small_loss: 'Small Loss',
    big_loss: 'Big Loss',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[result]}`}>
      {labels[result]}
    </span>
  )
}
