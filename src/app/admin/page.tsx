'use client'

import { createClient } from '@/lib/supabase'
import { Player, Match, Profile, Team } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Trash2, Edit, X, Shield, User, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

type Tab = 'players' | 'matches' | 'users' | 'teams'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('players')
  const { profile } = useAuth()

  if (profile?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

      <div className="flex gap-2 mb-6 border-b border-zinc-800">
        <TabButton
          active={activeTab === 'players'}
          onClick={() => setActiveTab('players')}
          icon={<User className="w-4 h-4" />}
          label="Players"
        />
        <TabButton
          active={activeTab === 'matches'}
          onClick={() => setActiveTab('matches')}
          icon={<Shield className="w-4 h-4" />}
          label="Matches"
        />
        <TabButton
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          icon={<UserPlus className="w-4 h-4" />}
          label="Users"
        />
        <TabButton
          active={activeTab === 'teams'}
          onClick={() => setActiveTab('teams')}
          icon={<Shield className="w-4 h-4" />}
          label="Teams"
        />
      </div>

      {activeTab === 'players' && <PlayersTab />}
      {activeTab === 'matches' && <MatchesTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'teams' && <TeamsTab />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
        active
          ? 'text-emerald-400 border-b-2 border-emerald-400'
          : 'text-zinc-400 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function PlayersTab() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*').order('name')
    if (data) setPlayers(data as Player[])
    setLoading(false)
  }

  async function deletePlayer(id: string) {
    if (!confirm('Are you sure? This will also delete all their matches.')) return
    await supabase.from('players').delete().eq('id', id)
    fetchPlayers()
  }

  if (loading) return <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingPlayer(null)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">No players yet</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Nickname</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Army</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="px-4 py-3 text-white">{player.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{player.nickname || '-'}</td>
                  <td className="px-4 py-3 text-emerald-400">{player.army || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPlayer(player)
                          setShowEditor(true)
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlayer(player.id)}
                        className="p-1 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <PlayerEditor
          player={editingPlayer}
          onClose={() => {
            setShowEditor(false)
            setEditingPlayer(null)
          }}
          onSave={() => {
            setShowEditor(false)
            setEditingPlayer(null)
            fetchPlayers()
          }}
        />
      )}
    </div>
  )
}

function PlayerEditor({
  player,
  onClose,
  onSave,
}: {
  player: Player | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(player?.name || '')
  const [nickname, setNickname] = useState(player?.nickname || '')
  const [army, setArmy] = useState(player?.army || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = { name, nickname: nickname || null, army: army || null }
    let error

    if (player) {
      ({ error } = await supabase.from('players').update(data).eq('id', player.id))
    } else {
      ({ error } = await supabase.from('players').insert(data))
    }

    setLoading(false)
    if (!error) onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">{player ? 'Edit Player' : 'Add Player'}</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Army</label>
            <input
              type="text"
              value={army}
              onChange={(e) => setArmy(e.target.value)}
              placeholder="e.g., Space Marines, Orks"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MatchesTab() {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchMatches(), fetchPlayers(), fetchTeams()])
  }, [])

  async function fetchMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })
    
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

  async function deleteMatch(id: string) {
    if (!confirm('Delete this match?')) return
    await supabase.from('matches').delete().eq('id', id)
    fetchMatches()
  }

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name || 'Unknown'

  if (loading) return <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingMatch(null)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Match
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">No matches recorded yet</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Player</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Opponent</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Score</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {matches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-4 py-3 text-white">{getPlayerName(match.player_id)}</td>
                    <td className="px-4 py-3 text-zinc-400">{match.opponent_name}</td>
                    <td className="px-4 py-3 text-center text-white">
                      {match.points_for} - {match.points_against}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ResultBadge result={match.result} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(match.match_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingMatch(match)
                            setShowEditor(true)
                          }}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMatch(match.id)}
                          className="p-1 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEditor && (
        <MatchEditor
          match={editingMatch}
          players={players}
          teams={teams}
          onClose={() => {
            setShowEditor(false)
            setEditingMatch(null)
          }}
          onSave={() => {
            setShowEditor(false)
            setEditingMatch(null)
            fetchMatches()
          }}
        />
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

