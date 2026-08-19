'use client'

import React from 'react'
import { colors, borders, shadows, fonts } from '../styles/theme'

export interface HealthReport {
  status: string
  uptime?: number
  checks?: {
    database: string
    aiGateway: string
  }
  error?: string
}

interface StatusDashboardProps {
  health: HealthReport | null
  healthLoading: boolean
  localUptime: number | null
  onFetchHealth: () => void
  onToggleSidebar: () => void
  onBackToChat: () => void
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  health,
  healthLoading,
  localUptime,
  onFetchHealth,
  onToggleSidebar,
  onBackToChat,
}) => {
  const formatUptime = (s: number) =>
    `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${Math.floor(s % 60)}s`

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        fontFamily: fonts.mono,
      }}
    >
      {/* Status Header */}
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            id="mobile-status-menu-btn"
            onClick={onToggleSidebar}
            style={{
              background: colors.surfaceElevated,
              border: borders.default,
              cursor: 'pointer',
              fontSize: '16px',
              color: colors.text,
              padding: '4px 10px',
              borderRadius: '4px',
              boxShadow: shadows.sm,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontFamily: fonts.primary,
            }}
            className="md:hidden"
          >
            ☰ <span>Menu</span>
          </button>

          <span
            style={{
              padding: '4px 12px',
              background: colors.secondary,
              color: colors.surface,
              border: borders.default,
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: shadows.sm,
            }}
          >
            ⚙️ SYSTEM STATUS
          </span>
        </div>

        {/* Back to Chat Button */}
        <button
          id="back-to-chat-btn"
          onClick={onBackToChat}
          style={{
            background: colors.primary,
            color: colors.text,
            border: borders.default,
            boxShadow: shadows.sm,
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: fonts.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          className="nb-btn"
        >
          ← BACK TO CHAT
        </button>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              borderBottom: borders.default,
            }}
          >
            <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
              Real-time status diagnostics for the Hermes monolith
            </p>
            <button
              id="diagnostics-btn"
              onClick={onFetchHealth}
              disabled={healthLoading}
              style={{
                background: colors.primary,
                border: borders.default,
                boxShadow: shadows.sm,
                borderRadius: '4px',
                padding: '7px 16px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: fonts.primary,
                cursor: healthLoading ? 'not-allowed' : 'pointer',
                opacity: healthLoading ? 0.55 : 1,
                flexShrink: 0,
                marginLeft: '16px',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              className="nb-btn"
            >
              {healthLoading ? 'SCANNING...' : 'RUN DIAGNOSTICS'}
            </button>
          </div>

          {/* Cards Grid */}
          {health ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {/* System Integrity Card */}
              <div
                style={{
                  background: colors.surface,
                  border: borders.default,
                  boxShadow: shadows.lg,
                  borderRadius: '4px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.textMuted }}>
                  SYSTEM INTEGRITY
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: health.status === 'ok' ? colors.success : colors.error,
                      border: borders.default,
                      display: 'inline-block',
                    }}
                    className={health.status === 'ok' ? 'nb-pulse' : ''}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '14px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: health.status === 'ok' ? colors.success : colors.error,
                    }}
                  >
                    {health.status === 'ok' ? 'OPTIMAL' : 'CRITICAL'}
                  </span>
                </div>
                {health.error && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: colors.error,
                      background: colors.errorLight,
                      border: `1.5px solid ${colors.error}`,
                      borderRadius: '3px',
                      padding: '8px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {health.error}
                  </div>
                )}
              </div>

              {/* Uptime Card */}
              <div
                style={{
                  background: colors.surface,
                  border: borders.default,
                  boxShadow: shadows.lg,
                  borderRadius: '4px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.textMuted }}>
                  UPTIME METRIC
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
                  {localUptime !== null ? formatUptime(localUptime) : 'N/A'}
                </div>
                <div style={{ fontSize: '9px', color: colors.textMuted }}>// core engine duration since launch</div>
              </div>

              {/* Database Card */}
              <div
                style={{
                  background: colors.surface,
                  border: borders.default,
                  boxShadow: shadows.lg,
                  borderRadius: '4px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.textMuted }}>
                  DATABASE CONNECTIVITY
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: health.checks?.database === 'ok' ? colors.success : colors.error,
                      border: borders.default,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '13px' }}>
                    {health.checks?.database === 'ok' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: colors.textMuted }}>// SQLite connection persistence</div>
              </div>

              {/* AI Routing Node Card */}
              <div
                style={{
                  background: colors.surface,
                  border: borders.default,
                  boxShadow: shadows.lg,
                  borderRadius: '4px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.textMuted }}>
                  AI ROUTING NODE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: health.checks?.aiGateway === 'ok' ? colors.success : colors.error,
                      border: borders.default,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '13px' }}>
                    {health.checks?.aiGateway === 'ok' ? 'Connected' : 'Unreachable'}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: colors.textMuted }}>// 9Router inference server connection</div>
              </div>
            </div>
          ) : (
            <div
              style={{
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                color: colors.textMuted,
              }}
            >
              {healthLoading ? (
                <>
                  <div className="nb-loading" style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ background: colors.primary }} />
                    <span style={{ background: colors.secondary }} />
                    <span style={{ background: colors.primary }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    DIAGNOSTIC AGENT RUNNING...
                  </span>
                  <span style={{ fontSize: '10px' }}>Querying DB and AI routing providers</span>
                </>
              ) : (
                <div
                  style={{
                    padding: '16px 24px',
                    border: borders.dashed,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  NO DIAGNOSTIC LOG RECORDED.
                  <br />
                  TRIGGER SCAN TO COMMENCE.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
