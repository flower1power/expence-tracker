# План: Страницы авторизации и регистрации

## Обзор
Реализация фронтенд страниц `/login` и `/register` с использованием shadcn/ui и архитектуры FSD.

## API (готово)
- `POST /auth/register` — `{ email, name (min 2), password (min 8) }` → `{ accessToken, user }`
- `POST /auth/login` — `{ email, password }` → `{ accessToken, user }`

---

## Структура FSD

```
apps/web/src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (auth)/layout.tsx
│   ├── (protected)/dashboard/page.tsx
│   ├── (protected)/layout.tsx
│   └── layout.tsx
├── features/auth/
│   ├── api/auth.api.ts
│   ├── model/auth.types.ts
│   ├── model/auth.schemas.ts
│   ├── model/auth.store.ts
│   ├── ui/LoginForm.tsx
│   ├── ui/RegisterForm.tsx
│   ├── ui/AuthGuard.tsx
│   └── index.ts
├── entities/user/model/user.types.ts
└── shared/
    ├── api/client.ts
    ├── api/types.ts
    ├── config/env.ts
    └── ui/ (shadcn компоненты)
```

---

## Чек-лист задач

### Фаза 1: Инфраструктура
- [x] Инициализировать shadcn/ui (`pnpm dlx shadcn@latest init`)
- [x] Установить компоненты: `button`, `input`, `label`, `card`, `form`
- [x] Установить: `zod`, `react-hook-form`, `@hookform/resolvers`

### Фаза 2: Shared слой
- [x] `shared/config/env.ts` — конфиг API URL
- [x] `shared/api/types.ts` — ApiError, ApiException
- [x] `shared/api/client.ts` — fetch wrapper

### Фаза 3: Entities
- [x] `entities/user/model/user.types.ts` — интерфейс User

### Фаза 4: Features/auth
- [x] `features/auth/model/auth.types.ts` — AuthResponse, LoginCredentials, RegisterCredentials
- [x] `features/auth/model/auth.schemas.ts` — zod схемы валидации
- [x] `features/auth/model/auth.store.ts` — AuthProvider, useAuth (localStorage)
- [x] `features/auth/api/auth.api.ts` — login(), register()
- [x] `features/auth/ui/LoginForm.tsx` — форма входа
- [x] `features/auth/ui/RegisterForm.tsx` — форма регистрации
- [x] `features/auth/ui/AuthGuard.tsx` — защита маршрутов
- [x] `features/auth/index.ts` — публичный API фичи

### Фаза 5: App слой
- [x] `app/(auth)/layout.tsx` — layout для auth страниц
- [x] `app/(auth)/login/page.tsx`
- [x] `app/(auth)/register/page.tsx`
- [x] `app/(protected)/layout.tsx` — layout с AuthGuard
- [x] `app/(protected)/dashboard/page.tsx` — заглушка
- [x] Обновить `app/layout.tsx` — добавить AuthProvider

### Фаза 6: Документация
- [x] Обновить `CLAUDE.md` — добавить секцию FSD Architecture

---

## Ключевые файлы для изменения

| Файл | Действие |
|------|----------|
| `apps/web/package.json` | Добавить зависимости |
| `apps/web/tailwind.config.ts` | Будет обновлён shadcn init |
| `apps/web/src/app/layout.tsx` | Добавить AuthProvider |
| `CLAUDE.md` | Добавить документацию FSD |

---

## Технологии

- **UI**: shadcn/ui (Radix UI + Tailwind)
- **Формы**: react-hook-form + zod
- **Состояние**: React Context + localStorage
- **Роутинг**: Next.js App Router с route groups

---

## Верификация

1. Запустить `pnpm dev` (api + web)
2. Открыть `http://localhost:3000/register`
3. Зарегистрировать пользователя → редирект на `/dashboard`
4. Выйти → открыть `/login`
5. Войти → редирект на `/dashboard`
6. Проверить, что `/dashboard` недоступен без авторизации