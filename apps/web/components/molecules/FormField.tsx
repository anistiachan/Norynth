'use client'

import React from 'react'
import { Label } from '../atoms/Label'
import { colors, fonts } from '../../styles/theme'

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, hint, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
      <Label required={required}>{label}</Label>
      {children}
      {hint && (
        <span style={{ fontSize: '9px', fontFamily: fonts.mono, color: colors.textMuted }}>
          {hint}
        </span>
      )}
    </div>
  )
}
