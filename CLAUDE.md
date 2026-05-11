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
- FSD (Feature-Sliced Design) архитектура
- shadcn/ui компоненты (Radix UI + Tailwind CSS)
- Path alias: `@/*` → `./src/*`

#### FSD Architecture

Проект следует принципам **Feature-Sliced Design** для масштабируемости и maintainability:

```
src/
├── app/                    # App layer - routing, pages
│   ├── (auth)/            # Route group для auth страниц
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (protected)/       # Route group для защищенных страниц
│   │   ├── dashboard/
│   │   └── layout.tsx     # AuthGuard wrapper
│   └── layout.tsx         # Root layout с AuthProvider
├── features/              # Features layer - business logic
│   └── auth/
│       ├── api/           # API calls
│       ├── model/         # Types, schemas, state
│       └── ui/            # Feature components
├── entities/              # Entities layer - domain models
│   └── user/
│       └── model/
├── shared/                # Shared layer - reusable code
│   ├── api/               # API client
│   ├── config/            # Environment config
│   └── ui/                # shadcn/ui components
├── components/            # Legacy components
└── lib/                   # Utilities
```

**Слои (снизу вверх):**
- `shared/` — переиспользуемые UI компоненты, утилиты, конфиг
- `entities/` — бизнес-сущности (User, Category, Transaction)
- `features/` — фичи (auth, создание транзакции, фильтры)
- `app/` — страницы, роутинг, провайдеры

**Правило импортов:** слой может импортировать только из слоёв ниже (или из того же слоя).

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

## Commit Convention

Проект использует [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:**
- `feat` — новая функциональность
- `fix` — исправление бага
- `docs` — изменения документации
- `style` — форматирование (без изменения логики)
- `refactor` — рефакторинг кода
- `test` — добавление/изменение тестов
- `chore` — обслуживание (deps, configs, CI)

**Scopes:**
- `api` — backend (apps/api)
- `web` — frontend (apps/web)
- `shared` — общий пакет (packages/shared)
- без scope — изменения в корне или нескольких пакетах

**Примеры:**
```bash
feat(api): add transaction module with CQRS
feat(web): implement auth feature with JWT
fix(api): handle null category in transactions
docs: update README with setup instructions
chore: upgrade dependencies
```

**Правила:**
- Описание на русском, кратко
- Первая буква строчная
- Без точки в конце
- Breaking changes помечай восклицательным знаком
- Атомарные коммиты (одна логическая единица)
