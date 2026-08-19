'use client'

import React, { useState } from 'react'
import { colors, borders, shadows, fonts } from '../styles/theme'

export interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: string
  provider?: string | null
  model?: string | null
}

interface ChatMessageProps {
  message: Message
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'USER'
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim()
        const lines = code.split('\n')
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : ''
        const codeContent = language ? lines.slice(1).join('\n') : code
        const isCopied = copiedIndex === i

        return (
          <div
            key={i}
            style={{
              margin: '12px 0',
              border: borders.default,
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: shadows.md,
              background: colors.border,
            }}
          >
            {/* Code Header with Copy Button */}
            <div
              style={{
                background: colors.primary,
                borderBottom: borders.default,
                padding: '4px 12px',
                fontSize: '10px',
                fontFamily: fonts.mono,
                fontWeight: 700,
                color: colors.text,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
              }}
            >
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {language || 'CODE'}
              </span>
              <button
                onClick={() => handleCopyCode(codeContent, i)}
                style={{
                  background: isCopied ? colors.success : colors.surface,
                  color: isCopied ? colors.surface : colors.text,
                  border: borders.sm,
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  boxShadow: '1px 1px 0px #1C293C',
                  transition: 'all 0.15s ease',
                }}
              >
                {isCopied ? 'COPIED! ✅' : '📋 COPY'}
              </button>
            </div>

            <pre
              style={{
                padding: '12px',
                overflowX: 'auto',
                whiteSpace: 'pre',
                fontFamily: fonts.mono,
                fontSize: '12px',
                color: colors.background,
                margin: 0,
              }}
            >
              <code>{codeContent}</code>
            </pre>
          </div>
        )
      }

      const inlineParts = part.split(/(`[^`\n]+`|\*\*[^*]+\*\*)/g)
      return (
        <span key={i}>
          {inlineParts.map((subPart, j) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code
                  key={j}
                  style={{
                    background: colors.surfaceElevated,
                    color: colors.secondary,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    fontFamily: fonts.mono,
                    fontSize: '11px',
                    border: '1px solid #1C293C',
                    fontWeight: 600,
                  }}
                >
                  {subPart.slice(1, -1)}
                </code>
              )
            }
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={j} style={{ fontWeight: 800 }}>{subPart.slice(2, -2)}</strong>
            }
            return subPart
          })}
        </span>
      )
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Role + Timestamp Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          fontFamily: fonts.mono,
          color: colors.textMuted,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            padding: '1px 6px',
            background: isUser ? colors.secondary : colors.primary,
            color: isUser ? colors.surface : colors.text,
            border: borders.sm,
            borderRadius: '3px',
            fontWeight: 700,
            fontSize: '9px',
            letterSpacing: '0.1em',
          }}
        >
          {isUser ? 'YOU' : 'HERMES'}
        </span>
        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Message Bubble */}
      <div
        style={{
          padding: '12px 16px',
          background: isUser ? colors.secondary : colors.surface,
          color: isUser ? colors.surface : colors.text,
          border: borders.default,
          borderRadius: '4px',
          boxShadow: shadows.md,
          fontSize: '13px',
          lineHeight: 1.65,
          fontFamily: fonts.primary,
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          width: '100%',
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          {renderMessageContent(message.content)}
        </div>
      </div>
    </div>
  )
}
