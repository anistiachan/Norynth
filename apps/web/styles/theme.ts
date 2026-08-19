export const colors = {
  primary: '#FDC800',           // Neobrutalism Yellow Accent
  secondary: '#432DD7',         // Deep Purple / Indigo Accent
  border: '#1C293C',            // Dark Slate Thick Border
  text: '#1C293C',              // Main High-Contrast Text
  textSecondary: '#3D4F67',     // Secondary Text
  textMuted: '#6B7A8F',         // Muted Text & Section Labels
  background: '#FBFBF9',        // Warm Off-White Background
  surface: '#FFFFFF',           // Card & Panel Surface White
  surfaceElevated: '#F0EFEA',   // Elevated Track & Header Neutral Surface
  success: '#16A34A',           // Success Status Green
  warning: '#D97706',           // Warning Status Amber
  error: '#DC2626',             // Danger Red
  errorLight: '#FEF2F2',        // Error Light Alert Box
  overlay: 'rgba(28, 41, 60, 0.55)', // Backdrop Blur Overlay
} as const

export const shadows = {
  sm: '2px 2px 0px #1C293C',
  md: '3px 3px 0px #1C293C',
  lg: '4px 4px 0px #1C293C',
  xl: '6px 6px 0px #1C293C',
  none: 'none',
} as const

export const borders = {
  default: '2px solid #1C293C',
  sm: '1.5px solid #1C293C',
  dashed: '2px dashed #1C293C',
  transparent: '2px solid transparent',
} as const

export const fonts = {
  primary: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const

export const theme = {
  colors,
  shadows,
  borders,
  fonts,
} as const

export default theme
