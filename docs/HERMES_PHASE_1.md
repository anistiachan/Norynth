# HERMES — PHASE 1

## 1. Vision

Hermes is a personal AI agent and personal AI infrastructure
designed for low-cost experimentation.

The initial goal is to build a useful personal AI assistant
that can be accessed remotely through messaging interfaces
and a web dashboard.

The system should prioritize:

- low operating cost
- modularity
- portability
- maintainability
- experimentation
- personal use

Hermes is NOT designed as an enterprise system in Phase 1.

---

# 2. Phase 1 Goals

Phase 1 establishes the foundation of Hermes.

Required capabilities:

- Personal AI agent
- Hermes Core
- Telegram interface
- Web dashboard
- AI model routing through 9Router
- Conversation persistence
- SQLite database
- Basic system monitoring
- Structured logging
- Error handling
- Graceful shutdown
- Configurable AI providers/models

---

# 3. High-Level Architecture

The system follows a modular monolith architecture.

                    HERMES CORE
                         │
              ┌──────────┼──────────┐
              │          │          │
          Telegram     Signal     HTTP API
                                    │
                                    ▼
                                 Next.js

Hermes Core is the heart of the system.

Interfaces are adapters around Hermes Core.

Next.js is a presentation layer.

Telegram and Signal must not contain Hermes business logic.

---

# 4. Hermes Core

Hermes Core contains the actual application logic.

Responsibilities include:

- agent orchestration
- conversation management
- AI interaction
- model selection
- persistence coordination
- health monitoring
- configuration
- logging

Hermes Core must NOT depend on:

- Next.js
- React
- Telegram-specific business logic
- Signal-specific business logic
- a specific database implementation
- a specific AI provider

---

# 5. Architecture Layers

Use the following logical layers:

Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure

## Domain

Contains:

- entities
- value objects
- domain rules
- domain interfaces

Domain must remain independent from infrastructure.

## Application

Contains:

- use cases
- application services
- orchestration of domain operations

Examples:

- SendMessage
- CreateConversation
- GetConversation
- ListConversations
- GetSystemHealth

## Infrastructure

Contains implementations for:

- Prisma
- SQLite
- 9Router
- Telegram
- Signal
- system monitoring
- logging
- external services

## Presentation

Contains:

- HTTP API
- Telegram handlers
- Signal handlers

Presentation should translate external input into application
use cases.

---

# 6. AI Architecture

Hermes must not be tightly coupled to one AI provider.

AI requests should use an abstraction.

Hermes Core
    ↓
AI Service
    ↓
Provider / Router abstraction
    ↓
9Router
    ↓
Configured AI model

Potential model categories:

- general
- coding
- fallback
- future content models

Models must be configurable.

Do not hard-code provider credentials.

Do not implement the Phase 2 content pipeline.

---

# 7. 9Router

9Router is the AI routing layer.

Hermes should communicate with 9Router through an abstraction.

The rest of the application should not need to know
the implementation details of individual models.

This allows models to be changed without changing
the Hermes Core architecture.

---

# 8. Database

Phase 1 uses:

SQLite + Prisma

SQLite is selected because the initial deployment target
is a personal Android server.

Database access must be isolated from the Domain layer.

The application should avoid SQLite-specific business logic.

The architecture should allow a future migration:

SQLite
    ↓
PostgreSQL

Do NOT implement PostgreSQL deployment in Phase 1.

---

# 9. Initial Domain Concepts

Potential concepts include:

- Conversation
- Message
- Topic
- AI Model
- AI Provider
- System Health

Only implement concepts actually required by Phase 1.

Avoid unnecessary domain complexity.

---

# 10. Telegram

Telegram is a primary interface.

Flow:

Telegram
    ↓
Telegram Adapter
    ↓
Hermes Application
    ↓
AI Service
    ↓
9Router
    ↓
AI Model
    ↓
Hermes
    ↓
Telegram

Telegram handlers must remain thin.

Telegram must not contain business logic.

---

# 11. Signal

Signal is a planned additional interface.

It should follow the same architecture:

Signal
    ↓
Signal Adapter
    ↓
Hermes Application

Signal is optional in the initial implementation.

If the integration is not practical or stable,
do not block Phase 1 on Signal.

---

# 12. Next.js Web Dashboard

Next.js is the official Web UI framework.

Next.js is a presentation/interface layer.

It is NOT Hermes Core.

Correct:

Browser
    ↓
Next.js
    ↓
Hermes HTTP API
    ↓
Application
    ↓
Domain
    ↓
Infrastructure

The Next.js application must NOT:

- access SQLite directly
- access Prisma directly
- access 9Router directly
- access AI providers directly
- contain provider credentials
- contain Hermes business logic

---

# 13. Web Dashboard Features

Phase 1 dashboard should provide:

- Chat
- Conversation list
- Topic navigation
- Message history
- Markdown rendering
- Code blocks
- Message composer
- Loading state
- Error state
- Empty state
- Basic system status

The dashboard should feel like a personal AI system,
not an enterprise administration panel.

Follow:

docs/HERMES_UI_UX_SKILL.md

---

# 14. Hermes Must Work Without Next.js

This is a critical architectural requirement.

If Next.js is unavailable:

Next.js OFF
    ↓
Telegram
    ↓
Hermes Core
    ↓
AI
    ↓
Telegram

The system must continue to operate.

Therefore:

Next.js = interface

Hermes Core = application heart

---

# 15. Remote Dashboard

The intended personal workflow is:

User
    ↓
Telegram
    ↓
Hermes
    ↓
Dashboard access
    ↓
