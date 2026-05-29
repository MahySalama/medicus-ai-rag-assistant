import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText, Upload, Trash2, Database, Cpu, HardDrive,
  CheckCircle2, XCircle, RefreshCw, Layers, AlertTriangle
} from 'lucide-react'
import { fetchStats, uploadDocument, deleteDocument } from '../../services/api'

function StatCard({ icon: Icon, label, value, subtext, color = 'medicus' }) {
  const colorMap = {
    medicus: 'from-medicus-500/20 to-medicus-700/10 border-medicus-500/20 text-medicus-400',
    blue: 'from-blue-500/20 to-blue-700/10 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-700/10 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/20 to-purple-700/10 border-purple-500/20 text-purple-400',
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5
      ${colorMap[color]}
      animate-fade-in
    `}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-medium mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-[var(--text-primary)]">{value}</p>
          {subtext && <p className="text-xs text-[var(--text-muted)] mt-1">{subtext}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-40" />
      </div>
    </div>
  )
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchStats()
      setStats(data)
      setError(null)
    } catch (e) {
      setError('Cannot connect to backend. Is the FastAPI server running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  const handleUpload = async (files) => {
    const file = files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }

    setUploading(true)
    setError(null)
    try {
      await uploadDocument(file)
      await loadStats()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId, filename) => {
    if (!confirm(`Delete "${filename}" and all its indexed chunks?`)) return
    try {
      await deleteDocument(docId)
      await loadStats()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Dashboard
        </h2>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Manage your knowledge base and monitor system health
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-slide-up">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm">{error}</p>
            <button onClick={loadStats} className="text-red-400 text-xs underline mt-1 hover:text-red-300">
              Retry connection
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Documents"
          value={loading ? '—' : stats?.total_documents ?? 0}
          subtext="PDFs indexed"
          color="medicus"
        />
        <StatCard
          icon={Layers}
          label="Chunks"
          value={loading ? '—' : stats?.total_chunks ?? 0}
          subtext="Vector embeddings"
          color="blue"
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={loading ? '—' : formatBytes(stats?.total_size_bytes ?? 0)}
          subtext="Total PDF size"
          color="purple"
        />
        <StatCard
          icon={Cpu}
          label="Ollama"
          value={loading ? '—' : stats?.ollama_status === 'connected' ? '●' : '○'}
          subtext={stats?.model_name || 'Checking...'}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              relative rounded-2xl border-2 border-dashed p-8 text-center
              transition-all duration-300 cursor-pointer
              ${dragOver
                ? 'border-medicus-400 bg-medicus-500/10 scale-[1.02]'
                : 'border-[var(--border-subtle)] hover:border-medicus-500/40 hover:bg-[var(--bg-card)]'
              }
              ${uploading ? 'opacity-60 pointer-events-none' : ''}
            `}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleUpload(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-3">
              {uploading ? (
                <RefreshCw className="w-10 h-10 text-medicus-400 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-[var(--text-muted)]" />
              )}
              <div>
                <p className="font-display font-semibold text-[var(--text-primary)]">
                  {uploading ? 'Processing PDF...' : 'Drop PDF here'}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {uploading
                    ? 'Extracting text, chunking, generating embeddings...'
                    : 'or click to browse • Max 50MB'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* System status */}
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-3">System Status</h3>
            <div className="space-y-2">
              <StatusRow
                label="Ollama LLM"
                ok={stats?.ollama_status === 'connected'}
                loading={loading}
              />
              <StatusRow
                label="Vector Store"
                ok={!loading && !error}
                loading={loading}
              />
              <StatusRow
                label="API Server"
                ok={!loading && !error}
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="font-display font-semibold text-[var(--text-primary)]">
                <Database className="w-4 h-4 inline-block mr-2 opacity-60" />
                Knowledge Base
              </h3>
              <button
                onClick={loadStats}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">Loading...</div>
            ) : !stats?.documents?.length ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
                <p className="text-[var(--text-muted)] text-sm">No documents yet</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">Upload a PDF to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {stats.documents.map((doc, i) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-elevated)] transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-medicus-500/10 border border-medicus-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-medicus-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.filename}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {doc.page_count} pages • {doc.chunk_count} chunks • {formatBytes(doc.size_bytes)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, ok, loading }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)] animate-spin" />
      ) : ok ? (
        <span className="flex items-center gap-1.5 text-medicus-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" /> Online
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-red-400 text-xs">
          <XCircle className="w-3.5 h-3.5" /> Offline
        </span>
      )}
    </div>
  )
}
