# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense Tracker — монорепозиторий с pnpm workspaces, состоящий из:
- **apps/web** — Next.js 16 frontend (React 19, Tailwind CSS)
- **apps/api** — NestJS backend (Prisma ORM, PostgreSQL)
- **packages/shared** — общие типы между frontend и backend

## Commands

```bash
# Development
pnpm dev              # Run both web and api in parallel
pnpm dev:web          # Run only frontend (localhost:3000)
pnpm dev:api          # Run only backend (localhost:3001)

# Database
pnpm db:up            # Start PostgreSQL via Docker
pnpm db:down          # Stop PostgreSQL
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:migrate   # Run migrations

# Code Quality
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint autofix
pnpm format           # Prettier format
pnpm format:check     # Prettier check

# Build
pnpm build            # Build all packages
```

## Architecture

### Backend (apps/api)
- NestJS модульная архитектура
- `src/modules/` — feature modules
- `src/prisma/` — PrismaService (global module)
- `prisma/schema.prisma` — схема БД
- Health check endpoint: `GET /`

### Frontend (apps/web)
- Next.js App Router (`src/app/`)
- `src/components/` — React компоненты
- `src/lib/` — утилиты
- Path alias: `@/*` → `./src/*`

### Shared (packages/shared)
- Импорт: `@expense-tracker/shared`
- Общие TypeScript типы между web и api

## Environment

Скопировать `.env.example` в `.env` в корне и в `apps/api/`.

```
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_tracker"
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```
