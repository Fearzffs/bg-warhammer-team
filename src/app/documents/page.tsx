'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { TeamDocument } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Trash2, ExternalLink } from 'lucide-react'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<TeamDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const { profile } = useAuth()
  const supabase = createClient()

  const isAdmin = profile?.role === 'admin'
  const canView = profile?.role === 'admin' || profile?.role === 'team_member' || profile?.role === 'tryout'

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    const { data } = await supabase
      .from('team_documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setDocuments(data as TeamDocument[])
    }
    setLoading(false)
  }

  async function deleteDocument(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    const { error } = await supabase.from('team_documents').delete().eq('id', id)
    if (!error) {
      fetchDocuments()
    }
  }

  const matrices = documents.filter((d) => d.document_type === 'matrix')
  const others = documents.filter((d) => d.document_type === 'other')

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">You need to be a team member to view documents.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Team Documents</h1>
        {isAdmin && (
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-900 rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-500">No documents yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {matrices.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Team Matrices</h2>
              <div className="space-y-3">
                {matrices.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    isAdmin={isAdmin}
                    onDelete={() => deleteDocument(doc.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Other Documents</h2>
              <div className="space-y-3">
                {others.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    isAdmin={isAdmin}
                    onDelete={() => deleteDocument(doc.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showEditor && (
        <DocumentEditor
          onClose={() => setShowEditor(false)}
          onSave={() => {
            setShowEditor(false)
            fetchDocuments()
          }}
        />
      )}
    </div>
  )
}

function DocumentCard({
  document,
  isAdmin,
  onDelete,
}: {
  document: TeamDocument
  isAdmin: boolean
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 flex-1"
      >
        <ExternalLink className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="font-medium text-white">{document.title}</p>
          <p className="text-sm text-zinc-500">
            Added {new Date(document.created_at).toLocaleDateString()}
          </p>
        </div>
      </a>
      {isAdmin && (
        <button
          onClick={onDelete}
          className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function DocumentEditor({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [documentType, setDocumentType] = useState<'matrix' | 'other'>('matrix')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('team_documents').insert({
      title,
      url,
      document_type: documentType,
    })

    setLoading(false)
    if (!error) {
      onSave()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Add Document</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Team Matrix vs Germany"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Google Doc URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://docs.google.com/..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as 'matrix' | 'other')}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="matrix">Team Matrix</option>
              <option value="other">Other</option>
            </select>
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
