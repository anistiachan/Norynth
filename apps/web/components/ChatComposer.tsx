'use client'

import React, { useRef } from 'react'
import { colors, borders, shadows, fonts } from '../styles/theme'

interface ChatComposerProps {
  inputText: string
  setInputText: (text: string) => void
  onSend: () => void
  loading: boolean
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  inputText,
  setInputText,
  onSend,
  loading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div
      style={{
        padding: '16px 24px',
        borderTop: borders.default,
        background: colors.surface,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          border: borders.default,
          borderRadius: '4px',
          boxShadow: shadows.md,
          background: colors.background,
          overflow: 'hidden',
          transition: 'box-shadow 0.15s ease',
        }}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hermes anything..."
          rows={2}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '12px 16px',
            fontSize: '13px',
            fontFamily: fonts.primary,
            color: colors.text,
            lineHeight: 1.6,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '10px 12px',
            gap: '6px',
            alignItems: 'flex-end',
            borderLeft: borders.default,
            background: colors.surfaceElevated,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontFamily: fonts.mono,
              color: colors.textMuted,
              whiteSpace: 'nowrap',
            }}
            className="hidden sm:inline"
          >
            ↵ Send&nbsp;&nbsp;⇧↵ New Line
          </span>
          <button
            id="send-btn"
            onClick={onSend}
            disabled={!inputText.trim() || loading}
            style={{
              background: inputText.trim() && !loading ? colors.primary : colors.surfaceElevated,
              color: colors.text,
              border: borders.default,
              boxShadow: inputText.trim() && !loading ? shadows.sm : shadows.none,
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: fonts.primary,
              cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: !inputText.trim() || loading ? 0.5 : 1,
              transition: 'transform 0.1s, box-shadow 0.1s, background 0.1s',
              whiteSpace: 'nowrap',
            }}
            className="nb-btn"
          >
            SEND →
          </button>
        </div>
      </div>
    </div>
  )
}
