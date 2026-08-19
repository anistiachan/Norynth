'use client'

import React, { useState } from 'react'
import { FormField } from '../molecules/FormField'
import { EmojiPicker } from '../molecules/EmojiPicker'
import { Input } from '../atoms/Input'
import { TextArea } from '../atoms/TextArea'
import { Button } from '../atoms/Button'
import { colors, borders, shadows, fonts } from '../../styles/theme'

export interface ChannelData {
  id: string
  title: string
  emoji: string
  desc: string
  systemPrompt: string
}

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChannel: (channel: ChannelData) => void
}

const PRESET_PROMPTS = [
  { label: '🧑‍💻 Senior Code Reviewer', prompt: 'You are an expert Senior Code Reviewer. Analyze code for performance, security flaws, clean architecture, and best practices.' },
  { label: '🎨 UI/UX Designer', prompt: 'You are a Lead Product Designer specializing in modern Neobrutalism and clean UI design systems. Guide the user in building wowed interfaces.' },
  { label: '🚀 DevOps & Infra Expert', prompt: 'You are a Cloud Infrastructure Engineer. Help user set up Docker, Kubernetes, CI/CD pipelines, and server monitoring.' },
]

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel,
}) => {
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('⚡')
  const [desc, setDesc] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const channelId = `custom-${slug}-${Date.now().toString().slice(-4)}`

    onCreateChannel({
      id: channelId,
      title: title.trim(),
      emoji,
      desc: desc.trim() || 'Custom AI Assistant Channel',
      systemPrompt: systemPrompt.trim(),
    })

    // Reset & Close
    setTitle('')
    setEmoji('⚡')
    setDesc('')
    setSystemPrompt('')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: colors.overlay,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: colors.surface,
          border: borders.default,
          borderRadius: '4px',
          boxShadow: shadows.xl,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: colors.primary,
            borderBottom: borders.default,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="nb-stripe"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>✨</span>
            <h2
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: fonts.primary,
                color: colors.text,
              }}
            >
              CREATE CUSTOM CHANNEL
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              color: colors.text,
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Emoji Selection */}
          <FormField label="Channel Icon">
            <EmojiPicker selectedEmoji={emoji} onSelectEmoji={setEmoji} />
          </FormField>

          {/* Title */}
          <FormField label="Channel Title" required hint="e.g. Code Reviewer, Marketing Assistant">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter channel title..."
              required
            />
          </FormField>

          {/* Description */}
          <FormField label="Short Description" hint="Brief overview of this channel's goal">
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Code refactoring & security audit mode"
            />
          </FormField>

          {/* System Prompt */}
          <FormField label="Custom System Prompt" hint="Instruction guiding how the AI behaves in this channel">
            <TextArea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert assistant..."
              rows={3}
            />
          </FormField>

          {/* Preset Prompts Quick Chips */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '9px', fontFamily: fonts.mono, fontWeight: 700, color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
              QUICK PRESETS:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSystemPrompt(p.prompt)}
                  style={{
                    background: colors.surfaceElevated,
                    border: borders.sm,
                    borderRadius: '3px',
                    padding: '3px 8px',
                    fontSize: '9px',
                    fontFamily: fonts.mono,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: `2px solid ${colors.surfaceElevated}` }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" disabled={!title.trim()}>
              + CREATE CHANNEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
