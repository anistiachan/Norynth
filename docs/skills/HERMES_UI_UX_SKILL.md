# HERMES UI/UX DESIGN SKILL

## 1. Purpose

This document defines the UI/UX standards for Hermes Web.

Hermes is a personal AI operating system.

It is NOT:

- a generic chatbot clone
- an enterprise dashboard
- a marketing landing page
- a cyberpunk interface

The interface should feel:

- modern
- premium
- technical
- calm
- intelligent
- personal
- slightly futuristic
- practical

---

# 2. Design Direction

Primary aesthetic:

Refined Futuristic Technical Minimalism

The UI should feel engineered rather than decorated.

Prioritize:

1. hierarchy
2. readability
3. spacing
4. consistency
5. interaction quality
6. subtle visual identity

---

# 3. Visual Identity

The primary memorable characteristic:

"Hermes feels like a personal AI operating system."

Avoid making Hermes look like a copy of existing AI chat products.

Avoid:

- excessive gradients
- excessive purple AI aesthetics
- excessive glassmorphism
- cyberpunk
- excessive neon
- excessive cards
- excessive rounded containers
- visual clutter
- decorative elements without purpose

---

# 4. Layout

Desktop:

┌────────────┬───────────────────────────────┐
│            │                               │
│  HERMES    │ Conversation                  │
│            │                               │
│  Topics    │ Messages                      │
│            │                               │
│            │                               │
│            │ Composer                      │
└────────────┴───────────────────────────────┘

The conversation is the primary focus.

The sidebar is secondary.

---

# 5. Sidebar

Possible sections:

HERMES

GENERAL
- General
- Coding
- Learning
- Planning

SYSTEM
- Status
- Settings

Keep the sidebar simple.

Do not overload it with dashboard information.

---

# 6. Conversation

User and Hermes messages must be clearly distinguishable.

Hermes responses should prioritize readability.

Long responses should feel closer to a readable document
than a large chat bubble.

---

# 7. Composer

The composer is a primary interaction.

Requirements:

- multiline
- clear focus state
- obvious send button
- keyboard accessible
- mobile friendly

Preferred:

Enter → send

Shift + Enter → newline

Placeholder:

"Ask Hermes..."

---

# 8. Empty State

The empty state should communicate what Hermes can do.

Example:

Hermes

Your personal AI assistant.

Try:

"Review this code"

"Explain this architecture"

"Help me plan a project"

"Teach me something"

---

# 9. Loading

Use subtle feedback:

Thinking...
Working...

Avoid large distracting spinners.

---

# 10. Error

Errors should be understandable and recoverable.

Example:

Something went wrong.

Please try again.

[Retry]

Do not expose internal stack traces.

---

# 11. Typography

Use a modern readable sans-serif.

Create a clear hierarchy for:

- application name
- topic
- message
- metadata
- secondary information

Prioritize readability over decorative typography.

---

# 12. Color

Default theme:

Dark.

Use a restrained color system.

Define centralized design tokens for:

- background
- surface
- elevated surface
- border
- primary text
- secondary text
- muted text
- primary accent
- success
- warning
- error

Use one primary accent.

---

# 13. Design Tokens

Use centralized CSS variables or equivalent.

Example:

--color-background
--color-surface
--color-surface-elevated
--color-border
--color-text
--color-text-secondary
--color-text-muted
--color-primary

--radius-sm
--radius-md
--radius-lg

--space-1
--space-2
--space-3
--space-4
--space-5
--space-6

Avoid arbitrary styling values throughout components.

---

# 14. Interaction

Provide subtle:

- hover
- focus
- active
- disabled
- loading

states.

Animations should be purposeful.

Do not animate everything.

---

# 15. Responsive

Desktop:

- persistent sidebar
- spacious conversation

Mobile:

- collapsible sidebar
- full-width conversation
- accessible composer
- no unnecessary horizontal scrolling

---

# 16. Accessibility

Use:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient contrast
- appropriate ARIA attributes

Never rely only on color to communicate state.

---

# 17. Performance

Hermes may run on an Oppo A58.

Keep the Web UI lightweight.

Avoid:

- unnecessary dependencies
- unnecessary client-side JavaScript
- large assets
- excessive animation
- unnecessary polling

---

# 18. Architecture Boundary

Next.js is the presentation layer.

Correct:

Next.js
   ↓
Hermes HTTP API
   ↓
Application
   ↓
Domain
   ↓
Infrastructure

Never:

Next.js
   ↓
Prisma

Next.js
   ↓
SQLite

Next.js
   ↓
9Router

Next.js
   ↓
AI Provider

The browser must never receive private provider credentials.

---

# 19. Component Structure

Prefer reusable components:

components/

├── layout/
├── sidebar/
├── chat/
│   ├── ChatMessage
│   ├── MessageList
│   └── MarkdownRenderer
├── composer/
│   └── MessageComposer
├── status/
└── ui/

Do not create abstractions without a clear reason.

---

# 20. Design Process

Before implementing UI:

1. Understand Hermes purpose.
2. Inspect current UI.
3. Establish visual direction.
4. Define design tokens.
5. Define layout.
6. Build navigation.
7. Build conversation.
8. Build composer.
9. Build loading/error/empty states.
10. Test responsive behavior.
11. Polish.

Do not randomly add components.

---

# 21. Quality Standard

The final result should feel like:

"A polished personal AI system built by an engineer who cares
about both architecture and user experience."

It should NOT feel like:

"A generated AI dashboard template."

Prefer:

consistency > novelty

usability > decoration

restraint > visual complexity