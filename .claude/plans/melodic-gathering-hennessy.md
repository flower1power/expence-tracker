# План реализации TransactionsModule

## Обзор
Создание модуля транзакций для учета доходов и расходов, следуя CQRS паттерну из модуля категорий.

---

## Фаза 1: Обновление схемы Prisma

**Файл:** `apps/api/prisma/schema.prisma`

### 1.1 Добавить enum TransactionType
```prisma
enum TransactionType {
  INCOME
  EXPENSE
}
```

### 1.2 Добавить модель Transaction
```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  description String?
  date        DateTime
  categoryId  String          @map("category_id")
  userId      String          @map("user_id")
  createdAt   DateTime        @default(now()) @map("created_at")

  category Category @relation(fields: [categoryId], references: [id])
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("transactions")
}
```

### 1.3 Добавить обратные связи
- В модель `User` добавить: `transactions Transaction[]`
- В модель `Category` добавить: `transactions Transaction[]`

### 1.4 Выполнить миграцию
```bash
pnpm prisma:migrate
pnpm prisma:generate
```

---

## Фаза 2: Структура модуля

```
apps/api/src/modules/transaction/
├── entities/
│   └── transaction.entity.ts
├── dto/
│   ├── create-transaction.dto.ts
│   ├── update-transaction.dto.ts
│   ├── transaction-response.dto.ts
│   ├── transaction-filter.dto.ts
│   └── transaction-summary.dto.ts
├── commands/
│   ├── create-transaction.command.ts
│   ├── create-transaction.handler.ts
│   ├── update-transaction.command.ts
│   ├── update-transaction.handler.ts
│   ├── delete-transaction.command.ts
│   ├── delete-transaction.handler.ts
│   └── index.ts
├── queries/
│   ├── get-transaction-by-id.query.ts
│   ├── get-transaction-by-id.handler.ts
│   ├── get-all-transactions.query.ts
│   ├── get-all-transactions.handler.ts
│   ├── get-transaction-summary.query.ts
│   ├── get-transaction-summary.handler.ts
│   └── index.ts
├── transaction.repository.ts
├── transaction.controller.ts
└── transaction.module.ts
```

---

## Фаза 3: Файлы для создания

### 3.1 Entity
- `transaction.entity.ts` — класс Transaction с полями id, amount, type, description, date, categoryId, userId, createdAt

### 3.2 DTOs (5 файлов)
- `create-transaction.dto.ts` — amount (number, min 0.01), type (enum), description? (string), date (ISO string), categoryId (UUID)
- `update-transaction.dto.ts` — все поля optional
- `transaction-response.dto.ts` — включает category object
- `transaction-filter.dto.ts` — dateFrom?, dateTo?, type?, categoryId?
- `transaction-summary.dto.ts` — month (1-12), year (2000-2100) для query; response с totalIncome, totalExpense, balance, byCategory

### 3.3 Repository
- `transaction.repository.ts`:
  - `create()` — создание с include category
  - `findById()` — поиск с include category
  - `findAllByUserId(filter)` — фильтрация по dateFrom, dateTo, type, categoryId
  - `update()` — обновление с include category
  - `delete()` — удаление
  - `getSummaryByMonth()` — агрегация с raw SQL для группировки по категориям

### 3.4 Commands (3 команды + 3 handler)
- `CreateTransactionCommand` — проверяет принадлежность категории пользователю
- `UpdateTransactionCommand` — проверяет владельца транзакции и категории
- `DeleteTransactionCommand` — проверяет владельца транзакции

### 3.5 Queries (3 query + 3 handler)
- `GetTransactionByIdQuery`
- `GetAllTransactionsQuery` — с фильтрами
- `GetTransactionSummaryQuery` — агрегация по месяцу

### 3.6 Controller
Эндпоинты с `@UseGuards(JwtAuthGuard)`:

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /transactions | Создать транзакцию |
| GET | /transactions | Список с фильтрами |
| GET | /transactions/summary | Агрегация по месяцу |
| GET | /transactions/:id | Получить по ID |
| PATCH | /transactions/:id | Обновить |
| DELETE | /transactions/:id | Удалить |

**Важно:** `/summary` должен быть объявлен ДО `/:id`

### 3.7 Module
- Импорт CqrsModule
- Провайдеры: Repository, CommandHandlers, QueryHandlers

---

## Фаза 4: Регистрация модуля

**Файл:** `apps/api/src/app.module.ts`
- Добавить импорт TransactionModule

---

## Критические файлы

| Файл | Действие |
|------|----------|
| `apps/api/prisma/schema.prisma` | Изменить |
| `apps/api/src/modules/transaction/*` | Создать (15+ файлов) |
| `apps/api/src/app.module.ts` | Изменить |

---

## Важные детали реализации

1. **Decimal**: Prisma возвращает `Decimal`, конвертировать в string для JSON
2. **Валидация категории**: При create/update проверять что category.userId === user.id
3. **Авторизация**: В handlers проверять transaction.userId === user.id
4. **Summary**: Использовать raw SQL для сложной агрегации
5. **Даты**: Принимать ISO strings в DTO, конвертировать в Date

---

## Верификация

1. **Сборка проекта:**
   ```bash
   pnpm build
   ```

2. **Тестирование API (curl/Postman):**
   - Создать транзакцию с валидной категорией
   - Получить список с фильтрами
   - Получить summary за месяц
   - Обновить транзакцию
   - Удалить транзакцию
   - Проверить 401 без токена
   - Проверить 403 для чужой транзакции
