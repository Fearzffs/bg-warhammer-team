'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Match, Player, Team } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlayer, setFilterPlayer] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
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
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Player</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Opponent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Team</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Score</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Mission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {matches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-4 py-3 text-white">
                      {new Date(match.match_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{getPlayerName(match.player_id)}</td>
                    <td className="px-4 py-3 text-zinc-400">{match.opponent_name}</td>
                    <td className="px-4 py-3 text-zinc-400">{match.opponent_team || '-'}</td>
                    <td className="px-4 py-3 text-center text-white">
                      {match.points_for} - {match.points_against}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ResultBadge result={match.result} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-sm">{match.mission || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
