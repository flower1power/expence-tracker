# Expense Tracker

Веб-приложение для учёта личных доходов и расходов. Монорепозиторий на pnpm workspaces.

## Стек технологий

| Слой | Технологии |
|------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, FSD архитектура |
| **Backend** | NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT, CQRS |
| **Shared** | TypeScript-пакет `@expense-tracker/shared` с общими типами |
| **Инфраструктура** | Docker (PostgreSQL), pnpm workspaces |

## Требования

- Node.js >= 20
- pnpm >= 9
- Docker и Docker Compose

## Быстрый старт

### 1. Установка зависимостей

```bash
pnpm install
```

### 2. Переменные окружения

Скопировать шаблоны и при необходимости отредактировать:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env   # если существует
```

Корневой `.env`:

```env
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_tracker"
API_PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. База данных

```bash
pnpm db:up            # запустить PostgreSQL в Docker
pnpm prisma:migrate   # применить миграции
pnpm prisma:generate  # сгенерировать Prisma Client
```

### 4. Dev-сервер

```bash
pnpm dev              # frontend + backend параллельно
```

Или по отдельности:

```bash
pnpm dev:web   # http://localhost:3002
pnpm dev:api   # http://localhost:3001
```

Swagger UI: `http://localhost:3001/api/docs`

## Структура проекта

```
expense-tracker/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # схема БД (User, Category, Transaction)
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # регистрация, логин, JWT стратегия
│   │       │   ├── user/       # управление пользователями
│   │       │   ├── category/   # CRUD категорий
│   │       │   └── transaction/ # CRUD транзакций, фильтрация, сводка
│   │       ├── common/
│   │       │   └── decorators/ # @CurrentUser()
│   │       └── prisma/         # глобальный PrismaService
│   │
│   └── web/                    # Next.js frontend (FSD)
│       └── src/
│           ├── app/            # App Router: страницы, провайдеры
│           │   ├── (auth)/     # /login, /register (публичные)
│           │   └── (protected)/ # /dashboard (только авторизованные)
│           ├── features/       # фичи с бизнес-логикой
│           │   └── auth/       # LoginForm, RegisterForm, AuthGuard, auth.store
│           ├── entities/       # доменные модели
│           ├── shared/         # API клиент, shadcn/ui, конфиг
│           └── components/ui/  # shadcn/ui компоненты
│
├── packages/
│   └── shared/                 # общие TypeScript типы (@expense-tracker/shared)
│
├── docker/
│   └── docker-compose.yml      # PostgreSQL
│
├── package.json                # корневые скрипты и devDependencies
└── pnpm-workspace.yaml
```

## API эндпоинты

Все защищённые эндпоинты требуют заголовок `Authorization: Bearer <token>`.

### Auth

| Метод | Путь | Описание |
|-------|------|---------|
| `POST` | `/auth/register` | Регистрация нового пользователя |
| `POST` | `/auth/login` | Вход, возвращает JWT токен |

### Categories (требует JWT)

| Метод | Путь | Описание |
|-------|------|---------|
| `POST` | `/categories` | Создать категорию |
| `GET` | `/categories` | Список категорий пользователя |
| `PATCH` | `/categories/:id` | Обновить категорию |
| `DELETE` | `/categories/:id` | Удалить категорию |

### Transactions (требует JWT)

| Метод | Путь | Описание |
|-------|------|---------|
| `POST` | `/transactions` | Создать транзакцию |
| `GET` | `/transactions` | Список транзакций (фильтры: `dateFrom`, `dateTo`, `type`, `categoryId`) |
| `GET` | `/transactions/summary` | Финансовая сводка за месяц (`year`, `month`) |
| `GET` | `/transactions/:id` | Транзакция по ID |
| `PATCH` | `/transactions/:id` | Обновить транзакцию |
| `DELETE` | `/transactions/:id` | Удалить транзакцию |

## Полезные команды

```bash
pnpm lint                  # проверка ESLint
pnpm format:check          # проверка Prettier
pnpm build                 # сборка всех пакетов
pnpm db:down               # остановить PostgreSQL
```
