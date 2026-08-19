'use client'

import React from 'react'
import { colors, borders, shadows, fonts } from '../../styles/theme'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea: React.FC<TextAreaProps> = ({ style, className = '', ...props }) => {
  return (
    <textarea
      style={{
        width: '100%',
        background: colors.surface,
        border: borders.default,
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '12px',
        fontFamily: fonts.mono,
        color: colors.text,
        outline: 'none',
        resize: 'vertical',
        minHeight: '80px',
        boxShadow: shadows.sm,
        transition: 'box-shadow 0.15s ease',
        ...style,
      }}
      className={`nb-input ${className}`}
      {...props}
    />
  )
}
