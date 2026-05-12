# База данных

## Провайдер

PostgreSQL. Схема: `apps/api/prisma/schema.prisma`.  
Запуск контейнера: `pnpm db:up` (Docker).

---

## Модели

### users

| Колонка | Тип | Ограничения | Назначение |
|---------|-----|-------------|------------|
| `id` | `VARCHAR` UUID | PK, default: `uuid()` | Первичный ключ |
| `email` | `VARCHAR` | UNIQUE, NOT NULL | Email — логин пользователя |
| `name` | `VARCHAR` | NOT NULL | Отображаемое имя |
| `password_hash` | `VARCHAR` | NOT NULL | bcrypt-хеш пароля (salt rounds: 10) |
| `created_at` | `TIMESTAMP` | default: `now()` | Дата регистрации |
| `updated_at` | `TIMESTAMP` | auto-update | Дата последнего изменения |

Prisma-модель: `User`

---

### categories

| Колонка | Тип | Ограничения | Назначение |
|---------|-----|-------------|------------|
| `id` | `VARCHAR` UUID | PK, default: `uuid()` | Первичный ключ |
| `name` | `VARCHAR` | NOT NULL | Название категории (1–50 символов) |
| `color` | `VARCHAR` | NOT NULL | HEX-цвет (`#RRGGBB`) для UI |
| `icon` | `VARCHAR` | NOT NULL | Эмодзи или иконка (1–10 символов) |
| `user_id` | `VARCHAR` UUID | FK → users.id, NOT NULL | Владелец категории |
| `created_at` | `TIMESTAMP` | default: `now()` | Дата создания |
| `updated_at` | `TIMESTAMP` | auto-update | Дата последнего изменения |

**Связи:** `user_id → users.id` с `onDelete: Cascade` — при удалении пользователя все его категории удаляются.

Prisma-модель: `Category`

---

### transactions

| Колонка | Тип | Ограничения | Назначение |
|---------|-----|-------------|------------|
| `id` | `VARCHAR` UUID | PK, default: `uuid()` | Первичный ключ |
| `amount` | `DECIMAL(12,2)` | NOT NULL | Сумма (до 999 999 999 999.99, минимум 0.01) |
| `type` | `ENUM` | NOT NULL | `INCOME` или `EXPENSE` |
| `description` | `VARCHAR` | NULL | Необязательное описание |
| `date` | `TIMESTAMP` | NOT NULL | Дата совершения операции |
| `category_id` | `VARCHAR` UUID | FK → categories.id, NOT NULL | Категория транзакции |
| `user_id` | `VARCHAR` UUID | FK → users.id, NOT NULL | Владелец транзакции |
| `created_at` | `TIMESTAMP` | default: `now()` | Дата записи в БД |

**Связи:**
- `user_id → users.id` с `onDelete: Cascade` — при удалении пользователя все его транзакции удаляются
- `category_id → categories.id` — без `onDelete: Cascade`, удаление категории с транзакциями заблокируется (нужно удалять транзакции сначала)

> Поле `updatedAt` у транзакций отсутствует намеренно — транзакции редактируются, но история изменений не хранится.

Prisma-модель: `Transaction`

---

## Enum

```prisma
enum TransactionType {
  INCOME   // доход
  EXPENSE  // расход
}
```

---

## ER-диаграмма

```
users
  │
  ├──< categories (user_id FK, CASCADE)
  │       │
  │       └──< transactions (category_id FK)
  │
  └──< transactions (user_id FK, CASCADE)
```

---

## Работа с миграциями

```bash
# Создать и применить новую миграцию
pnpm prisma:migrate

# Обновить Prisma Client после изменения схемы
pnpm prisma:generate
```

Миграции хранятся в `apps/api/prisma/migrations/`. Каждая миграция — отдельная директория с `migration.sql`.

### Порядок изменений схемы

1. Отредактировать `apps/api/prisma/schema.prisma`
2. `pnpm prisma:migrate` — создаёт SQL-миграцию и применяет её
3. `pnpm prisma:generate` — обновляет типы Prisma Client
4. Обновить DTO и Repository в затронутом модуле

---

## Prisma Client в коде

`PrismaService` (`src/prisma/prisma.service.ts`) — глобальный injectable сервис, обёртка над `PrismaClient`. Подключается через `PrismaModule` (global), поэтому не нужно импортировать модуль в каждый feature-модуль.

Тип `Prisma.Decimal` используется для поля `amount`. При сериализации в JSON его нужно явно конвертировать в строку: `.toString()`.