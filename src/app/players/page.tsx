'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Player, Match, PlayerStats } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const supabase = createClient()

  const canViewStats = profile?.role === 'admin' || profile?.role === 'team_member' || profile?.role === 'tryout'

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name')
    
    if (data) {
      setPlayers(data as Player[])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-zinc-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Our Players</h1>

      {players.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">No players yet. Admins can add players from the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} canViewStats={canViewStats} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerCard({ player, canViewStats }: { player: Player; canViewStats: boolean }) {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [expanded, setExpanded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (canViewStats) {
      fetchStats()
    }
  }, [player.id, canViewStats])

  async function fetchStats() {
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('player_id', player.id)

    if (matches && matches.length > 0) {
      const m = matches as Match[]
      const totalMatches = m.length
      const totalPointsFor = m.reduce((sum, match) => sum + match.points_for, 0)
      const totalPointsAgainst = m.reduce((sum, match) => sum + match.points_against, 0)
      const bigWins = m.filter((match) => match.result === 'big_win').length
      const smallWins = m.filter((match) => match.result === 'small_win').length
      const draws = m.filter((match) => match.result === 'draw').length
      const smallLosses = m.filter((match) => match.result === 'small_loss').length
      const bigLosses = m.filter((match) => match.result === 'big_loss').length
      const wins = bigWins + smallWins
      const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

      setStats({
        total_matches: totalMatches,
        total_points_for: totalPointsFor,
        total_points_against: totalPointsAgainst,
        average_points_for: Math.round((totalPointsFor / totalMatches) * 10) / 10,
        average_points_against: Math.round((totalPointsAgainst / totalMatches) * 10) / 10,
        big_wins: bigWins,
        small_wins: smallWins,
        draws: draws,
        small_losses: smallLosses,
        big_losses: bigLosses,
        win_rate: winRate,
      })
    }
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white">{player.name}</h3>
        {player.nickname && (
          <p className="text-zinc-500 text-sm">&quot;{player.nickname}&quot;</p>
        )}
        {player.army && (
          <p className="text-emerald-400 text-sm mt-1">{player.army}</p>
        )}
        
        {canViewStats && stats && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {expanded ? 'Hide Stats' : 'View Stats'}
            </button>
            
            {expanded && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Matches</p>
                    <p className="text-white font-semibold">{stats.total_matches}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Win Rate</p>
                    <p className={`font-semibold ${stats.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.win_rate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Avg Points For</p>
                    <p className="text-white font-semibold">{stats.average_points_for}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Avg Points Against</p>
                    <p className="text-white font-semibold">{stats.average_points_against}</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-emerald-500/20 p-2 rounded">
                    <p className="text-emerald-400 font-semibold">{stats.big_wins}</p>
                    <p className="text-zinc-500">Big W</p>
                  </div>
                  <div className="bg-emerald-300/20 p-2 rounded">
                    <p className="text-emerald-300 font-semibold">{stats.small_wins}</p>
                    <p className="text-zinc-500">Small W</p>
                  </div>
                  <div className="bg-zinc-500/20 p-2 rounded">
                    <p className="text-zinc-400 font-semibold">{stats.draws}</p>
                    <p className="text-zinc-500">Draw</p>
                  </div>
                  <div className="bg-red-300/20 p-2 rounded">
                    <p className="text-red-300 font-semibold">{stats.small_losses}</p>
                    <p className="text-zinc-500">Small L</p>
                  </div>
                  <div className="bg-red-500/20 p-2 rounded">
                    <p className="text-red-400 font-semibold">{stats.big_losses}</p>
                    <p className="text-zinc-500">Big L</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
