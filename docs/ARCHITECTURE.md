# HERMES ARCHITECTURE

## 1. Core Principle

Hermes is a modular monolith.

The system should remain simple during the experimentation phase.

We are intentionally NOT building microservices.

---

# 2. Core Boundary

Hermes Core is the central application.

Interfaces are adapters.

                    HERMES CORE
                         │
              ┌──────────┼──────────┐
              │          │          │
          Telegram     Signal     HTTP API
                                    │
                                    ▼
                                 Next.js

The Core must not depend on any interface.

---

# 3. Why Next.js Is Separate

Next.js provides the user interface.

It does not contain Hermes business logic.

This allows:

- Telegram to work without Web
- Signal to work without Web
- Web UI to evolve independently
- future mobile UI to be added
- future interfaces to be added

---

# 4. Why Oppo A58

The initial Hermes server is a personal Android phone.

Reasons:

- already available hardware
- low operating cost
- Wi-Fi available
- electricity included in the personal environment
- battery provides temporary power during outages
- suitable for experimentation

The phone is NOT intended to be production infrastructure.

If Hermes eventually serves real clients,
production workloads should move to cloud infrastructure.

---

# 5. Why SQLite

SQLite is appropriate for:

- single-user personal use
- low operational complexity
- low resource usage
- experimentation

Prisma isolates database access.

Future:

SQLite → PostgreSQL

---

# 6. Why 9Router

Hermes should not be coupled to one AI provider.

9Router provides a routing layer so models can be changed
without redesigning Hermes Core.

Example:

Hermes
 ↓
AI abstraction
 ↓
9Router
 ↓
Gemini / Claude / DeepSeek / other configured models

---

# 7. Why Acer Is a Worker

The Acer laptop contains more compute capability than
the Oppo server.

Therefore:

Oppo = control/orchestration

Acer = compute worker

This becomes important in Phase 2 for:

- rendering
- OCR
- TTS
- image generation
- video generation

The worker may be online or offline.

---

# 8. Deployment Evolution

Phase 1:

Oppo
├── Hermes Core
├── SQLite
├── Next.js
└── Messaging interfaces

Phase 2:

Oppo
├── Hermes Core
├── SQLite
├── Next.js
└── Worker coordination
       │
       ▼
Acer

Future production:

Cloud
├── Hermes Core
├── Next.js
└── PostgreSQL

---

# 9. Architectural Priorities

1. Keep Core independent.
2. Keep interfaces replaceable.
3. Keep database replaceable.
4. Keep AI providers replaceable.
5. Keep deployment portable.
6. Avoid premature infrastructure.
7. Optimize for experimentation first.