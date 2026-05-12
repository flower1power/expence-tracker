# apps/api — Backend (NestJS)

## Модули

| Модуль | Путь | Назначение |
|--------|------|------------|
| `auth` | `src/modules/auth/` | Регистрация, логин, JWT стратегия |
| `user` | `src/modules/user/` | Управление пользователями |
| `category` | `src/modules/category/` | CRUD категорий (привязаны к userId) |
| `transaction` | `src/modules/transaction/` | CRUD транзакций, фильтрация, summary |
| `prisma` | `src/prisma/` | PrismaService (global module) |

## Паттерны

### CQRS
Каждый модуль разделён на `commands/` (мутации) и `queries/` (чтение):
```
commands/
  create-*.command.ts    # данные команды
  create-*.handler.ts    # бизнес-логика + запись в БД через Repository
queries/
  get-*.query.ts
  get-*.handler.ts
```
CommandBus и QueryBus из `@nestjs/cqrs` инжектируются в контроллеры.

### Repository
Каждый модуль с данными имеет `*.repository.ts` — инкапсулирует все Prisma-запросы. Handlers не обращаются к Prisma напрямую.

### Global Pipes
В `main.ts` подключён глобальный `ValidationPipe`:
```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
```
Все входящие DTO валидируются через `class-validator`. Лишние поля автоматически отсекаются.

### Авторизация
`JwtAuthGuard` применяется на уровне контроллера (`@UseGuards`). Текущий пользователь доступен через `@CurrentUser()` декоратор (`src/common/decorators/`).

## Prisma и схема БД

Схема: `prisma/schema.prisma`

**Модели:**
- `User` — `id (uuid)`, `email (unique)`, `name`, `passwordHash`, timestamps
- `Category` — `id`, `name`, `color`, `icon`, `userId` (FK → User, onDelete: Cascade)
- `Transaction` — `id`, `amount (Decimal 12,2)`, `type (INCOME|EXPENSE)`, `description?`, `date`, `categoryId`, `userId`

После изменения схемы обязательно:
```bash
pnpm prisma:migrate   # создать и применить миграцию
pnpm prisma:generate  # обновить Prisma Client
```

## Переменные окружения (apps/api/.env)

```
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_tracker"
API_PORT=3001
JWT_SECRET=your_secret_here
```

## Swagger и JSDoc

<important if="добавление или изменение эндпоинтов">

Swagger подключён (`@nestjs/swagger@^7`). UI доступен на `/api/docs`.

При добавлении новых эндпоинтов:
- Декорировать DTO через `@ApiProperty()` / `@ApiPropertyOptional()`
- Декорировать контроллеры через `@ApiTags()`, `@ApiBearerAuth()`
- Декорировать методы через `@ApiOperation()`, `@ApiResponse()`, `@ApiParam()`

JSDoc писать только для неочевидной бизнес-логики в handlers. Контроллеры и DTO самодокументированы через декораторы.

</important>

## Документация
После изменения методов — обновляй JSDoc.
Для DTO и контроллеров — добавляй/обновляй Swagger декораторы.