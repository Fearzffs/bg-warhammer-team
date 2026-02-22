'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { NewsPost, Event } from '@/types/database'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsPost[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekStr = nextWeek.toISOString().split('T')[0]
      
      const [newsRes, eventsRes] = await Promise.all([
        supabase.from('news_posts').select('*').order('published_at', { ascending: false }).limit(3),
        supabase.from('events').select('*').gte('event_date', todayStr).lte('event_date', nextWeekStr).order('event_date', { ascending: true }).limit(5)
      ])
      
      if (newsRes.data) setRecentNews(newsRes.data as NewsPost[])
      if (eventsRes.data) setUpcomingEvents(eventsRes.data as Event[])
    }
    fetchData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-4">
          Bulgarian Warhammer 40k Team
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          The official hub for Bulgaria&apos;s competitive Warhammer 40k players
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 mb-16">
        <a
          href="https://discord.gg/wbwYc2b3KG"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-12 h-12 text-[#5865F2] mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span className="text-lg font-semibold text-white group-hover:text-[#5865F2] transition-colors">
            Discord
          </span>
        </a>

        <a
          href="https://www.youtube.com/@TeamBulgaria40k"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-12 h-12 text-[#FF0000] mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="text-lg font-semibold text-white group-hover:text-[#FF0000] transition-colors">
            YouTube
          </span>
        </a>

        <a
          href="https://www.instagram.com/teambulgaria40k"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-12 h-12 text-[#E4405F] mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="text-lg font-semibold text-white group-hover:text-[#E4405F] transition-colors">
            Instagram
          </span>
        </a>

        <a
          href="https://www.facebook.com/share/1ByseEHS3d/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-12 h-12 text-[#1877F2] mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-lg font-semibold text-white group-hover:text-[#1877F2] transition-colors">
            Facebook
          </span>
        </a>

        <Link
          href="/players"
          className="flex flex-col items-center p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-12 h-12 text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">
            Players
          </span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Latest News</h2>
          {recentNews.length > 0 ? (
            <div className="space-y-4">
              {recentNews.map((post) => (
                <Link
                  key={post.id}
                  href={`/news`}
                  className="block p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <h3 className="font-semibold text-white">{post.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {new Date(post.published_at).toLocaleDateString()}
                    {post.is_meta_post && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                        Meta Report
                      </span>
                    )}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No news yet. Check back soon!</p>
          )}
          <Link
            href="/news"
            className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View all news →
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">About Our Team</h2>
          <p className="text-zinc-400 mb-4">
            We are Bulgaria&apos;s top competitive Warhammer 40k team, competing in team events
            across the world. Our players consistently perform at the highest levels, representing
            Bulgaria in international competitions.
          </p>
          <p className="text-zinc-400">
            Whether you&apos;re a new player looking to improve or an experienced veteran,
            our team provides training, strategy discussions, and community support.
          </p>
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 text-emerald-400" />
              Upcoming Events
            </h2>
            <Link href="/calendar" className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
              View Calendar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-zinc-700 p-5 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-emerald-500/20 rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {event.title}
                </h3>
                {event.event_time && (
                  <p className="text-zinc-500 text-sm mt-1">
                    {event.event_time}
                  </p>
                )}
                {event.content && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                    {event.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
