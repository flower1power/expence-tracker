## Project Overview

Expense Tracker — веб-приложение для учёта личных расходов. Монорепозиторий с pnpm workspaces:
- **apps/web** — Next.js frontend (React 19, Tailwind CSS)
- **apps/api** — NestJS backend (Prisma ORM, PostgreSQL)
- **packages/shared** — общие TypeScript типы между web и api

## Tech Stack

**Frontend (apps/web):** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), FSD архитектура

**Backend (apps/api):** NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT аутентификация, CQRS паттерн

**Shared (packages/shared):** импорт через `@expense-tracker/shared`

## Commands

```bash
# Development
pnpm dev              # web + api параллельно
pnpm dev:web          # только frontend (localhost:3002)
pnpm dev:api          # только backend (localhost:3001)

# Database
pnpm db:up            # запустить PostgreSQL (Docker)
pnpm db:down          # остановить PostgreSQL
pnpm prisma:generate  # сгенерировать Prisma Client
pnpm prisma:migrate   # применить миграции

# Code Quality
pnpm lint && pnpm format:check   # проверка перед коммитом

# Build
pnpm build            # собрать все пакеты
```

<important if="первичная настройка окружения">
Скопировать `.env.example` → `.env` в корне и в `apps/api/`. Затем запустить:
```bash
pnpm db:up && pnpm prisma:migrate && pnpm prisma:generate
```
</important>

## Branching Strategy (GitHub Flow)

- `main` — всегда стабильная, готова к деплою
- Ветки: `feature/<name>`, `fix/<name>`, `refactor/<name>`, `docs/<name>`
- Один PR = одна фича/фикс; после мержа удалять ветку

<important if="создание Pull Request">

```bash
git diff main...HEAD   # изучи изменения перед созданием PR

gh pr create --title "feat(web): описание" --body "$(cat <<'EOF'
## Summary
Краткое описание (2-3 предложения)

### Реализованный функционал
- Пункт 1

### Технические детали
- Архитектурные решения

## Test plan
- [ ] Тест 1

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
</important>

<when_committing>
Формат: `<type>(<scope>): <description>` (Conventional Commits)

**Types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore`
**Scopes:** `api` | `web` | `shared` | (без scope — корень/несколько пакетов)

- Описание на русском, первая буква строчная, без точки
- Breaking changes: `!` перед двоеточием
- Атомарные коммиты — одна логическая единица
</when_committing>


## Документация
При добавлении функционала проверяй .claude/docs/* и актуализируй