function MatchEditor({
  match,
  players,
  teams,
  onClose,
  onSave,
}: {
  match: Match | null
  players: Player[]
  teams: Team[]
  onClose: () => void
  onSave: () => void
}) {
  const [playerId, setPlayerId] = useState(match?.player_id || '')
  const [opponentName, setOpponentName] = useState(match?.opponent_name || '')
  const [opponentTeam, setOpponentTeam] = useState(match?.opponent_team || '')
  const [opponentArmy, setOpponentArmy] = useState(match?.opponent_army || '')
  const [opponentArmyList, setOpponentArmyList] = useState(match?.opponent_army_list || '')
  const [pointsFor, setPointsFor] = useState(match?.points_for?.toString() || '')
  const [pointsAgainst, setPointsAgainst] = useState(match?.points_against?.toString() || '')
  const [result, setResult] = useState<Match['result']>(match?.result || 'draw')
  const [armyList, setArmyList] = useState(match?.army_list || '')
  const [mission, setMission] = useState(match?.mission || '')
  const [eventName, setEventName] = useState(match?.event_name || '')
  const [matchDate, setMatchDate] = useState(match?.match_date || new Date().toISOString().split('T')[0])
  const [deploymentType, setDeploymentType] = useState(match?.deployment_type || '')
  const [tableNumber, setTableNumber] = useState(match?.table_number?.toString() || '')
  const [normalPoints, setNormalPoints] = useState(match?.normal_points?.toString() || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!match && players.length > 0) {
      setPlayerId(players[0].id)
    }
  }, [players, match])

  function calculateResult() {
    const pf = parseInt(pointsFor) || 0
    const pa = parseInt(pointsAgainst) || 0
    
    if (pf >= 15) setResult('big_win')
    else if (pf > pa) setResult('small_win')
    else if (pf === pa) setResult('draw')
    else if (pa >= 15) setResult('big_loss')
    else setResult('small_loss')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = {
      player_id: playerId,
      opponent_name: opponentName,
      opponent_team: opponentTeam || null,
      opponent_army: opponentArmy || null,
      opponent_army_list: opponentArmyList || null,
      points_for: parseInt(pointsFor),
      points_against: parseInt(pointsAgainst),
      result,
      army_list: armyList || null,
      mission: mission || null,
      event_name: eventName || null,
      match_date: matchDate,
      deployment_type: deploymentType || null,
      table_number: tableNumber ? parseInt(tableNumber) : null,
      normal_points: normalPoints ? parseInt(normalPoints) : null,
    }

    let error
    if (match) {
      ({ error } = await supabase.from('matches').update(data).eq('id', match.id))
    } else {
      ({ error } = await supabase.from('matches').insert(data))
    }

    setLoading(false)
    if (!error) onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{match ? 'Edit Match' : 'Add Match'}</h2>
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Player *</label>
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Date *</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Opponent Name *</label>
              <input
                type="text"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Opponent Army</label>
              <input
                type="text"
                value={opponentArmy}
                onChange={(e) => setOpponentArmy(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Opponent Team</label>
              <select
                value={opponentTeam}
                onChange={(e) => setOpponentTeam(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Points For *</label>
              <input
                type="number"
                value={pointsFor}
                onChange={(e) => {
                  setPointsFor(e.target.value)
                  setTimeout(calculateResult, 0)
                }}
                required
                min="0"
                max="20"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Points Against *</label>
              <input
                type="number"
                value={pointsAgainst}
                onChange={(e) => {
                  setPointsAgainst(e.target.value)
                  setTimeout(calculateResult, 0)
                }}
                required
                min="0"
                max="20"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as Match['result'])}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="big_win">Big Win (15+)</option>
                <option value="small_win">Small Win</option>
                <option value="draw">Draw</option>
                <option value="small_loss">Small Loss</option>
                <option value="big_loss">Big Loss (15+ against)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Deployment Type</label>
              <input
                type="text"
                value={deploymentType}
                onChange={(e) => setDeploymentType(e.target.value)}
                placeholder="e.g., Search & Destroy"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Table Number (1-8)</label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                min="1"
                max="8"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Normal Points</label>
              <input
                type="number"
                value={normalPoints}
                onChange={(e) => setNormalPoints(e.target.value)}
                placeholder="e.g., 85-12"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Mission</label>
              <input
                type="text"
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Army List</label>
              <textarea
                value={armyList}
                onChange={(e) => setArmyList(e.target.value)}
                rows={6}
                placeholder="Enter your army list here..."
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none font-mono text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Opponent Army List</label>
              <textarea
                value={opponentArmyList}
                onChange={(e) => setOpponentArmyList(e.target.value)}
                rows={6}
                placeholder="Enter opponent's army list here..."
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('email')
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  async function updateRole(userId: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    fetchUsers()
  }

  if (loading) return <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Role</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-white">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                  user.role === 'team_member' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-zinc-500/20 text-zinc-400'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="tryout">Tryout</option>
                  <option value="team_member">Team Member</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase.from('teams').select('*').order('name')
    if (data) setTeams(data as Team[])
    setLoading(false)
  }

  async function deleteTeam(id: string) {
    if (!confirm('Are you sure you want to delete this team?')) return
    await supabase.from('teams').delete().eq('id', id)
    fetchTeams()
  }

  if (loading) return <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingTeam(null)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">No teams yet</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Team Name</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-4 py-3 text-white">{team.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingTeam(team)
                          setShowEditor(true)
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTeam(team.id)}
                        className="p-1 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <TeamEditor
          team={editingTeam}
          onClose={() => {
            setShowEditor(false)
            setEditingTeam(null)
          }}
          onSave={() => {
            setShowEditor(false)
            setEditingTeam(null)
            fetchTeams()
          }}
        />
      )}
    </div>
  )
}

function TeamEditor({
  team,
  onClose,
  onSave,
}: {
  team: Team | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(team?.name || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let error
    if (team) {
      ({ error } = await supabase.from('teams').update({ name }).eq('id', team.id))
    } else {
      ({ error } = await supabase.from('teams').insert({ name }))
    }

    setLoading(false)
    if (!error) onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">{team ? 'Edit Team' : 'Add Team'}</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Team Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Germany, France, USA"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
