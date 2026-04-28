'use client'

import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  Brain,
  MessageSquare,
  Plus,
  Settings as SettingsIcon,
  Database,
  Network,
  History,
  Trash2,
  Send,
  Loader2,
  RefreshCw,
  Search,
  X,
  Check,
  AlertTriangle,
  Cpu,
} from 'lucide-react'

// Types
interface MemoryStats {
  count: number
  user_id: string
}

interface Fact {
  id: string
  subject: string
  predicate: string
  value: string
  created_at: string
}

interface HistoryItem {
  role: string
  content: string
  metadata: Record<string, unknown>
  ts: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

type Tab = 'dashboard' | 'add' | 'chat' | 'settings'

// Components
function Sidebar({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const tabs = [
    { id: 'dashboard', icon: Database, label: 'Dashboard' },
    { id: 'add', icon: Plus, label: 'Add Memory' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ]

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <Brain size={32} color="#58a6ff" />
        <span style={styles.logoText}>Stackme</span>
      </div>
      <nav style={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            style={{
              ...styles.navItem,
              ...(activeTab === tab.id ? styles.navItemActive : {}),
            }}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div style={styles.footer}>
        <span style={styles.version}>v1.0.0</span>
      </div>
    </aside>
  )
}

function Dashboard() {
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [facts, setFacts] = useState<string[]>([])
  const [graphFacts, setGraphFacts] = useState<Fact[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [countRes, factsRes, graphRes, historyRes] = await Promise.all([
        invoke<MemoryStats>('get_count'),
        invoke<{ facts: string[]; count: number }>('get_facts'),
        invoke<{ facts: Fact[]; count: number }>('get_graph'),
        invoke<{ history: HistoryItem[]; count: number }>('get_session_history', { lastN: 10 }),
      ])
      setStats(countRes)
      setFacts(factsRes.facts)
      setGraphFacts(graphRes.facts)
      setHistory(historyRes.history)
    } catch (e) {
      setError(`Failed to load data: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={40} className="spin" style={{ color: '#58a6ff' }} />
        <p>Loading memory data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertTriangle size={40} style={{ color: '#f85149' }} />
        <p>{error}</p>
        <button onClick={loadData} style={styles.retryButton}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={styles.dashboard}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Database size={24} style={{ color: '#58a6ff' }} />
          <div>
            <div style={styles.statValue}>{stats?.count || 0}</div>
            <div style={styles.statLabel}>Total Memories</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Brain size={24} style={{ color: '#a371f7' }} />
          <div>
            <div style={styles.statValue}>{facts.length}</div>
            <div style={styles.statLabel}>Stored Facts</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Network size={24} style={{ color: '#3fb950' }} />
          <div>
            <div style={styles.statValue}>{graphFacts.length}</div>
            <div style={styles.statLabel}>Knowledge Graph</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <History size={24} style={{ color: '#d29922' }} />
          <div>
            <div style={styles.statValue}>{history.length}</div>
            <div style={styles.statLabel}>Session Turns</div>
          </div>
        </div>
      </div>

      <div style={styles.sectionGrid}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Brain size={18} />
            Stored Facts
          </h3>
          <div style={styles.list}>
            {facts.length === 0 ? (
              <p style={styles.emptyText}>No facts stored yet</p>
            ) : (
              facts.map((fact, i) => (
                <div key={i} style={styles.listItem}>
                  {fact}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Network size={18} />
            Knowledge Graph
          </h3>
          <div style={styles.list}>
            {graphFacts.length === 0 ? (
              <p style={styles.emptyText}>No graph facts yet</p>
            ) : (
              graphFacts.map((fact) => (
                <div key={fact.id} style={styles.listItem}>
                  <span style={styles.graphSubject}>{fact.subject}</span>
                  <span style={styles.graphPredicate}> — {fact.predicate}: </span>
                  <span style={styles.graphValue}>{fact.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <History size={18} />
          Session History
        </h3>
        <div style={styles.historyList}>
          {history.length === 0 ? (
            <p style={styles.emptyText}>No session history</p>
          ) : (
            history.map((item, i) => (
              <div key={i} style={styles.historyItem}>
                <span
                  style={{
                    ...styles.historyRole,
                    color: item.role === 'user' ? '#58a6ff' : '#a371f7',
                  }}
                >
                  [{item.role}]
                </span>
                <span style={styles.historyContent}>{item.content}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function AddMemory() {
  const [factInput, setFactInput] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddFact = async () => {
    if (!factInput.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await invoke('add_fact', { content: factInput })
      setSuccess(`Fact added: ${factInput}`)
      setFactInput('')
    } catch (e) {
      setError(`Failed: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMessage = async () => {
    if (!messageInput.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await invoke('add_message', { content: messageInput })
      setSuccess(`Message added (facts auto-extracted)`)
      setMessageInput('')
    } catch (e) {
      setError(`Failed: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.addMemory}>
      <h2 style={styles.pageTitle}>Add Memory</h2>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Add a Fact</h3>
        <p style={styles.formDescription}>
          Store a structured fact in your long-term memory
        </p>
        <textarea
          value={factInput}
          onChange={(e) => setFactInput(e.target.value)}
          placeholder="e.g., I run a fintech startup"
          style={styles.textarea}
          rows={3}
        />
        <button
          onClick={handleAddFact}
          disabled={loading || !factInput.trim()}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            opacity: loading || !factInput.trim() ? 0.6 : 1,
          }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Plus size={18} />}
          Add Fact
        </button>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Add a Message</h3>
        <p style={styles.formDescription}>
          Add a message and Stackme will automatically extract facts from it
        </p>
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="e.g., I'm building a B2B SaaS, targeting fintech companies. My goal is to reach 10K customers."
          style={styles.textarea}
          rows={4}
        />
        <button
          onClick={handleAddMessage}
          disabled={loading || !messageInput.trim()}
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            opacity: loading || !messageInput.trim() ? 0.6 : 1,
          }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <MessageSquare size={18} />}
          Add Message (Auto-Extract)
        </button>
      </div>

      {success && (
        <div style={styles.successMessage}>
          <Check size={18} />
          {success}
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
    </div>
  )
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // Add user message to session
      await invoke('add_session_turn', { role: 'user', content: input })

      let context = ''
      if (memoryEnabled) {
        // Get relevant context from memory
        const searchResult = await invoke<{ results: string[] }>('search_memories', {
          query: input,
          topK: 5,
        })
        context = searchResult.results.join('\n\n')
      }

      // Build prompt with context
      const prompt = context
        ? `Context from memory:\n${context}\n\nUser question: ${input}\n\nPlease answer based on the context provided.`
        : input

      // Simulate AI response (in a real app, you'd call an AI API here)
      const responseText = memoryEnabled && context
        ? `Based on your stored memory:\n\n${context}\n\n---\n\nNote: This is a demo response. In production, connect to GPT-4, Claude, or another AI model.`
        : `This is a demo response. Enable memory to get contextual answers from your stored knowledge.`

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Add assistant message to session
      await invoke('add_session_turn', { role: 'assistant', content: responseText })
    } catch (e) {
      setError(`Failed: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    invoke('clear_session').catch(console.error)
  }

  return (
    <div style={styles.chat}>
      <div style={styles.chatHeader}>
        <h2 style={styles.pageTitle}>Chat with Memory</h2>
        <div style={styles.chatControls}>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={memoryEnabled}
              onChange={(e) => setMemoryEnabled(e.target.checked)}
              style={styles.checkbox}
            />
            <Brain size={16} style={{ marginRight: 6 }} />
            Memory Injection
          </label>
          <button onClick={clearChat} style={styles.iconButton} title="Clear chat">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div style={styles.chatMessages}>
        {messages.length === 0 ? (
          <div style={styles.chatEmpty}>
            <MessageSquare size={48} style={{ color: '#6e7681', marginBottom: 16 }} />
            <p>Start a conversation with your memory</p>
            <p style={styles.chatEmptyHint}>
              {memoryEnabled
                ? 'Your stored memories will be used as context'
                : 'Enable memory injection to use stored context'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.messageUser : styles.messageAssistant),
              }}
            >
              <div style={styles.messageContent}>{msg.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div style={styles.messageLoading}>
            <Loader2 size={20} className="spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <div style={styles.chatInput}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Type your message..."
          style={styles.chatInputField}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          <Send size={20} />
        </button>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
    </div>
  )
}

function Settings() {
  const [embedding, setEmbedding] = useState('sentence-transformers')
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState<'session' | 'all' | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    invoke<MemoryStats>('get_count').then((stats) => setCount(stats.count)).catch(console.error)
  }, [])

  const handleClearSession = async () => {
    setClearing('session')
    setSuccess(null)
    try {
      await invoke('clear_session')
      setSuccess('Session cleared successfully')
      // Refresh count
      const stats = await invoke<MemoryStats>('get_count')
      setCount(stats.count)
    } catch (e) {
      console.error(e)
    } finally {
      setClearing(null)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL memory? This is irreversible!')) {
      return
    }
    setClearing('all')
    setSuccess(null)
    try {
      await invoke('clear_all')
      setSuccess('All memory cleared successfully')
      setCount(0)
    } catch (e) {
      console.error(e)
    } finally {
      setClearing(null)
    }
  }

  return (
    <div style={styles.settings}>
      <h2 style={styles.pageTitle}>Settings</h2>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>
          <Cpu size={18} />
          Embedding Model
        </h3>
        <p style={styles.formDescription}>
          Choose the embedding model for semantic search
        </p>
        <select
          value={embedding}
          onChange={(e) => setEmbedding(e.target.value)}
          style={styles.select}
        >
          <option value="sentence-transformers">Sentence Transformers (default)</option>
          <option value="simple">Simple (hash-based)</option>
          <option value="openai">OpenAI Embeddings</option>
        </select>
        <p style={styles.hint}>
          Note: Model change requires app restart. Restart the app to apply changes.
        </p>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>
          <Database size={18} />
          Memory Statistics
        </h3>
        <div style={styles.statsRow}>
          <span>Total memory items:</span>
          <strong>{count ?? '...'}</strong>
        </div>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>
          <Trash2 size={18} />
          Clear Memory
        </h3>
        <p style={styles.formDescription}>
          Manage your stored memories
        </p>
        <div style={styles.buttonGroup}>
          <button
            onClick={handleClearSession}
            disabled={clearing !== null}
            style={{
              ...styles.button,
              ...styles.buttonWarning,
              opacity: clearing !== null ? 0.6 : 1,
            }}
          >
            {clearing === 'session' ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <History size={18} />
            )}
            Clear Session Only
          </button>
          <button
            onClick={handleClearAll}
            disabled={clearing !== null}
            style={{
              ...styles.button,
              ...styles.buttonDanger,
              opacity: clearing !== null ? 0.6 : 1,
            }}
          >
            {clearing === 'all' ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <Trash2 size={18} />
            )}
            Clear All Memory
          </button>
        </div>
        {success && (
          <div style={styles.successMessage}>
            <Check size={18} />
            {success}
          </div>
        )}
      </div>
    </div>
  )
}

// Main App
export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    // Check server status
    const checkServer = async () => {
      try {
        const isHealthy = await invoke<boolean>('check_server_health')
        setServerStatus(isHealthy ? 'online' : 'offline')

        if (!isHealthy) {
          // Try to start server
          await invoke('start_server')
          setTimeout(async () => {
            const isHealthy = await invoke<boolean>('check_server_health')
            setServerStatus(isHealthy ? 'online' : 'offline')
          }, 3000)
        }
      } catch {
        setServerStatus('offline')
      }
    }

    checkServer()
  }, [])

  return (
    <div style={styles.container}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab === 'dashboard' && 'Memory Dashboard'}
            {activeTab === 'add' && 'Add Memory'}
            {activeTab === 'chat' && 'Chat'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          <div style={styles.serverStatus}>
            <span
              style={{
                ...styles.statusDot,
                backgroundColor:
                  serverStatus === 'online'
                    ? '#3fb950'
                    : serverStatus === 'offline'
                    ? '#f85149'
                    : '#d29922',
              }}
            />
            {serverStatus === 'online' && 'Server Online'}
            {serverStatus === 'offline' && 'Server Offline'}
            {serverStatus === 'checking' && 'Checking...'}
          </div>
        </header>
        <div style={styles.content}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'add' && <AddMemory />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  )
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#0d1117',
  },
  sidebar: {
    width: 220,
    background: '#161b22',
    borderRight: '1px solid #30363d',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px',
    marginBottom: '30px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #58a6ff 0%, #a371f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#8b949e',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(88, 166, 255, 0.1)',
    color: '#58a6ff',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid #30363d',
  },
  version: {
    fontSize: '12px',
    color: '#6e7681',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 30px',
    borderBottom: '1px solid #30363d',
    background: '#0d1117',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#e6edf3',
  },
  serverStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#8b949e',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '30px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    color: '#8b949e',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    color: '#f85149',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#238636',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 500,
    marginTop: '16px',
  },
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#1c2128',
    borderRadius: '12px',
    border: '1px solid #30363d',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#e6edf3',
  },
  statLabel: {
    fontSize: '13px',
    color: '#8b949e',
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  section: {
    background: '#1c2128',
    borderRadius: '12px',
    border: '1px solid #30363d',
    overflow: 'hidden',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#e6edf3',
    borderBottom: '1px solid #30363d',
    background: '#161b22',
  },
  list: {
    padding: '16px 20px',
    maxHeight: '250px',
    overflow: 'auto',
  },
  listItem: {
    padding: '10px 0',
    borderBottom: '1px solid #21262d',
    color: '#e6edf3',
    fontSize: '14px',
  },
  emptyText: {
    color: '#6e7681',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  graphSubject: {
    color: '#58a6ff',
    fontWeight: 600,
  },
  graphPredicate: {
    color: '#8b949e',
  },
  graphValue: {
    color: '#a371f7',
  },
  historyList: {
    padding: '16px 20px',
    maxHeight: '300px',
    overflow: 'auto',
  },
  historyItem: {
    padding: '8px 0',
    fontSize: '13px',
  },
  historyRole: {
    fontWeight: 600,
    marginRight: '8px',
  },
  historyContent: {
    color: '#8b949e',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#e6edf3',
    marginBottom: '24px',
  },
  addMemory: {
    maxWidth: '700px',
  },
  formCard: {
    background: '#1c2128',
    borderRadius: '12px',
    border: '1px solid #30363d',
    padding: '24px',
    marginBottom: '20px',
  },
  formTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#e6edf3',
    marginBottom: '8px',
  },
  formDescription: {
    fontSize: '14px',
    color: '#8b949e',
    marginBottom: '16px',
  },
  textarea: {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#e6edf3',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '16px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
    color: '#fff',
  },
  buttonSecondary: {
    background: 'rgba(163, 113, 247, 0.15)',
    color: '#a371f7',
    border: '1px solid #a371f7',
  },
  buttonWarning: {
    background: 'rgba(210, 153, 34, 0.15)',
    color: '#d29922',
    border: '1px solid #d29922',
  },
  buttonDanger: {
    background: 'rgba(248, 81, 73, 0.15)',
    color: '#f85149',
    border: '1px solid #f85149',
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(63, 185, 80, 0.15)',
    color: '#3fb950',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '16px',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(248, 81, 73, 0.15)',
    color: '#f85149',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '16px',
  },
  chat: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 140px)',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  chatControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#8b949e',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    accentColor: '#58a6ff',
  },
  iconButton: {
    padding: '8px',
    borderRadius: '8px',
    color: '#8b949e',
    transition: 'all 0.2s',
  },
  chatMessages: {
    flex: 1,
    overflow: 'auto',
    background: '#1c2128',
    borderRadius: '12px',
    border: '1px solid #30363d',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chatEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6e7681',
    textAlign: 'center',
  },
  chatEmptyHint: {
    fontSize: '13px',
    marginTop: '8px',
  },
  message: {
    maxWidth: '80%',
    padding: '14px 18px',
    borderRadius: '12px',
    animation: 'fadeIn 0.3s ease-out',
  },
  messageUser: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
    color: '#fff',
  },
  messageAssistant: {
    alignSelf: 'flex-start',
    background: '#21262d',
    color: '#e6edf3',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  messageLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#8b949e',
    fontSize: '14px',
    padding: '8px 0',
  },
  chatInput: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  chatInputField: {
    flex: 1,
    padding: '14px 18px',
    background: '#1c2128',
    border: '1px solid #30363d',
    borderRadius: '10px',
    color: '#e6edf3',
    fontSize: '15px',
  },
  sendButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
    color: '#fff',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  settings: {
    maxWidth: '700px',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#e6edf3',
    fontSize: '14px',
    marginBottom: '12px',
  },
  hint: {
    fontSize: '13px',
    color: '#6e7681',
    fontStyle: 'italic',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    color: '#8b949e',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
}