Browser
    ↓
Next.js
    ↓
Hermes HTTP API

The dashboard may eventually be exposed through
a secure tunnel or equivalent remote-access mechanism.

The exact tunnel implementation is not required
for the initial Phase 1 implementation.

Do not expose insecure public endpoints.

---

# 16. Initial Server

The primary experimental server is:

Oppo A58

The Oppo A58 may eventually run:

- Hermes Core
- SQLite
- 9Router integration
- Telegram
- Signal
- Next.js
- system monitoring

The Oppo does NOT run AI model inference.

AI inference is performed by external AI providers.

The Oppo primarily performs:

- orchestration
- networking
- API handling
- database operations
- agent logic
- message processing

---

# 17. Reliability

The Oppo A58 is not an enterprise server.

Phase 1 does not require enterprise-level availability.

However, Hermes should handle common failures gracefully.

Required considerations:

- network reconnect
- provider failure
- graceful shutdown
- database connection recovery
- process restart
- application startup
- application health

Hermes should be able to start again after the server reboots.

---

# 18. Health Monitoring

Implement basic monitoring:

- application status
- uptime
- memory usage
- CPU usage where practical
- database connectivity

Example:

GET /health

Response:

{
  "status": "ok",
  "uptime": 12345,
  "database": "connected"
}

Do not implement enterprise monitoring.

---

# 19. Logging

Use structured logging.

Logs should include useful metadata such as:

- timestamp
- level
- event
- request/message identifier where appropriate
- error information

Never log:

- API keys
- access tokens
- passwords
- private credentials

Avoid unnecessary sensitive conversation content.

---

# 20. Configuration

Use environment variables.

Provide:

.env.example

Never commit real secrets.

Configuration should allow changing:

- AI routing configuration
- Telegram configuration
- database configuration
- application settings

without modifying source code.

---

# 21. Graceful Shutdown

Hermes should:

1. stop accepting new work
2. finish safe in-progress operations where practical
3. close database connections
4. close external connections
5. exit cleanly

---

# 22. Project Structure

Recommended structure:

hermes/

├── apps/
│   ├── core/
│   │   └── src/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       ├── presentation/
│   │       └── shared/
│   │
│   └── web/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── styles/
│
├── prisma/
│   └── schema.prisma
│
├── docs/
│   ├── HERMES_PHASE_1.md
│   ├── HERMES_UI_UX_SKILL.md
│   └── ARCHITECTURE.md
│
├── package.json
├── README.md
└── .env.example

This is a modular monolith.

Do NOT create microservices.

---

# 23. Technology Stack

Core:

- Node.js
- TypeScript

Web:

- Next.js
- React
- TypeScript

Database:

- SQLite
- Prisma

Validation:

- Zod

Logging:

- Pino

AI:

- 9Router

Messaging:

- Telegram Bot API

Use dependencies only when they provide clear value.

Avoid unnecessary dependencies.

---

# 24. Testing

Implement tests for important behavior.

At minimum:

- SendMessage use case
- conversation persistence
- provider failure handling
- health endpoint
- basic HTTP API behavior

Do not target 100% coverage.

---

# 25. Phase 1 Out of Scope

Do NOT implement:

- Content Agent
- image generation
- video generation
- OCR pipeline
- TTS pipeline
- Acer worker
- RTX rendering
- GPU worker
- worker queue
- Redis
- RabbitMQ
- PostgreSQL deployment
- Kubernetes
- production cloud deployment
- multi-user SaaS
- billing
- enterprise authentication
- enterprise monitoring

These belong to future phases.

---

# 26. Phase 2

Phase 2 introduces the Content Agent.

Concept:

Hermes
    ↓
Content Agent
    ↓
Script
    ↓
Visual
    ↓
Audio
    ↓
Video
    ↓
Worker Queue
    ↓
Acer Aspire 14 AI
    ↓
RTX 2050
    ↓
Local processing/rendering

The Acer is a worker.

The Oppo remains the orchestration/control server.

The worker may be offline.

Jobs can remain pending until the worker becomes available.

Do NOT implement Phase 2 now.

---

# 27. Phase 3

Phase 3 introduces product experiments.

Potential products:

- UMKM web applications
- POS
- ERP
- other digital products

Personal infrastructure may be used for demos.

Production workloads should eventually use cloud infrastructure.

Do NOT implement Phase 3 now.

---

# 28. Future Migration

Current:

Oppo A58
    ├── Hermes Core
    ├── SQLite
    └── Next.js

Future:

Cloud Server
    ├── Hermes Core
    ├── PostgreSQL
    └── Next.js

The application architecture should remain portable.

The migration should primarily involve infrastructure,
deployment and database configuration.

---

# 29. Development Philosophy

Build the smallest system that satisfies Phase 1.

Prioritize:

simplicity
    >
unnecessary infrastructure

modularity
    >
premature microservices

portability
    >
vendor-specific coupling

maintainability
    >
clever abstractions

Do not implement future features just because they may
be useful later.

Design for the future.

Build only for the current phase.

---

# 30. Coding Agent Rules

Before coding:

1. Read this document completely.
2. Read docs/HERMES_UI_UX_SKILL.md.
3. Read docs/ARCHITECTURE.md if available.
4. Inspect the repository.
5. Inspect existing implementation.
6. Compare implementation with this specification.
7. Identify deviations.
8. Create an implementation plan.
9. Explain architectural decisions.
10. Wait for approval before major implementation.

Do not silently change the architecture.

Do not implement Phase 2 or Phase 3.

Do not introduce unnecessary infrastructure.