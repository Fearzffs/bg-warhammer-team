'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { NewsPost } from '@/types/database'
import Link from 'next/link'

export default function Home() {
  const [recentNews, setRecentNews] = useState<NewsPost[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase
        .from('news_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(3)
      if (data) setRecentNews(data as NewsPost[])
    }
    fetchNews()
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

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <a
          href="https://discord.gg/your-invite"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-8 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-16 h-16 text-[#5865F2] mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span className="text-xl font-semibold text-white group-hover:text-[#5865F2] transition-colors">
            Join our Discord
          </span>
          <span className="text-zinc-500 mt-2">Connect with the team</span>
        </a>

        <a
          href="https://youtube.com/@your-channel"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-8 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-16 h-16 text-[#FF0000] mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="text-xl font-semibold text-white group-hover:text-[#FF0000] transition-colors">
            YouTube Channel
          </span>
          <span className="text-zinc-500 mt-2">Watch games and tutorials</span>
        </a>

        <Link
          href="/players"
          className="flex flex-col items-center p-8 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <svg className="w-16 h-16 text-emerald-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xl font-semibold text-white group-hover:text-emerald-500 transition-colors">
            Our Players
          </span>
          <span className="text-zinc-500 mt-2">View team statistics</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
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
            across Europe. Our players consistently perform at the highest levels, representing
            Bulgaria in international competitions.
          </p>
          <p className="text-zinc-400">
            Whether you&apos;re a new player looking to improve or an experienced veteran,
            our team provides training, strategy discussions, and community support.
          </p>
        </div>
      </div>
    </div>
  )
}
