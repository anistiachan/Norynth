# Norynth (Hermes Monorepo)

Personal AI assistant infrastructure powered by 9Router, Telegram, and Signal.

---

## 🚀 Quick Start (Terminal / NPM)

### 1. Prerequisite & Installation
Install 9Router globally for AI routing:
```bash
npm install -g 9router
```

### 2. Configure Environment
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Fill in required credentials:
- `TELEGRAM_BOT_TOKEN`: Telegram bot token from BotFather.
- `NINEROUTER_API_KEY`: API key from 9Router dashboard (`http://localhost:20128`).
- `NINEROUTER_BASE_URL`: Keep `http://localhost:20128/v1` for local setup.

### 3. Run Services

#### Start 9Router
```bash
9router
```

#### Database Setup & Build
```bash
npm install
npm run db:push
npm run build:core
```

#### Run Core (Telegram Bot & Backend API)
```bash
npm run start:core
```

#### Run Web Interface (Optional)
```bash
# Set backend API URL in apps/web/.env.local (optional, defaults to http://localhost:3000)
npm run start:web
```

---

## ⚡ Running Background Services with PM2 (Recommended for Termux / Servers)

Keep 9Router and Norynth Core running 24/7:

```bash
npm install -g pm2

# Start 9Router
pm2 start 9router

# Start Norynth Core
pm2 start "npm run start:core" --name hermes-core

# Save process list for autostart
pm2 save
```

Check status:
```bash
pm2 list
```

---

## 🐳 Running with Docker

### 1. Configure `.env`
Ensure `.env` contains your `TELEGRAM_BOT_TOKEN`, `NINEROUTER_API_KEY`, and `NINEROUTER_MODEL`.

### 2. Start Containers
```bash
docker compose up -d
```
This starts both `hermes-core` and the `signal-cli` REST API sidecar container.

---

## 🌐 Public Access via Tunnel (For Web Dashboard or External Access)

To expose `hermes-core` (port 3000) for external web dashboard access:

### Using Cloudflare Tunnel
```bash
pkg install cloudflared # or install cloudflared on your OS
cloudflared tunnel --url http://localhost:3000
```
Update `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` with the generated `https://xxx.trycloudflare.com` URL.
