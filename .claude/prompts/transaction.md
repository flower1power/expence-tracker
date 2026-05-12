# Новая функциональность - Создать модуль транзакций

## Контекст
Проект: Nest.js + Next + PostgreSQL + Prisma
Что уже есть: User, авторизация jwt, модуль категорий + frontend авторизация

## Задача
Создай TransactionsModule - центральный модуль приложения для учета доходов и расходов


## Модель данных
Добавь модель Transaction в schema.prisma
- id (String, uuid, @default(uuid()))
- amount (Decimal)
- type (Enum: INCOME, EXPENSE)
- description (String, nullable)
- date (Datetime)
- categoryId (String связь с Category)
- userId (String связь с User)
- createdAt (DateTime, @default(now()))

Обнови модель User и Category - добавь обратные связи transactions Transaction[]

После изменения схемы создай и примени миграцию

## Контроллер
- POST /transactions: создать транзакцию
- GET /transactions: список транзакций с query параметрами dateFrom, dateTo, type, categoryId (по пользователю)
- GET /transactions/summary: агрегация, query параметры month и year (оба обязательны)
- GET /transactions/:id: одна одна транзакция
- PATCH /transactions/:id: обновить
- DELETE /transactions/:id: удалить

## Паттерн
Используй @api/src/category как образец структуры для backend


## Ограничения
- Не добавлять зависимости если не указано в задаче
- Используй class-validator для DTO
- После реализации собирай проект