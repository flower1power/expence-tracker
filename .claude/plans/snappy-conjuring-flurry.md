# План: Главный экран (Dashboard)

## Обзор
Создание полноценного dashboard с навигацией, профилем пользователя, списком транзакций и возможностью создания новых транзакций.

## Архитектура (FSD)

```
apps/web/src/
├── entities/
│   ├── transaction/          # Entity: транзакция
│   │   ├── model/transaction.types.ts
│   │   ├── ui/TransactionCard.tsx
│   │   └── index.ts
│   └── category/             # Entity: категория
│       ├── model/category.types.ts
│       ├── ui/CategoryBadge.tsx
│       └── index.ts
├── features/
│   ├── transactions/         # Feature: работа с транзакциями
│   │   ├── api/transactions.api.ts
│   │   ├── model/transaction.schemas.ts
│   │   ├── ui/
│   │   │   ├── TransactionsList.tsx
│   │   │   ├── CreateTransactionForm.tsx
│   │   │   └── CreateTransactionDialog.tsx
│   │   └── index.ts
│   └── categories/           # Feature: работа с категориями
│       ├── api/categories.api.ts
│       ├── ui/CategorySelect.tsx
│       └── index.ts
├── widgets/
│   └── dashboard/            # Widget: композиция dashboard
│       ├── ui/
│       │   ├── DashboardHeader.tsx
│       │   ├── UserProfileMenu.tsx
│       │   └── DashboardNav.tsx
│       └── index.ts
└── app/(protected)/
    ├── layout.tsx            # Обновить с DashboardHeader
    ├── dashboard/page.tsx    # Главная страница
    ├── transactions/page.tsx # Страница транзакций
    └── categories/page.tsx   # Страница категорий
```

## Этапы реализации

### Этап 1: Entities (типы и базовые UI компоненты)

**1.1 Transaction entity**
- `entities/transaction/model/transaction.types.ts` - типы Transaction, TransactionType, CreateTransactionInput
- `entities/transaction/ui/TransactionCard.tsx` - карточка одной транзакции
- `entities/transaction/index.ts` - экспорты

**1.2 Category entity**
- `entities/category/model/category.types.ts` - типы Category
- `entities/category/ui/CategoryBadge.tsx` - бейдж категории с иконкой и цветом
- `entities/category/index.ts` - экспорты

### Этап 2: shadcn компоненты

Добавить через CLI:
```bash
cd apps/web && npx shadcn@latest add avatar dropdown-menu skeleton dialog select badge separator
```

### Этап 3: Features (бизнес-логика)

**3.1 Categories feature**
- `features/categories/api/categories.api.ts` - getCategories()
- `features/categories/ui/CategorySelect.tsx` - выпадающий список категорий
- `features/categories/index.ts`

**3.2 Transactions feature**
- `features/transactions/api/transactions.api.ts` - getTransactions(), createTransaction()
- `features/transactions/model/transaction.schemas.ts` - Zod схема валидации
- `features/transactions/ui/TransactionsList.tsx` - список с пагинацией (frontend slice)
- `features/transactions/ui/CreateTransactionForm.tsx` - форма создания
- `features/transactions/ui/CreateTransactionDialog.tsx` - диалог с формой
- `features/transactions/index.ts`

### Этап 4: Widgets (композиция)

**4.1 Dashboard widgets**
- `widgets/dashboard/ui/DashboardHeader.tsx` - шапка с навигацией и профилем
- `widgets/dashboard/ui/DashboardNav.tsx` - навигация (Dashboard, Transactions, Categories)
- `widgets/dashboard/ui/UserProfileMenu.tsx` - dropdown с именем пользователя и logout
- `widgets/dashboard/index.ts`

### Этап 5: Pages (обновление app layer)

**5.1 Обновить protected layout**
- `app/(protected)/layout.tsx` - добавить DashboardHeader

**5.2 Обновить dashboard page**
- `app/(protected)/dashboard/page.tsx`:
  - Блок профиля (имя, email)
  - Список последних 10 транзакций с пагинацией
  - Кнопка "Создать транзакцию" → диалог

**5.3 Добавить страницы**
- `app/(protected)/transactions/page.tsx` - полный список транзакций
- `app/(protected)/categories/page.tsx` - управление категориями

## Ключевые файлы для изменения

| Файл | Действие |
|------|----------|
| `apps/web/src/app/(protected)/layout.tsx` | Добавить DashboardHeader |
| `apps/web/src/app/(protected)/dashboard/page.tsx` | Полностью переписать |
| `apps/web/src/features/auth/index.ts` | Паттерн для новых features |
| `apps/web/src/shared/api/client.ts` | Использовать для API |

## Пагинация

Frontend пагинация (slice массива):
- GET /transactions возвращает все транзакции
- На фронте: `transactions.slice((page-1)*10, page*10)`
- Навигация: "Prev/Next" или номера страниц

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Logo   [Dashboard] [Transactions] [Categories]  [User▼]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │ Профиль             │  │ + Создать транзакцию     │  │
│  │ Имя: John           │  └──────────────────────────┘  │
│  │ Email: john@mail.ru │                                │
│  └─────────────────────┘                                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Последние транзакции                             │   │
│  │ ┌────────────────────────────────────────────┐   │   │
│  │ │ 🍔 Еда  -500₽  12.05.2026                 │   │   │
│  │ │ 💰 Зарплата +50000₽ 01.05.2026            │   │   │
│  │ │ ...                                        │   │   │
│  │ └────────────────────────────────────────────┘   │   │
│  │ [< Prev]  1  2  3  [Next >]                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Верификация

1. Запустить `pnpm dev`
2. Авторизоваться на /login
3. Проверить dashboard:
   - Навигация работает (ссылки на transactions, categories)
   - Профиль отображается
   - Список транзакций загружается
   - Пагинация работает
   - Диалог создания транзакции открывается
   - Транзакция создается и появляется в списке
