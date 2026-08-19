'use client'

import React from 'react'
import { ChatTab, TAB_META } from './Sidebar'
import { ChannelData } from './organisms/CreateChannelModal'
import { colors, borders, shadows, fonts } from '../styles/theme'

export const MODEL_OPTIONS = [
  { id: 'norynth-combo', label: '⚡ norynth-combo (Auto Router)' },
  { id: 'z-ai/glm-5.2', label: '🧠 GLM 5.2' },
  { id: 'gpt-4o', label: '🤖 GPT-4o' },
  { id: 'claude-3.5-sonnet', label: '🚀 Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-pro', label: '💎 Gemini 1.5 Pro' },
]

interface ChatHeaderProps {
  activeTab: ChatTab
  customChannels: ChannelData[]
  selectedModel: string
  setSelectedModel: (model: string) => void
  onToggleSidebar: () => void
  onNewChat: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeTab,
  customChannels,
  selectedModel,
  setSelectedModel,
  onToggleSidebar,
  onNewChat,
}) => {
  const isDefaultTab = activeTab in TAB_META
  const customChannel = customChannels.find(c => c.id === activeTab)

  const title = isDefaultTab
    ? activeTab
    : customChannel ? `${customChannel.emoji} ${customChannel.title}` : activeTab

  const desc = isDefaultTab
    ? TAB_META[activeTab as keyof typeof TAB_META]?.desc ?? ''
    : customChannel?.desc ?? 'Custom AI Assistant Channel'

  return (
    <header
      style={{
        height: '56px',
        borderBottom: borders.default,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: colors.surface,
        flexShrink: 0,
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger for mobile */}
        <button
          id="mobile-menu-btn"
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: colors.text,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          className="md:hidden"
        >
          ☰
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                background: colors.primary,
                border: borders.default,
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: fonts.mono,
                boxShadow: shadows.sm,
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: colors.textMuted,
                fontFamily: fonts.mono,
              }}
              className="hidden sm:inline"
            >
              {desc}
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Model Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              background: colors.surface,
              color: colors.text,
              border: borders.default,
              boxShadow: shadows.sm,
              borderRadius: '4px',
              padding: '5px 10px',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: fonts.mono,
              cursor: 'pointer',
              outline: 'none',
              appearance: 'auto',
            }}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* New Chat Button */}
        <button
          id="new-chat-btn"
          onClick={onNewChat}
          style={{
            background: colors.primary,
            color: colors.text,
            border: borders.default,
            boxShadow: shadows.sm,
            borderRadius: '4px',
            padding: '5px 12px',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: fonts.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          className="nb-btn"
          title="Clear history and start a new conversation session for this topic"
        >
          <span>+</span> <span>NEW CHAT</span>
        </button>

        {/* Online Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            background: colors.surface,
            border: borders.default,
            borderRadius: '4px',
            boxShadow: shadows.sm,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: colors.success,
              display: 'inline-block',
              border: borders.sm,
            }}
            className="nb-pulse"
          />
          <span
            style={{
              fontSize: '10px',
              fontFamily: fonts.mono,
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
            className="hidden sm:inline"
          >
            ONLINE
          </span>
        </div>
      </div>
    </header>
  )
}
