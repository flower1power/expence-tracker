# Архитектура проекта

## Обзор

Монорепозиторий (pnpm workspaces) с двумя приложениями и общим пакетом:

```
expence-tracker/
├── apps/
│   ├── api/          # NestJS backend (порт 3001)
│   └── web/          # Next.js frontend (порт 3002)
└── packages/
    └── shared/       # Общие TypeScript-типы (@expense-tracker/shared)
```

---

## Backend (apps/api)

### Стек
- **NestJS** — фреймворк
- **Prisma ORM** — доступ к БД
- **PostgreSQL** — база данных
- **JWT** — аутентификация (bcrypt для хешей паролей)
- **Swagger** (`@nestjs/swagger`) — документация API на `/api/docs`

### Слои

```
src/
├── main.ts                     # bootstrap: ValidationPipe, CORS, Swagger
├── app.module.ts               # корневой модуль
├── prisma/                     # PrismaModule (global) + PrismaService
├── common/
│   └── decorators/
│       └── current-user.decorator.ts  # @CurrentUser() — извлекает userId из JWT
└── modules/
    ├── auth/         # регистрация, логин, JWT-стратегия
    ├── user/         # CRUD пользователя
    ├── category/     # CRUD категорий (scope: userId)
    └── transaction/  # CRUD транзакций + фильтрация + monthly summary
```

### Паттерн CQRS

Каждый модуль разделён на мутации (commands) и чтение (queries):

```
commands/
  <action>.command.ts    # класс с данными (payload)
  <action>.handler.ts    # бизнес-логика, запись через Repository

queries/
  get-<entity>.query.ts
  get-<entity>.handler.ts
```

Контроллеры инжектируют `CommandBus` и `QueryBus` из `@nestjs/cqrs`. Handlers напрямую к Prisma не обращаются — только через Repository.

### Паттерн Repository

Каждый модуль с данными имеет `<module>.repository.ts`, который инкапсулирует все Prisma-запросы. Handlers используют только методы репозитория.

### Глобальные механизмы

| Механизм | Конфигурация | Эффект |
|----------|-------------|--------|
| `ValidationPipe` | `whitelist: true, forbidNonWhitelisted: true, transform: true` | Валидация DTO, отсечение лишних полей |
| `JwtAuthGuard` | `@UseGuards(JwtAuthGuard)` на контроллере | Все эндпоинты модуля требуют Bearer токен |
| `@CurrentUser()` | Декоратор в `common/decorators/` | Извлекает объект `User` из JWT payload |
| `ConfigModule` | `isGlobal: true` | `process.env.*` доступны везде без импорта |

### Модули — зависимости

```
AppModule
  ├── PrismaModule (global)
  ├── AuthModule
  │   └── UserModule (для проверки email при логине)
  ├── UserModule
  ├── CategoryModule
  └── TransactionModule
        └── CategoryModule (проверка владельца категории)
```

---

## Frontend (apps/web)

### Стек
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Zod** — валидация форм

### FSD (Feature-Sliced Design)

Слои (импорт только сверху вниз):

```
src/
├── app/              # Next.js App Router: страницы, провайдеры
│   ├── (auth)/       # /login, /register — публичные
│   ├── (protected)/  # /dashboard — только авторизованные
│   └── providers.tsx
├── features/         # фичи с бизнес-логикой
│   └── auth/
│       ├── api/      # вызовы API (login, register)
│       ├── model/    # типы, Zod схемы, React Context (auth.store.tsx)
│       └── ui/       # LoginForm, RegisterForm, AuthGuard
├── entities/         # доменные модели без бизнес-логики
│   └── user/model/user.types.ts
└── shared/           # утилиты, клиент, UI
    ├── api/          # apiClient (fetch-обёртка) + ApiException
    ├── config/       # env.ts — NEXT_PUBLIC_API_URL
    └── ui/           # переиспользуемые обёртки shadcn/ui
```

**Правило:** `app` → `features` → `entities` → `shared`. Обратные зависимости запрещены.

### Роутинг

| URL | Группа | Защита |
|-----|--------|--------|
| `/login` | `(auth)` | Публичный |
| `/register` | `(auth)` | Публичный |
| `/dashboard` | `(protected)` | `AuthGuard` → редирект на `/login` |

Защита реализована через `AuthGuard` в `app/(protected)/layout.tsx`, который читает токен из `auth.store.tsx` (React Context).

### HTTP-клиент

`shared/api/client.ts` — функция `apiClient<T>(endpoint, options)`:
- Автоматически подставляет `Content-Type: application/json`
- При наличии `options.token` добавляет `Authorization: Bearer <token>`
- Бросает `ApiException` для не-2xx ответов

---

## Shared (packages/shared)

Импорт: `import { ... } from '@expense-tracker/shared'`

Содержит TypeScript-типы, которые должны быть консистентны между API и Web. Изменения в схеме требуют обновления shared-типов.

---

## Переменные окружения

**apps/api/.env:**
```
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_tracker"
API_PORT=3001
JWT_SECRET=your_secret_here
```

**apps/web/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```
