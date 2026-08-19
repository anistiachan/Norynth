'use client'

import React from 'react'
import { colors, borders, shadows, fonts } from '../../styles/theme'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { background: colors.surface, color: colors.text }
      case 'danger':
        return { background: colors.error, color: colors.surface }
      case 'ghost':
        return { background: colors.surfaceElevated, color: colors.text, boxShadow: shadows.none }
      case 'primary':
      default:
        return { background: colors.primary, color: colors.text }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '4px 10px', fontSize: '10px' }
      case 'lg':
        return { padding: '10px 20px', fontSize: '13px' }
      case 'md':
      default:
        return { padding: '6px 14px', fontSize: '11px' }
    }
  }

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        border: borders.default,
        boxShadow: variant === 'ghost' ? shadows.none : shadows.sm,
        borderRadius: '4px',
        fontWeight: 800,
        fontFamily: fonts.primary,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.1s, box-shadow 0.1s',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`nb-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
