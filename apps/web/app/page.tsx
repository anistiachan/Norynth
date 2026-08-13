'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: string
  provider?: string | null
  model?: string | null
}

interface HealthReport {
  status: string
  uptime?: number
  checks?: {
    database: string
    aiGateway: string
  }
  error?: string
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<'general' | 'coding' | 'learning' | 'planning' | 'status'>('general')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Health monitoring state
  const [health, setHealth] = useState<HealthReport | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [localUptime, setLocalUptime] = useState<number | null>(null)

  // API base URL configuration (can be changed dynamically or read from env)
  const [apiUrl, setApiUrl] = useState('http://localhost:3000')

  // Realtime local uptime counter tick
  useEffect(() => {
    if (localUptime === null) return
    const timer = setInterval(() => {
      setLocalUptime(prev => (prev !== null ? prev + 1 : null))
    }, 1000)
    return () => clearInterval(timer)
  }, [localUptime])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('hermes_api_url')
      if (savedUrl) setApiUrl(savedUrl)
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Load chat history when active tab changes
  useEffect(() => {
    if (activeTab === 'status') {
      fetchHealth()
      return
    }

    const loadHistory = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const chatId = `web-chat-${activeTab}`
        const res = await fetch(`${apiUrl}/api/chat/history?externalUserId=web-user&externalChatId=${chatId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setMessages(data.messages || [])
      } catch (err: any) {
        setErrorMsg(`Failed to load chat history: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [activeTab, apiUrl])

  const fetchHealth = async () => {
    setHealthLoading(true)
    try {
      const res = await fetch(`${apiUrl}/health`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHealth(data)
      if (data.uptime !== undefined) {
        setLocalUptime(data.uptime)
      }
    } catch (err: any) {
      setHealth({
        status: 'error',
        checks: { database: 'down', aiGateway: 'down' },
        error: err.message
      })
      setLocalUptime(null)
    } finally {
      setHealthLoading(false)
    }
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || loading) return

    setInputText('')
    setErrorMsg(null)
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const chatId = `web-chat-${activeTab}`
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalUserId: 'web-user',
          externalChatId: chatId,
          message: text
        })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: 'ASSISTANT',
        content: data.response || 'Unexpected empty response',
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setErrorMsg(`Failed to get response: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Helper to format code blocks and bold text simply without heavy markdown parser
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim()
        const lines = code.split('\n')
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : ''
        const codeContent = language ? lines.slice(1).join('\n') : code

        return (
          <div key={i} className="my-3 border border-border rounded overflow-hidden bg-black/40 font-mono text-xs">
            {language && (
              <div className="bg-surface border-b border-border px-3 py-1.5 text-text-muted flex justify-between items-center select-none uppercase tracking-wider text-[10px] font-semibold">
                {language}
              </div>
            )}
            <pre className="p-3 overflow-x-auto whitespace-pre font-mono text-zinc-300">
              <code>{codeContent}</code>
            </pre>
          </div>
        )
      }

      // Inline code and basic bold/italic formatting
      const inlineParts = part.split(/(`[^`\n]+`|\*\*[^*]+\*\*)/g)
      return (
        <span key={i}>
          {inlineParts.map((subPart, j) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={j} className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded font-mono text-xs border border-zinc-700/50">
                  {subPart.slice(1, -1)}
                </code>
              )
            }
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={j} className="font-semibold text-text">{subPart.slice(2, -2)}</strong>
            }
            return subPart
          })}
        </span>
      )
    })
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text select-none relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`absolute md:relative z-30 h-full w-64 bg-surface border-r border-border flex flex-col shrink-0 select-none transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-border flex flex-col gap-1 relative">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h1 className="text-sm font-semibold tracking-wider uppercase font-mono">Hermes OS</h1>
          </div>
          <p className="text-[10px] text-text-muted font-mono">v0.1.0 // Phase 1</p>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute top-6 right-4 text-text-muted hover:text-text md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Topics */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div>
            <span className="px-3 text-[10px] uppercase font-mono tracking-widest text-text-muted block mb-2">General</span>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('general'); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition duration-150 font-mono ${
                  activeTab === 'general' ? 'bg-surface-elevated text-primary border-l-2 border-primary font-semibold' : 'text-text-secondary hover:bg-surface-elevated/50'
                }`}
              >
                <span>🌐</span> General
              </button>
              <button
                onClick={() => { setActiveTab('coding'); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition duration-150 font-mono ${
                  activeTab === 'coding' ? 'bg-surface-elevated text-primary border-l-2 border-primary font-semibold' : 'text-text-secondary hover:bg-surface-elevated/50'
                }`}
              >
                <span>💻</span> Coding
              </button>
              <button
                onClick={() => { setActiveTab('learning'); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition duration-150 font-mono ${
                  activeTab === 'learning' ? 'bg-surface-elevated text-primary border-l-2 border-primary font-semibold' : 'text-text-secondary hover:bg-surface-elevated/50'
                }`}
              >
                <span>📚</span> Learning
              </button>
              <button
                onClick={() => { setActiveTab('planning'); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition duration-150 font-mono ${
                  activeTab === 'planning' ? 'bg-surface-elevated text-primary border-l-2 border-primary font-semibold' : 'text-text-secondary hover:bg-surface-elevated/50'
                }`}
              >
                <span>🗓️</span> Planning
              </button>
            </div>
          </div>

          <div>
            <span className="px-3 text-[10px] uppercase font-mono tracking-widest text-text-muted block mb-2">System</span>
            <button
              onClick={() => { setActiveTab('status'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition duration-150 font-mono ${
                activeTab === 'status' ? 'bg-surface-elevated text-primary border-l-2 border-primary font-semibold' : 'text-text-secondary hover:bg-surface-elevated/50'
              }`}
            >
              <span>⚙️</span> System Status
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
          <label className="text-[9px] uppercase font-mono text-text-muted">Core API URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => {
              setApiUrl(e.target.value)
              localStorage.setItem('hermes_api_url', e.target.value)
            }}
            className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-[10px] font-mono focus:outline-none focus:border-primary text-text-secondary"
          />
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col bg-background relative overflow-hidden select-text w-full">
        {activeTab !== 'status' ? (
          <>
            {/* Chat Header */}
            <header className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-surface/40 select-none shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-text-muted hover:text-text p-1"
                >
                  ☰
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                    {activeTab} channel
                  </span>
                  <span className="hidden sm:block text-[10px] text-text-muted font-mono truncate max-w-xs md:max-w-md">
                    {activeTab === 'general' && 'General cognitive and task processing adapter'}
                    {activeTab === 'coding' && 'Syntax analysis, logical generation and bug diagnostic mode'}
                    {activeTab === 'learning' && 'Knowledge structure tutor and inquiry dialogue helper'}
                    {activeTab === 'planning' && 'Priority sorting, target design and schedule structuring tool'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-text-muted font-mono flex items-center gap-1.5 bg-surface-elevated px-2 py-1 rounded border border-border shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> <span className="hidden sm:inline">ONLINE</span>
                </span>
              </div>
            </header>

            {/* Messages History */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
              {messages.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-8 select-none">
                  <div className="max-w-md space-y-4">
                    <h3 className="text-sm font-semibold font-mono tracking-wide uppercase text-primary">INITIALIZED // HERMES_CORE</h3>
                    <p className="text-xs text-text-secondary font-mono leading-relaxed">
                      Your personal AI infrastructure is ready to receive instructions. Select a context from the sidebar to begin processing.
                    </p>
                    <div className="p-4 bg-surface border border-border rounded text-[11px] font-mono text-left space-y-2 text-text-secondary">
                      <div className="text-text-muted uppercase text-[9px] mb-1 tracking-wider">Example commands:</div>
                      <div>• "Review the system health metrics."</div>
                      <div>• "Design a deployment script for Oppo A58."</div>
                      <div>• "Explain Clean Architecture dependencies."</div>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-1.5 max-w-[95%] sm:max-w-[85%] ${
                    msg.role === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono select-none">
                    <span>{msg.role === 'USER' ? 'USER' : 'HERMES'}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-3 text-xs leading-relaxed overflow-hidden break-words w-full ${
                      msg.role === 'USER'
                        ? 'bg-primary/10 text-text border border-primary/20'
                        : 'bg-surface-elevated/40 text-text-secondary border border-border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap w-full max-w-full overflow-hidden">{renderMessageContent(msg.content)}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono pl-2 select-none animate-pulse">
                  <span>●</span>
                  <span>THINKING...</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-error/10 border border-error/20 rounded p-3 text-xs font-mono text-error flex justify-between items-center">
                  <span>{errorMsg}</span>
                  <button
                    onClick={() => setActiveTab(activeTab)}
                    className="bg-error/20 hover:bg-error/30 text-error px-2 py-1 rounded text-[10px] uppercase font-semibold shrink-0 ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="p-4 sm:p-6 border-t border-border bg-surface/20 select-none shrink-0">
              <div className="relative border border-border rounded bg-background focus-within:border-primary/50 transition-colors flex">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Hermes..."
                  rows={2}
                  className="w-full bg-transparent border-0 outline-none resize-none px-4 py-3 text-xs text-text placeholder-text-muted focus:ring-0 font-mono leading-relaxed"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <span className="hidden sm:inline text-[9px] text-text-muted font-mono">Enter to Send // Shift+Enter</span>
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || loading}
                    className="h-7 px-3 bg-surface-elevated hover:bg-primary/20 text-text hover:text-primary border border-border rounded text-[10px] font-mono tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Status Dashboard */
          <div className="flex-1 flex flex-col h-full w-full font-mono text-xs text-text-secondary select-none">
            <header className="h-14 border-b border-border px-4 sm:px-6 flex items-center gap-3 bg-surface/40 select-none shrink-0">
               <button 
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-text-muted hover:text-text p-1"
                >
                  ☰
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary">SYSTEM STATUS CHECK</span>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="max-w-4xl space-y-8 w-full">
                <div className="flex justify-between items-center border-b border-border pb-4 w-full">
                  <div>
                    <p className="text-[10px] text-text-muted mt-1">Real-time status diagnostics for the Hermes monolith</p>
                  </div>
                  <button
                    onClick={fetchHealth}
                    disabled={healthLoading}
                    className="px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated/70 border border-border rounded text-[10px] transition disabled:opacity-50 shrink-0 ml-4"
                  >
                    {healthLoading ? 'SCANNING...' : 'DIAGNOSTICS'}
                  </button>
                </div>

                {health ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                    {/* Status Card */}
                    <div className="bg-surface border border-border rounded p-4 sm:p-5 space-y-4">
                      <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">SYSTEM INTEGRITY</div>
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${health.status === 'ok' ? 'bg-success animate-pulse' : 'bg-error'}`} />
                        <span className="font-semibold text-text uppercase tracking-wider">{health.status === 'ok' ? 'OPTIMAL' : 'CRITICAL_ERROR'}</span>
                      </div>
                      {health.error && (
                        <div className="text-[10px] text-error bg-error/15 border border-error/25 p-2 rounded whitespace-pre-wrap break-all">
                          {health.error}
                        </div>
                      )}
                    </div>

                  {/* Uptime Card */}
                  <div className="bg-surface border border-border rounded p-4 sm:p-5 space-y-3">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">UPTIME METRIC</div>
                    <div className="text-lg sm:text-xl font-bold text-text">
                      {localUptime !== null ? (
                        `${Math.floor(localUptime / 3600)}h ${Math.floor((localUptime % 3600) / 60)}m ${Math.floor(localUptime % 60)}s`
                      ) : (
                        'N/A'
                      )}
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">// core engine duration since launch</div>
                  </div>

                  {/* Database Card */}
                  <div className="bg-surface border border-border rounded p-4 sm:p-5 space-y-3">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">DATABASE CONNECTIVITY</div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${health.checks?.database === 'ok' ? 'bg-success' : 'bg-error'}`} />
                      <span className="text-text font-bold uppercase">{health.checks?.database === 'ok' ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">// SQLite connection persistence</div>
                  </div>

                  {/* 9Router Status Card */}
                  <div className="bg-surface border border-border rounded p-4 sm:p-5 space-y-3">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">AI ROUTING NODE</div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${health.checks?.aiGateway === 'ok' ? 'bg-success' : 'bg-error'}`} />
                      <span className="text-text font-bold uppercase">
                        {health.checks?.aiGateway === 'ok' ? 'Connected' : 'Unreachable'}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">// 9Router inference server connection</div>
                  </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col justify-center items-center text-text-muted text-center p-4">
                    {healthLoading ? (
                      <div className="animate-pulse flex flex-col items-center gap-2">
                        <span>⚡ DIAGNOSTIC AGENT RUNNING...</span>
                        <span className="text-[10px] text-zinc-600">Querying DB and AI routing providers</span>
                      </div>
                    ) : (
                      <span>NO DIAGNOSTIC LOG RECORDED. TRIGGER SCAN TO COMMENCE.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
