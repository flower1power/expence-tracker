# apps/web — Frontend (Next.js)

## FSD Архитектура

Проект следует **Feature-Sliced Design**. Слои (снизу вверх):

```
src/
├── shared/       # переиспользуемые утилиты, API клиент, UI компоненты
│   ├── api/      # axios/fetch клиент, базовые типы ответов
│   ├── config/   # env конфиг (src/shared/config/env.ts)
│   └── ui/       # shadcn/ui компоненты (переэкспорт из components/ui/)
├── entities/     # доменные модели без бизнес-логики
│   └── user/model/user.types.ts
├── features/     # фичи с бизнес-логикой
│   └── auth/
│       ├── api/       # вызовы API (login, register, logout)
│       ├── model/     # типы, Zod схемы, React Context (auth.store.tsx)
│       └── ui/        # LoginForm, RegisterForm, AuthGuard
└── app/          # Next.js App Router, страницы, провайдеры
    ├── (auth)/        # /login, /register (публичные)
    ├── (protected)/   # /dashboard (обёрнуты в AuthGuard)
    └── providers.tsx  # корневые провайдеры
```

**Правило импортов:** `app` → `features` → `entities` → `shared`. Обратные зависимости запрещены.

**Псевдоним путей:** `@/*` → `./src/*`

## Компонентная библиотека (shadcn/ui)

Компоненты в `src/components/ui/` — это shadcn/ui компоненты (Radix UI + Tailwind CSS). Добавлять новые через CLI:

```bash
cd apps/web
npx shadcn@latest add <component-name>
```

Компоненты копируются в `src/components/ui/` и становятся частью кодовой базы. Изменять их напрямую допустимо. Переиспользуемые обёртки выносить в `src/shared/ui/`.

## Переменные окружения (apps/web/.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`NEXT_PUBLIC_*` переменные доступны на клиенте. Всё остальное — только на сервере. Конфиг читается через `src/shared/config/env.ts`.

## Роутинг

| Путь | Файл | Доступ |
|------|------|--------|
| `/` | `app/page.tsx` | Редирект на `/dashboard` или `/login` |
| `/login` | `app/(auth)/login/page.tsx` | Публичный |
| `/register` | `app/(auth)/register/page.tsx` | Публичный |
| `/dashboard` | `app/(protected)/dashboard/page.tsx` | Только авторизованные |

Защита через `AuthGuard` в `app/(protected)/layout.tsx` — проверяет токен в `auth.store.tsx` и редиректит на `/login`.
