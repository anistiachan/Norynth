'use client'

import React from 'react'
import { ChannelData } from './organisms/CreateChannelModal'
import { colors, borders, shadows, fonts } from '../styles/theme'

export const TAB_META = {
  general:  { label: 'General',  emoji: '🌐', desc: 'General cognitive and task processing adapter' },
  coding:   { label: 'Coding',   emoji: '💻', desc: 'Syntax analysis, logical generation and bug diagnostic mode' },
  learning: { label: 'Learning', emoji: '📚', desc: 'Knowledge structure tutor and inquiry dialogue helper' },
  planning: { label: 'Planning', emoji: '🗓', desc: 'Priority sorting, target design and schedule structuring tool' },
} as const

export type ChatTab = keyof typeof TAB_META | string

interface SidebarProps {
  activeTab: ChatTab
  setActiveTab: (tab: ChatTab) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  customChannels: ChannelData[]
  onOpenCreateModal: () => void
  onDeleteChannel: (channelId: string) => void
  apiUrl: string
  setApiUrl: (url: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  customChannels,
  onOpenCreateModal,
  onDeleteChannel,
  apiUrl,
  setApiUrl,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(28,41,60,0.45)', zIndex: 20, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          position: 'absolute',
          zIndex: 30,
          height: '100%',
          width: '256px',
          background: colors.surface,
          borderRight: borders.default,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="md:relative md:transform-none"
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: borders.default,
            background: colors.primary,
            position: 'relative',
          }}
          className="nb-stripe"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: colors.border,
                border: borders.default,
                display: 'inline-block',
              }}
              className="nb-pulse"
            />
            <h1
              style={{
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: 0,
                color: colors.text,
                fontFamily: fonts.primary,
              }}
            >
              Hermes OS
            </h1>
          </div>
          <p
            style={{
              fontSize: '10px',
              fontFamily: fonts.mono,
              color: colors.textSecondary,
              margin: '4px 0 0',
            }}
          >
            v0.1.0 // Phase 1
          </p>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: '18px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              color: colors.text,
            }}
            className="md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Nav Items */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* General Channels */}
          <div>
            <span
              style={{
                display: 'block',
                padding: '0 8px',
                marginBottom: '8px',
                fontSize: '9px',
                fontFamily: fonts.mono,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: colors.textMuted,
              }}
            >
              Default Channels
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(Object.entries(TAB_META) as [keyof typeof TAB_META, typeof TAB_META[keyof typeof TAB_META]][]).map(([tab, meta]) => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    id={`nav-${tab}`}
                    onClick={() => {
                      setActiveTab(tab)
                      setSidebarOpen(false)
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 10px',
                      background: isActive ? colors.primary : 'transparent',
                      border: isActive ? borders.default : borders.transparent,
                      boxShadow: isActive ? shadows.sm : shadows.none,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      color: colors.text,
                      fontFamily: fonts.primary,
                      textAlign: 'left',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Channels Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: colors.textMuted,
                }}
              >
                Custom Channels
              </span>
              <button
                type="button"
                onClick={onOpenCreateModal}
                style={{
                  background: colors.primary,
                  color: colors.text,
                  border: borders.sm,
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: fonts.mono,
                  cursor: 'pointer',
                  boxShadow: '1px 1px 0px #1C293C',
                }}
                title="Create a new custom channel with custom system prompt"
              >
                + ADD
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {customChannels.length === 0 ? (
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: fonts.mono,
                    color: colors.textMuted,
                    padding: '8px 10px',
                    border: borders.dashed,
                    borderRadius: '4px',
                    textAlign: 'center',
                    background: colors.background,
                  }}
                >
                  No custom channel yet.
                  <br />
                  Click <b>+ ADD</b> to create one!
                </div>
              ) : (
                customChannels.map((ch) => {
                  const isActive = activeTab === ch.id
                  return (
                    <div
                      key={ch.id}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isActive ? colors.primary : 'transparent',
                        border: isActive ? borders.default : borders.transparent,
                        boxShadow: isActive ? shadows.sm : shadows.none,
                        borderRadius: '4px',
                        padding: '4px 6px 4px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                      onClick={() => {
                        setActiveTab(ch.id)
                        setSidebarOpen(false)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '14px' }}>{ch.emoji}</span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: isActive ? 700 : 500,
                            color: colors.text,
                            fontFamily: fonts.primary,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ch.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChannel(ch.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.error,
                          fontWeight: 700,
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                        title="Delete channel"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* System Section */}
          <div>
            <span
              style={{
                display: 'block',
                padding: '0 8px',
                marginBottom: '8px',
                fontSize: '9px',
                fontFamily: fonts.mono,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: colors.textMuted,
              }}
            >
              System
            </span>
            <button
              id="nav-status"
              onClick={() => {
                setActiveTab('status')
                setSidebarOpen(false)
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                background: activeTab === 'status' ? colors.secondary : 'transparent',
                border: activeTab === 'status' ? borders.default : borders.transparent,
                boxShadow: activeTab === 'status' ? shadows.sm : shadows.none,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeTab === 'status' ? 700 : 500,
                color: activeTab === 'status' ? colors.surface : colors.text,
                fontFamily: fonts.primary,
                textAlign: 'left',
                transition: 'all 0.1s ease',
              }}
            >
              <span style={{ fontSize: '14px' }}>⚙️</span>
              <span>System Status</span>
            </button>
          </div>
        </nav>

        {/* Footer Configuration */}
        <div
          style={{
            padding: '16px',
            borderTop: borders.default,
            background: colors.surfaceElevated,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <label
            style={{
              fontSize: '9px',
              fontFamily: fonts.mono,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: colors.textMuted,
            }}
          >
            Core API URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => {
              setApiUrl(e.target.value)
              localStorage.setItem('hermes_api_url', e.target.value)
            }}
            style={{
              width: '100%',
              background: colors.surface,
              border: borders.default,
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '10px',
              fontFamily: fonts.mono,
              color: colors.text,
              outline: 'none',
            }}
          />
        </div>
      </aside>
    </>
  )
}
