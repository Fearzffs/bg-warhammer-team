'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Match, Player, Team, TeamMatch } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlayer, setFilterPlayer] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [expandedTeamMatch, setExpandedTeamMatch] = useState<string | null>(null)
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
    await Promise.all([fetchMatches(), fetchPlayers(), fetchTeams(), fetchTeamMatches()])
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

  async function fetchTeamMatches() {
    const { data } = await supabase.from('team_matches').select('*').order('date', { ascending: false })
    if (data) setTeamMatches(data as TeamMatch[])
  }

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name || 'Unknown'
  const getTeamMatch = (id: string) => teamMatches.find((tm) => tm.id === id)

  const groupedMatches = matches.filter(m => m.team_match_id)
  const standaloneMatches = matches.filter(m => !m.team_match_id)

  const getTeamMatchScore = (teamMatchId: string) => {
    const teamMatchesData = matches.filter(m => m.team_match_id === teamMatchId)
    const ourPoints = teamMatchesData.reduce((sum, m) => sum + m.points_for, 0)
    const oppPoints = teamMatchesData.reduce((sum, m) => sum + m.points_against, 0)
    return { our: ourPoints, opp: oppPoints }
  }

  const getTeamMatchResult = (teamMatchId: string) => {
    const tm = getTeamMatch(teamMatchId)
    if (!tm) return 'Unknown'
    const { our, opp } = getTeamMatchScore(teamMatchId)
    const diff = our - opp
    if (diff >= tm.draw_diff) return 'Win'
    if (diff <= -tm.draw_diff) return 'Loss'
    return 'Draw'
  }

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
        <div className="space-y-4">
          {teamMatches.map((tm) => {
            const teamMatchMatches = matches.filter(m => m.team_match_id === tm.id)
            const { our, opp } = getTeamMatchScore(tm.id)
            const result = getTeamMatchResult(tm.id)
            const isExpanded = expandedTeamMatch === tm.id

            if (filterPlayer && !teamMatchMatches.some(m => m.player_id === filterPlayer)) return null
            if (filterTeam && tm.opponent_team !== filterTeam) return null

            return (
              <div key={tm.id}>
                <div 
                  className={`bg-gradient-to-r from-emerald-900/30 to-zinc-900 rounded-xl border border-emerald-700/50 cursor-pointer hover:border-emerald-600 transition-colors ${
                    isExpanded ? 'rounded-b-none border-b-0' : ''
                  }`}
                  onClick={() => setExpandedTeamMatch(isExpanded ? null : tm.id)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-6">
                      <span className="text-zinc-400 text-sm w-24">
                        {new Date(tm.date).toLocaleDateString()}
                      </span>
                      <span className="text-white font-bold text-lg">vs {tm.opponent_team}</span>
                      <span className="text-zinc-500 text-sm">Draw diff: {tm.draw_diff}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-white font-bold text-xl">
                        {our} - {opp}
                      </span>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        result === 'Win' ? 'bg-emerald-500/20 text-emerald-400' :
                        result === 'Loss' ? 'bg-red-500/20 text-red-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {result}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-zinc-800 rounded-b-xl border-t-0 border-x-emerald-700/50 border-b-emerald-700/50 p-4 -mt-px space-y-2">
                    {teamMatchMatches.map((match) => (
                      <MatchRow key={match.id} match={match} getPlayerName={getPlayerName} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {standaloneMatches.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Individual Matches</h2>
              <div className="space-y-2">
                {standaloneMatches.map((match) => (
                  <MatchRow key={match.id} match={match} getPlayerName={getPlayerName} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MatchRow({ match, getPlayerName }: { match: Match; getPlayerName: (id: string) => string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div 
        className={`bg-zinc-900 rounded-lg border border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors ${
          expanded ? 'rounded-b-none border-b-0' : ''
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-sm w-20">{new Date(match.match_date).toLocaleDateString()}</span>
            <span className="text-white font-medium">{getPlayerName(match.player_id)}</span>
            <span className="text-zinc-400">vs {match.opponent_name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">{match.points_for} - {match.points_against}</span>
            <ResultBadge result={match.result} />
            {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-zinc-800 rounded-b-lg p-4 -mt-px space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-zinc-500 text-xs mb-1">Prediction</h4>
              <p className="text-white">{match.prediction ? formatPrediction(match.prediction) : '-'}</p>
            </div>
            <div>
              <h4 className="text-zinc-500 text-xs mb-1">Opponent Team</h4>
              <p className="text-white">{match.opponent_team || '-'}</p>
            </div>
            <div>
              <h4 className="text-zinc-500 text-xs mb-1">Deployment</h4>
              <p className="text-white">{match.deployment_type || '-'}</p>
            </div>
            <div>
              <h4 className="text-zinc-500 text-xs mb-1">Table</h4>
              <p className="text-white">{match.table_number || '-'}</p>
            </div>
          </div>
          {match.army_list && (
            <div>
              <h4 className="text-zinc-500 text-xs mb-1">Your Army List</h4>
              <pre className="bg-zinc-900 p-2 rounded text-zinc-300 text-xs overflow-x-auto whitespace-pre-wrap">{match.army_list}</pre>
            </div>
          )}
          {match.opponent_army_list && (
            <div>
              <h4 className="text-zinc-500 text-xs mb-1">Opponent Army List</h4>
              <pre className="bg-zinc-900 p-2 rounded text-zinc-300 text-xs overflow-x-auto whitespace-pre-wrap">{match.opponent_army_list}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatPrediction(prediction: string): string {
  const labels: Record<string, string> = {
    big_win: 'Big Win',
    small_win: 'Small Win',
    draw: 'Draw',
    small_loss: 'Small Loss',
    big_loss: 'Big Loss',
  }
  return labels[prediction] || prediction
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
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[result]}`}>
      {labels[result]}
    </span>
  )
}
