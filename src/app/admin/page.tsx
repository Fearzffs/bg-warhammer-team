'use client'

import { createClient } from '@/lib/supabase'
import { Player, Match, Profile, Team, Event, TeamMatch } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Trash2, Edit, X, Shield, User, UserPlus, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

type Tab = 'players' | 'matches' | 'users' | 'teams' | 'events' | 'team_matches'

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
        <TabButton
          active={activeTab === 'events'}
          onClick={() => setActiveTab('events')}
          icon={<Calendar className="w-4 h-4" />}
          label="Events"
        />
        <TabButton
          active={activeTab === 'team_matches'}
          onClick={() => setActiveTab('team_matches')}
          icon={<Shield className="w-4 h-4" />}
          label="Team Matches"
        />
      </div>

      {activeTab === 'players' && <PlayersTab />}
      {activeTab === 'matches' && <MatchesTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'teams' && <TeamsTab />}
      {activeTab === 'events' && <EventsTab />}
      {activeTab === 'team_matches' && <TeamMatchesTab />}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Role</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="px-4 py-3 text-white">{player.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{player.nickname || '-'}</td>
                  <td className="px-4 py-3 text-emerald-400">{player.army || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{player.role || '-'}</td>
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
  const [role, setRole] = useState(player?.role || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = { name, nickname: nickname || null, army: army || null, role: role || null }
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
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
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
                  user.role === 'tryout' ? 'bg-blue-500/20 text-blue-400' :
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
                  <option value="guest">Guest</option>
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

function EventsTab() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true })
    if (data) setEvents(data as Event[])
    setLoading(false)
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    fetchEvents()
  }

  if (loading) return <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">No events yet</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div>
                <h3 className="text-white font-medium">{event.title}</h3>
                <p className="text-zinc-500 text-sm">
                  {new Date(event.event_date).toLocaleDateString()}
                  {event.event_time && ` at ${event.event_time}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingEvent(event)
                    setShowEditor(true)
                  }}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-2 text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <EventEditor
          event={editingEvent}
          onClose={() => {
            setShowEditor(false)
            setEditingEvent(null)
          }}
          onSave={() => {
            setShowEditor(false)
            setEditingEvent(null)
            fetchEvents()
          }}
        />
      )}
    </div>
  )
}

function EventEditor({
  event,
  onClose,
  onSave,
}: {
  event: Event | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(event?.title || '')
  const [content, setContent] = useState(event?.content || '')
  const [eventDate, setEventDate] = useState(event?.event_date || new Date().toISOString().split('T')[0])
  const [eventTime, setEventTime] = useState(event?.event_time || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = {
      title,
      content: content || null,
      event_date: eventDate,
      event_time: eventTime || null,
    }

    let error
    if (event) {
      ({ error } = await supabase.from('events').update(data).eq('id', event.id))
    } else {
      ({ error } = await supabase.from('events').insert(data))
    }

    setLoading(false)
    if (!error) onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">{event ? 'Edit Event' : 'Add Event'}</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Team Practice, Tournament"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Event details..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Date *</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Time</label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
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
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMatches()
    fetchTeamMatches()
  }, [])

  async function fetchMatches() {
    const { data } = await supabase.from('matches').select('*').order('created_at', { ascending: false })
    if (data) setMatches(data as Match[])
    setLoading(false)
  }

  async function fetchTeamMatches() {
    const { data } = await supabase.from('team_matches').select('*').order('date', { ascending: false })
    if (data) setTeamMatches(data as TeamMatch[])
  }

  async function deleteMatch(id: string) {
    if (!confirm('Are you sure you want to delete this match?')) return
    await supabase.from('matches').delete().eq('id', id)
    fetchMatches()
  }

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
        <div className="text-center py-8 text-zinc-500">No matches yet</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Player</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Team Match</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Prediction</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Result</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {matches.map((match) => {
                const teamMatch = teamMatches.find(tm => tm.id === match.team_match_id)
                return (
                  <tr key={match.id}>
                    <td className="px-4 py-3 text-white">{match.player_id}</td>
                    <td className="px-4 py-3 text-zinc-400">{teamMatch ? `${teamMatch.opponent_team} - ${new Date(teamMatch.date).toLocaleDateString()}` : '-'}</td>
                    <td className="px-4 py-3 text-emerald-400">{match.prediction || '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">{match.result || '-'}</td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <MatchEditor
          match={editingMatch}
          teamMatches={teamMatches}
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

function MatchEditor({
  match,
  teamMatches,
  onClose,
  onSave,
}: {
  match: Match | null
  teamMatches: TeamMatch[]
  onClose: () => void
  onSave: () => void
}) {
  const [playerId, setPlayerId] = useState(match?.player_id || '')
  const [teamMatchId, setTeamMatchId] = useState(match?.team_match_id || '')
  const [prediction, setPrediction] = useState(match?.prediction || '')
  const [result, setResult] = useState(match?.result || '')
  const [mission, setMission] = useState(match?.mission || '')
  const [armyList, setArmyList] = useState(match?.army_list || '')
  const [opponentArmyList, setOpponentArmyList] = useState(match?.opponent_army_list || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = {
      player_id: playerId,
      team_match_id: teamMatchId || null,
      prediction: prediction || null,
      result: result || null,
      mission: mission || null,
      army_list: armyList || null,
      opponent_army_list: opponentArmyList || null,
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
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">{match ? 'Edit Match' : 'Add Match'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Player ID *</label>
              <input
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Team Match</label>
              <select
                value={teamMatchId}
                onChange={(e) => setTeamMatchId(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="">No Team Match</option>
                {teamMatches.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.opponent_team} - {new Date(tm.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Prediction</label>
              <select
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="">No Prediction</option>
                <option value="big_loss">Big Loss</option>
                <option value="small_loss">Small Loss</option>
                <option value="draw">Draw</option>
                <option value="small_win">Small Win</option>
                <option value="big_win">Big Win</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="">No Result</option>
                <option value="big_loss">Big Loss</option>
                <option value="small_loss">Small Loss</option>
                <option value="draw">Draw</option>
                <option value="small_win">Small Win</option>
                <option value="big_win">Big Win</option>
              </select>
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
                rows={4}
                placeholder="Enter your army list here..."
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none font-mono text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Opponent Army List</label>
              <textarea
                value={opponentArmyList}
                onChange={(e) => setOpponentArmyList(e.target.value)}
                rows={4}
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

function TeamMatchesTab() {
  const [teamMatches, setTeamMatches] = useState<TeamMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTeamMatch, setEditingTeamMatch] = useState<TeamMatch | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTeamMatches()
  }, [])

  async function fetchTeamMatches() {
    const { data } = await supabase.from('team_matches').select('*').order('date', { ascending: false })
    if (data) setTeamMatches(data as TeamMatch[])
    setLoading(false)
  }

  async function deleteTeamMatch(id: string) {
    if (!confirm('Are you sure you want to delete this team match?')) return
    await supabase.from('team_matches').delete().eq('id', id)
    fetchTeamMatches()
  }

  if (loading) return <div className="animate-pulse h-64 bg-zinc-900 rounded-xl" />

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingTeamMatch(null)
            setShowEditor(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Team Match
        </button>
      </div>

      {teamMatches.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">No team matches yet</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Opponent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Draw Diff</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {teamMatches.map((tm) => (
                <tr key={tm.id}>
                  <td className="px-4 py-3 text-white">{tm.opponent_team}</td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(tm.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-emerald-400">{tm.draw_diff ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingTeamMatch(tm)
                          setShowEditor(true)
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTeamMatch(tm.id)}
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
        <TeamMatchEditor
          teamMatch={editingTeamMatch}
          onClose={() => {
            setShowEditor(false)
            setEditingTeamMatch(null)
          }}
          onSave={() => {
            setShowEditor(false)
            setEditingTeamMatch(null)
            fetchTeamMatches()
          }}
        />
      )}
    </div>
  )
}

function TeamMatchEditor({
  teamMatch,
  onClose,
  onSave,
}: {
  teamMatch: TeamMatch | null
  onClose: () => void
  onSave: () => void
}) {
  const [opponentTeam, setOpponentTeam] = useState(teamMatch?.opponent_team || '')
  const [date, setDate] = useState(teamMatch?.date ? new Date(teamMatch.date).toISOString().split('T')[0] : '')
  const [drawDiff, setDrawDiff] = useState(teamMatch?.draw_diff?.toString() || '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = {
      opponent_team: opponentTeam,
      date: date,
      draw_diff: drawDiff ? parseInt(drawDiff) : null,
    }

    let error
    if (teamMatch) {
      ({ error } = await supabase.from('team_matches').update(data).eq('id', teamMatch.id))
    } else {
      ({ error } = await supabase.from('team_matches').insert(data))
    }

    setLoading(false)
    if (!error) onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">{teamMatch ? 'Edit Team Match' : 'Add Team Match'}</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Opponent Team *</label>
            <input
              type="text"
              value={opponentTeam}
              onChange={(e) => setOpponentTeam(e.target.value)}
              required
              placeholder="e.g., Germany, France"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Draw Difference</label>
            <input
              type="number"
              value={drawDiff}
              onChange={(e) => setDrawDiff(e.target.value)}
              placeholder="e.g., 5"
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
