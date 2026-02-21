'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { NewsPost } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Plus, Trash2, Edit } from 'lucide-react'

export default function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const { profile } = useAuth()
  const supabase = createClient()

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    fetchNews()
  }, [])

  async function fetchNews() {
    const { data } = await supabase
      .from('news_posts')
      .select('*')
      .order('published_at', { ascending: false })
    
    if (data) {
      setNews(data as NewsPost[])
    }
    setLoading(false)
  }

  async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    const { error } = await supabase.from('news_posts').delete().eq('id', id)
    if (!error) {
      fetchNews()
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-zinc-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">News</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingPost(null)
              setShowEditor(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        )}
      </div>

      {news.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">No news posts yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((post) => (
            <article
              key={post.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{post.title}</h2>
                    {post.is_meta_post && (
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded">
                        Meta Report
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-sm mb-4">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingPost(post)
                        setShowEditor(true)
                      }}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showEditor && (
        <NewsEditor
          post={editingPost}
          onClose={() => {
            setShowEditor(false)
            setEditingPost(null)
          }}
          onSave={() => {
            setShowEditor(false)
            setEditingPost(null)
            fetchNews()
          }}
        />
      )}
    </div>
  )
}

function NewsEditor({
  post,
  onClose,
  onSave,
}: {
  post: NewsPost | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [isMetaPost, setIsMetaPost] = useState(post?.is_meta_post || false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    
    const postData = {
      title,
      content,
      is_meta_post: isMetaPost,
      author_id: user.id,
    }

    let error
    if (post) {
      ({ error } = await supabase.from('news_posts').update(postData).eq('id', post.id))
    } else {
      ({ error } = await supabase.from('news_posts').insert(postData))
    }

    setLoading(false)
    if (!error) {
      onSave()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">
            {post ? 'Edit Post' : 'New Post'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isMetaPost"
              checked={isMetaPost}
              onChange={(e) => setIsMetaPost(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isMetaPost" className="text-sm text-zinc-400">
              This is a Meta Report
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
