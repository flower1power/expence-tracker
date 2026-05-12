# Developer Guide

---

## Добавить новый модуль в API

Пример: модуль `budget`.

### 1. Создать структуру директорий

```
apps/api/src/modules/budget/
├── budget.module.ts
├── budget.controller.ts
├── budget.repository.ts
├── entities/
│   └── budget.entity.ts
├── commands/
│   ├── index.ts
│   ├── create-budget.command.ts
│   └── create-budget.handler.ts
├── queries/
│   ├── index.ts
│   ├── get-all-budgets.query.ts
│   └── get-all-budgets.handler.ts
└── dto/
    ├── create-budget.dto.ts
    └── budget-response.dto.ts
```

### 2. Создать Command

```typescript
// commands/create-budget.command.ts
export class CreateBudgetCommand {
  constructor(
    public readonly userId: string,
    public readonly categoryId: string,
    public readonly limit: number,
    public readonly month: number,
    public readonly year: number,
  ) {}
}
```

### 3. Создать Handler

```typescript
// commands/create-budget.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBudgetCommand } from './create-budget.command';
import { BudgetRepository } from '../budget.repository';

@CommandHandler(CreateBudgetCommand)
export class CreateBudgetHandler implements ICommandHandler<CreateBudgetCommand> {
  constructor(private readonly budgetRepository: BudgetRepository) {}

  async execute(command: CreateBudgetCommand) {
    const { userId, categoryId, limit, month, year } = command;
    return this.budgetRepository.create(userId, categoryId, limit, month, year);
  }
}
```

### 4. Создать Repository

```typescript
// budget.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, categoryId: string, limit: number, month: number, year: number) {
    return this.prisma.budget.create({
      data: { userId, categoryId, limit, month, year },
    });
  }
}
```

### 5. Создать DTO

```typescript
// dto/create-budget.dto.ts
import { IsUUID, IsNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  limit!: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year!: number;
}
```

### 6. Создать Controller

```typescript
// budget.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CreateBudgetCommand } from './commands';
import { GetAllBudgetsQuery } from './queries';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Создать бюджет' })
  @ApiResponse({ status: 201, description: 'Бюджет создан' })
  @Post()
  create(@Body() dto: CreateBudgetDto, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new CreateBudgetCommand(user.id, dto.categoryId, dto.limit, dto.month, dto.year),
    );
  }

  @ApiOperation({ summary: 'Получить все бюджеты' })
  @ApiResponse({ status: 200, description: 'Список бюджетов' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.queryBus.execute(new GetAllBudgetsQuery(user.id));
  }
}
```

### 7. Зарегистрировать модуль

```typescript
// budget.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BudgetController } from './budget.controller';
import { BudgetRepository } from './budget.repository';
import { CreateBudgetHandler } from './commands';
import { GetAllBudgetsHandler } from './queries';

@Module({
  imports: [CqrsModule],
  controllers: [BudgetController],
  providers: [BudgetRepository, CreateBudgetHandler, GetAllBudgetsHandler],
})
export class BudgetModule {}
```

```typescript
// app.module.ts — добавить импорт
import { BudgetModule } from './modules/budget/budget.module';

@Module({
  imports: [
    // ...существующие модули
    BudgetModule,
  ],
})
export class AppModule {}
```

---

## Добавить фичу на Frontend

Пример: фича `budget` (отображение бюджетов).

### Структура

```
apps/web/src/features/budget/
├── index.ts          # публичный экспорт
├── api/
│   └── budget.api.ts # вызовы к /budgets
├── model/
│   ├── budget.types.ts
│   └── budget.schemas.ts   # Zod-схемы форм
└── ui/
    └── BudgetList.tsx
```

### API-слой

```typescript
// features/budget/api/budget.api.ts
import { apiClient } from '@/shared/api/client';

export async function getBudgets(token: string) {
  return apiClient<Budget[]>('/budgets', { token });
}

export async function createBudget(data: CreateBudgetPayload, token: string) {
  return apiClient<Budget>('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}
```

### Публичный экспорт

```typescript
// features/budget/index.ts
export { BudgetList } from './ui/BudgetList';
export { getBudgets, createBudget } from './api/budget.api';
export type { Budget } from './model/budget.types';
```

### Добавить shadcn/ui компонент

```bash
cd apps/web
npx shadcn@latest add <component-name>
```

Компонент появится в `src/components/ui/`. Переиспользуемые обёртки выносить в `src/shared/ui/`.

---

## Добавить миграцию БД

1. Изменить `apps/api/prisma/schema.prisma`
2. Применить миграцию:
   ```bash
   pnpm prisma:migrate
   # Ввести название миграции, например: add_budget_model
   ```
3. Обновить Prisma Client:
   ```bash
   pnpm prisma:generate
   ```
4. TypeScript-типы Prisma обновятся автоматически — пересобирать не нужно.

### Пример: добавить модель Budget

```prisma
// schema.prisma
model Budget {
  id         String   @id @default(uuid())
  limit      Decimal  @db.Decimal(12, 2)
  month      Int
  year       Int
  categoryId String   @map("category_id")
  userId     String   @map("user_id")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  category Category @relation(fields: [categoryId], references: [id])
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("budgets")
}
```

После этого добавить `budgets Budget[]` в модель `User` и `Category`.

---

## Чеклист перед PR

- [ ] `pnpm lint && pnpm format:check` — без ошибок
- [ ] `pnpm build` — успешная сборка обоих приложений
- [ ] Новые эндпоинты задекорированы (`@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiResponse`)
- [ ] DTO задекорированы `@ApiProperty` / `@ApiPropertyOptional`
- [ ] Handlers не обращаются к Prisma напрямую (только через Repository)
- [ ] Контроллеры не содержат бизнес-логику (только вызовы CommandBus/QueryBus)
- [ ] Новый модуль зарегистрирован в `AppModule`
- [ ] Для frontend: импорты идут только сверху вниз по FSD-слоям