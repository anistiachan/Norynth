'use client'

import React from 'react'
import { colors, borders, shadows } from '../../styles/theme'

const EMOJI_LIST = ['⚡', '🚀', '🧠', '💻', '🎨', '📈', '🔒', '🧪', '🤖', '📊', '🌐', '🛠️']

interface EmojiPickerProps {
  selectedEmoji: string
  onSelectEmoji: (emoji: string) => void
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, onSelectEmoji }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0 12px' }}>
      {EMOJI_LIST.map((emoji) => {
        const isSelected = selectedEmoji === emoji
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            style={{
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              background: isSelected ? colors.primary : colors.surface,
              border: borders.default,
              borderRadius: '4px',
              boxShadow: isSelected ? shadows.sm : '1px 1px 0px #1C293C',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
            }}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
