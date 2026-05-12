# План: Авторизация для API с CQRS

## Обзор
Добавление JWT-авторизации в NestJS API с модулями User и Auth, используя CQRS паттерн для взаимодействия между модулями.

## 1. Установка зависимостей

```bash
cd apps/api
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/cqrs passport passport-jwt bcrypt class-validator class-transformer
pnpm add -D @types/passport-jwt @types/bcrypt
```

## 2. Структура файлов

```
apps/api/src/
├── common/
│   └── decorators/
│       └── current-user.decorator.ts
├── modules/
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.repository.ts
│   │   ├── entities/user.entity.ts
│   │   ├── commands/
│   │   │   ├── create-user.command.ts
│   │   │   ├── create-user.handler.ts
│   │   │   └── index.ts
│   │   └── queries/
│   │       ├── get-user-by-email.query.ts
│   │       ├── get-user-by-email.handler.ts
│   │       ├── get-user-by-id.query.ts
│   │       ├── get-user-by-id.handler.ts
│   │       └── index.ts
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── dto/
│       │   ├── register.dto.ts
│       │   ├── login.dto.ts
│       │   └── auth-response.dto.ts
│       ├── commands/
│       │   ├── register.command.ts
│       │   ├── register.handler.ts
│       │   ├── login.command.ts
│       │   ├── login.handler.ts
│       │   └── index.ts
│       ├── strategies/jwt.strategy.ts
│       ├── guards/jwt-auth.guard.ts
│       └── interfaces/jwt-payload.interface.ts
```

## 3. Prisma User Model

**Файл:** `apps/api/prisma/schema.prisma`

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

После изменения:
```bash
pnpm prisma:generate && pnpm prisma:migrate
```

## 4. CQRS Архитектура

### Конфигурация CqrsModule

**UserModule:**
```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserRepository } from './user.repository';
import { CreateUserHandler } from './commands/create-user.handler';
import { GetUserByEmailHandler } from './queries/get-user-by-email.handler';
import { GetUserByIdHandler } from './queries/get-user-by-id.handler';

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUserByEmailHandler, GetUserByIdHandler];

@Module({
  imports: [CqrsModule],
  providers: [UserRepository, ...CommandHandlers, ...QueryHandlers],
})
export class UserModule {}
```

**AuthModule:**
```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RegisterHandler } from './commands/register.handler';
import { LoginHandler } from './commands/login.handler';

const CommandHandlers = [RegisterHandler, LoginHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, ...CommandHandlers],
})
export class AuthModule {}
```

### User Module — Commands

**CreateUserCommand:**
```typescript
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
  ) {}
}
```

**CreateUserHandler:**
- Принимает CreateUserCommand
- Использует UserRepository для создания пользователя
- Возвращает созданного User

### User Module — Queries

**GetUserByEmailQuery:**
```typescript
export class GetUserByEmailQuery {
  constructor(public readonly email: string) {}
}
```

**GetUserByIdQuery:**
```typescript
export class GetUserByIdQuery {
  constructor(public readonly id: string) {}
}
```

### Auth Module — Commands

**RegisterCommand:**
```typescript
export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
  ) {}
}
```

**RegisterHandler:**
- Проверяет существование пользователя через QueryBus (GetUserByEmailQuery)
- Хеширует пароль через bcrypt
- Создает пользователя через CommandBus (CreateUserCommand)
- Генерирует JWT токен
- Возвращает AuthResponse

**LoginCommand:**
```typescript
export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
```

**LoginHandler:**
- Получает пользователя через QueryBus (GetUserByEmailQuery)
- Проверяет пароль через bcrypt
- Генерирует JWT токен
- Возвращает AuthResponse

## 5. Порядок создания файлов

### Шаг 1: Common
- `src/common/decorators/current-user.decorator.ts`

### Шаг 2: User Module
1. `src/modules/user/entities/user.entity.ts`
2. `src/modules/user/user.repository.ts`
3. `src/modules/user/commands/create-user.command.ts`
4. `src/modules/user/commands/create-user.handler.ts`
5. `src/modules/user/commands/index.ts`
6. `src/modules/user/queries/get-user-by-email.query.ts`
7. `src/modules/user/queries/get-user-by-email.handler.ts`
8. `src/modules/user/queries/get-user-by-id.query.ts`
9. `src/modules/user/queries/get-user-by-id.handler.ts`
10. `src/modules/user/queries/index.ts`
11. `src/modules/user/user.module.ts`

### Шаг 3: Auth Module
1. `src/modules/auth/interfaces/jwt-payload.interface.ts`
2. `src/modules/auth/dto/register.dto.ts`
3. `src/modules/auth/dto/login.dto.ts`
4. `src/modules/auth/dto/auth-response.dto.ts`
5. `src/modules/auth/commands/register.command.ts`
6. `src/modules/auth/commands/register.handler.ts`
7. `src/modules/auth/commands/login.command.ts`
8. `src/modules/auth/commands/login.handler.ts`
9. `src/modules/auth/commands/index.ts`
10. `src/modules/auth/strategies/jwt.strategy.ts`
11. `src/modules/auth/guards/jwt-auth.guard.ts`
12. `src/modules/auth/auth.controller.ts`
13. `src/modules/auth/auth.module.ts`

### Шаг 4: Обновление существующих файлов
- `src/main.ts` — добавить ValidationPipe
- `src/app.module.ts` — импортировать ConfigModule, UserModule, AuthModule

### Шаг 5: Environment
Добавить в `apps/api/.env` и `.env.example`:
```
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

## 6. CQRS Flow

```
AuthController.register(dto)
    │
    ▼
CommandBus.execute(RegisterCommand)
    │
    ▼
RegisterHandler
    ├──▶ QueryBus.execute(GetUserByEmailQuery)  ──▶ UserRepository.findByEmail()
    ├──▶ bcrypt.hash(password)
    ├──▶ CommandBus.execute(CreateUserCommand)  ──▶ UserRepository.create()
    └──▶ JwtService.sign(payload)
    │
    ▼
AuthResponse { accessToken, user: { id, email, name } }
```

## 7. API Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | /auth/register | `{ email, name, password }` | `{ accessToken, user }` |
| POST | /auth/login | `{ email, password }` | `{ accessToken, user }` |

## 8. DTO

**RegisterDto:**
```typescript
{
  email: string;      // @IsEmail
  name: string;       // @IsString, @MinLength(2)
  password: string;   // @IsString, @MinLength(8)
}
```

**LoginDto:**
```typescript
{
  email: string;      // @IsEmail
  password: string;   // @IsString
}
```

**AuthResponseDto:**
```typescript
{
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  }
}
```

## 9. Критические файлы

- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/user/user.module.ts` (CqrsModule)
- `apps/api/src/modules/auth/commands/register.handler.ts`
- `apps/api/src/modules/auth/commands/login.handler.ts`
- `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- `apps/api/src/app.module.ts`

## 10. Верификация

1. Запустить БД: `pnpm db:up`
2. Применить миграции: `pnpm prisma:migrate`
3. Запустить API: `pnpm dev:api`
4. Тестировать endpoints:
   ```bash
   # Регистрация
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","name":"Test User","password":"password123"}'

   # Логин
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"password123"}'
   ```
