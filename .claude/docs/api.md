# API Reference

Base URL: `http://localhost:3001`  
Swagger UI: `http://localhost:3001/api/docs`

Защищённые эндпоинты требуют заголовок:
```
Authorization: Bearer <jwt_token>
```

---

## Auth

### POST /auth/register
Регистрация нового пользователя.

**Body:**
```json
{
  "email": "user@example.com",
  "name": "Иван",
  "password": "password123"
}
```
Валидация: `email` — корректный формат; `name` — минимум 2 символа; `password` — минимум 8 символов.

**Ответы:**

| Код | Описание |
|-----|----------|
| 201 | Успех — возвращает `AuthResponse` |
| 400 | Некорректные данные |
| 409 | Email уже занят |

**AuthResponse:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван"
  }
}
```

---

### POST /auth/login
Вход в систему.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответы:**

| Код | Описание |
|-----|----------|
| 201 | Успех — возвращает `AuthResponse` |
| 400 | Некорректные данные |
| 401 | Неверный email или пароль |

---

## Categories

Все эндпоинты — защищённые. Категории привязаны к `userId` из JWT.

### POST /categories
Создать категорию.

**Body:**
```json
{
  "name": "Продукты",
  "color": "#FF5733",
  "icon": "🛒"
}
```
Валидация: `name` 1–50 символов; `color` — HEX формат `#RRGGBB`; `icon` 1–10 символов.

**Ответы:** 201 (создана) | 401

**CategoryResponse:**
```json
{
  "id": "uuid",
  "name": "Продукты",
  "color": "#FF5733",
  "icon": "🛒",
  "userId": "uuid",
  "createdAt": "2026-05-12T10:00:00.000Z",
  "updatedAt": "2026-05-12T10:00:00.000Z"
}
```

---

### GET /categories
Получить все категории текущего пользователя.

**Ответы:** 200 (массив `CategoryResponse`) | 401

---

### PATCH /categories/:id
Обновить категорию. Все поля необязательны.

**Params:** `id` — UUID категории

**Body:**
```json
{
  "name": "Еда",
  "color": "#00FF00",
  "icon": "🍕"
}
```

**Ответы:** 200 | 401 | 403 (не владелец) | 404 (не найдена)

---

### DELETE /categories/:id
Удалить категорию.

**Params:** `id` — UUID категории

**Ответы:** 204 | 401 | 403 | 404

---

## Transactions

Все эндпоинты — защищённые. Транзакции привязаны к `userId` из JWT.

### POST /transactions
Создать транзакцию.

**Body:**
```json
{
  "amount": 1500.50,
  "type": "EXPENSE",
  "date": "2026-05-12",
  "categoryId": "uuid-категории",
  "description": "Продукты в магазине"
}
```
Валидация: `amount` ≥ 0.01; `type` — `INCOME` | `EXPENSE`; `date` — ISO 8601; `categoryId` — UUID; `description` — необязательное.

**Ответы:** 201 | 401 | 403 (категория чужая) | 404 (категория не найдена)

**TransactionResponse:**
```json
{
  "id": "uuid",
  "amount": "1500.50",
  "type": "EXPENSE",
  "description": "Продукты в магазине",
  "date": "2026-05-12T00:00:00.000Z",
  "categoryId": "uuid",
  "userId": "uuid",
  "createdAt": "2026-05-12T10:00:00.000Z",
  "category": {
    "id": "uuid",
    "name": "Продукты",
    "color": "#FF5733",
    "icon": "🛒"
  }
}
```
> Поле `amount` всегда возвращается как строка (Prisma Decimal → JSON).

---

### GET /transactions
Получить список транзакций с фильтрацией.

**Query params (все необязательны):**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `dateFrom` | ISO 8601 string | Начало периода |
| `dateTo` | ISO 8601 string | Конец периода |
| `type` | `INCOME` \| `EXPENSE` | Тип транзакции |
| `categoryId` | UUID | Конкретная категория |

**Ответы:** 200 (массив `TransactionResponse`, сортировка по `date DESC`) | 401

---

### GET /transactions/summary
Финансовая сводка за месяц.

**Query params (обязательны):**

| Параметр | Тип | Пример |
|----------|-----|--------|
| `year` | number | `2026` |
| `month` | number (1–12) | `5` |

**Ответы:** 200 | 401

**SummaryResponse:**
```json
{
  "totalIncome": "50000.00",
  "totalExpense": "23500.75",
  "balance": "26499.25",
  "byCategory": [
    {
      "categoryId": "uuid",
      "categoryName": "Продукты",
      "categoryColor": "#FF5733",
      "categoryIcon": "🛒",
      "total": "12000.00",
      "type": "EXPENSE"
    }
  ]
}
```

---

### GET /transactions/:id
Получить транзакцию по ID.

**Params:** `id` — UUID транзакции

**Ответы:** 200 (`TransactionResponse`) | 401 | 403 | 404

---

### PATCH /transactions/:id
Обновить транзакцию. Все поля необязательны.

**Params:** `id` — UUID транзакции

**Body:** те же поля, что в `POST /transactions`, все опциональны.

**Ответы:** 200 | 401 | 403 | 404

---

### DELETE /transactions/:id
Удалить транзакцию.

**Params:** `id` — UUID транзакции

**Ответы:** 204 | 401 | 403 | 404