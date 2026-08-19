'use client'

import React from 'react'
import { colors, fonts } from '../../styles/theme'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label: React.FC<LabelProps> = ({ children, required, style, ...props }) => {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '10px',
        fontFamily: fonts.mono,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: colors.text,
        marginBottom: '4px',
        ...style,
      }}
      {...props}
    >
      {children} {required && <span style={{ color: colors.error }}>*</span>}
    </label>
  )
}
