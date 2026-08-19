'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sidebar, ChatTab } from '../components/Sidebar'
import { ChatHeader } from '../components/ChatHeader'
import { ChatMessage, Message } from '../components/ChatMessage'
import { ChatComposer } from '../components/ChatComposer'
import { StatusDashboard, HealthReport } from '../components/StatusDashboard'
import { CreateChannelModal, ChannelData } from '../components/organisms/CreateChannelModal'
import { colors, borders, shadows, fonts } from '../styles/theme'

export default function Page() {
  const [activeTab, setActiveTab] = useState<ChatTab>('general')
  const [selectedModel, setSelectedModel] = useState<string>('norynth-combo')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Custom channels state & modal
  const [customChannels, setCustomChannels] = useState<ChannelData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sessions map for New Chat feature
  const [sessions, setSessions] = useState<Record<string, string>>({})

  // Health monitoring state
  const [health, setHealth] = useState<HealthReport | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [localUptime, setLocalUptime] = useState<number | null>(null)

  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load custom channels from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('hermes_api_url')
      if (savedUrl) setApiUrl(savedUrl)

      const savedChannels = localStorage.getItem('hermes_custom_channels')
      if (savedChannels) {
        try {
          setCustomChannels(JSON.parse(savedChannels))
        } catch (e) {
          console.error('Failed to parse saved custom channels:', e)
        }
      }
    }
  }, [])

  // Save custom channels to localStorage whenever changed
  const saveCustomChannels = (newChannels: ChannelData[]) => {
    setCustomChannels(newChannels)
    localStorage.setItem('hermes_custom_channels', JSON.stringify(newChannels))
  }

  const handleCreateChannel = async (newChannel: ChannelData) => {
    const updated = [...customChannels, newChannel]
    saveCustomChannels(updated)
    setActiveTab(newChannel.id)

    // Sync to Database via backend API
    try {
      await fetch(`${apiUrl}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalUserId: 'web-user',
          externalChatId: `web-chat-${newChannel.id}`,
          title: newChannel.title,
          emoji: newChannel.emoji,
          systemPrompt: newChannel.systemPrompt,
        }),
      })
    } catch (e) {
      console.warn('Backend database sync warning for channel creation:', e)
    }
  }

  const handleDeleteChannel = (channelId: string) => {
    const updated = customChannels.filter(c => c.id !== channelId)
    saveCustomChannels(updated)
    if (activeTab === channelId) {
      setActiveTab('general')
    }
  }

  const getChatId = (tab: string) => {
    return sessions[tab] || `web-chat-${tab}`
  }

  const handleNewChat = () => {
    if (activeTab === 'status') return
    const newSessionId = `web-chat-${activeTab}-${Date.now()}`
    setSessions(prev => ({ ...prev, [activeTab]: newSessionId }))
    setMessages([])
  }

  // Realtime local uptime counter tick
  useEffect(() => {
    if (localUptime === null) return
    const timer = setInterval(() => {
      setLocalUptime(prev => (prev !== null ? prev + 1 : null))
    }, 1000)
    return () => clearInterval(timer)
  }, [localUptime])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (activeTab === 'status') {
      fetchHealth()
      return
    }

    const loadHistory = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const chatId = getChatId(activeTab)
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
  }, [activeTab, sessions, apiUrl])

  const fetchHealth = async () => {
    setHealthLoading(true)
    try {
      const res = await fetch(`${apiUrl}/health`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHealth(data)
      if (data.uptime !== undefined) setLocalUptime(data.uptime)
    } catch (err: any) {
      setHealth({ status: 'error', checks: { database: 'down', aiGateway: 'down' }, error: err.message })
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
      const chatId = getChatId(activeTab)
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalUserId: 'web-user', externalChatId: chatId, message: text })
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

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: colors.background,
        color: colors.text,
        fontFamily: fonts.primary,
        position: 'relative',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        customChannels={customChannels}
        onOpenCreateModal={() => setIsModalOpen(true)}
        onDeleteChannel={handleDeleteChannel}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
      />

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: colors.background,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {activeTab !== 'status' ? (
          <>
            {/* Header */}
            <ChatHeader
              activeTab={activeTab}
              customChannels={customChannels}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              onToggleSidebar={() => setSidebarOpen(prev => !prev)}
              onNewChat={handleNewChat}
            />

            {/* Chat Body & History */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Empty State */}
              {messages.length === 0 && !loading && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 16px',
                    textAlign: 'center',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        alignSelf: 'center',
                        padding: '10px 20px',
                        background: colors.primary,
                        border: borders.default,
                        boxShadow: shadows.lg,
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: fonts.mono,
                      }}
                    >
                      INITIALIZED // HERMES_CORE
                    </div>
                    <p style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: fonts.primary, lineHeight: 1.6 }}>
                      Your personal AI infrastructure is ready to receive instructions. Select a context from the sidebar to begin processing.
                    </p>
                    <div
                      style={{
                        padding: '16px',
                        background: colors.surface,
                        border: borders.default,
                        boxShadow: shadows.md,
                        borderRadius: '4px',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9px',
                          fontFamily: fonts.mono,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          color: colors.textMuted,
                          marginBottom: '10px',
                        }}
                      >
                        Example commands:
                      </div>
                      {[
                        '"Review the system health metrics."',
                        '"Design a deployment script for Oppo A58."',
                        '"Explain Clean Architecture dependencies."',
                      ].map((cmd, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: '11px',
                            fontFamily: fonts.mono,
                            color: colors.text,
                            padding: '6px 0',
                            borderBottom: i < 2 ? `1px solid ${colors.surfaceElevated}` : 'none',
                          }}
                        >
                          • {cmd}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: colors.surface,
                    border: borders.default,
                    boxShadow: shadows.md,
                    borderRadius: '4px',
                    alignSelf: 'flex-start',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '10px', fontFamily: fonts.mono, fontWeight: 700, color: colors.text }}>
                    HERMES THINKING
                  </span>
                  <div className="nb-loading" style={{ display: 'flex', alignItems: 'center' }}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div
                  style={{
                    background: colors.errorLight,
                    border: `2px solid ${colors.error}`,
                    boxShadow: `3px 3px 0px ${colors.error}`,
                    borderRadius: '4px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    fontFamily: fonts.mono,
                    color: colors.error,
                  }}
                >
                  <span>{errorMsg}</span>
                  <button
                    id="retry-btn"
                    onClick={() => setActiveTab(activeTab)}
                    style={{
                      background: colors.error,
                      color: colors.surface,
                      border: borders.default,
                      boxShadow: shadows.sm,
                      borderRadius: '3px',
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'transform 0.1s, box-shadow 0.1s',
                    }}
                    className="nb-btn"
                  >
                    RETRY
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <ChatComposer
              inputText={inputText}
              setInputText={setInputText}
              onSend={handleSend}
              loading={loading}
            />
          </>
        ) : (
          /* System Status View */
          <StatusDashboard
            health={health}
            healthLoading={healthLoading}
            localUptime={localUptime}
            onFetchHealth={fetchHealth}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            onBackToChat={() => setActiveTab('general')}
          />
        )}
      </main>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  )
}
