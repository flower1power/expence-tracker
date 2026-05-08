# План реализации модуля Category

## Обзор

Создание модуля категорий трат с CRUD операциями, JWT защитой и CQRS архитектурой.

---

## Чек-лист задач

### 1. База данных (Prisma)
- [ ] Добавить модель `Category` в `prisma/schema.prisma`
- [ ] Добавить связь `categories` в модель `User`
- [ ] Выполнить миграцию `pnpm prisma:migrate`

### 2. Entity и Repository
- [ ] Создать `category.entity.ts` — типы Category
- [ ] Создать `category.repository.ts` — методы работы с БД

### 3. DTO с валидацией
- [ ] `create-category.dto.ts` — валидация создания
- [ ] `update-category.dto.ts` — валидация обновления (PartialType)
- [ ] `category-response.dto.ts` — ответ API

### 4. CQRS Commands
- [ ] `CreateCategoryCommand` + `CreateCategoryHandler`
- [ ] `UpdateCategoryCommand` + `UpdateCategoryHandler`
- [ ] `DeleteCategoryCommand` + `DeleteCategoryHandler`

### 5. CQRS Queries
- [ ] `GetAllCategoriesQuery` + Handler — все категории пользователя
- [ ] `GetCategoryByIdQuery` + Handler — одна категория (для проверки владельца)

### 6. Controller
- [ ] `CategoryController` с JWT Guard
- [ ] `POST /categories` — создание
- [ ] `GET /categories` — список
- [ ] `PATCH /categories/:id` — обновление
- [ ] `DELETE /categories/:id` — удаление

### 7. Module и интеграция
- [ ] Создать `CategoryModule` с импортами
- [ ] Добавить `CategoryModule` в `AppModule`

### 8. Тестирование
- [ ] Проверить все endpoints через curl/Postman

---

## Структура файлов

```
apps/api/src/modules/category/
├── commands/
│   ├── create-category.command.ts
│   ├── create-category.handler.ts
│   ├── update-category.command.ts
│   ├── update-category.handler.ts
│   ├── delete-category.command.ts
│   ├── delete-category.handler.ts
│   └── index.ts
├── queries/
│   ├── get-all-categories.query.ts
│   ├── get-all-categories.handler.ts
│   ├── get-category-by-id.query.ts
│   ├── get-category-by-id.handler.ts
│   └── index.ts
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   └── category-response.dto.ts
├── entities/
│   └── category.entity.ts
├── category.repository.ts
├── category.controller.ts
└── category.module.ts
```

---

## Детали реализации

### Prisma Schema (добавить)

```prisma
model Category {
  id        String   @id @default(uuid())
  name      String
  color     String   // hex color, e.g. "#FF5733"
  icon      String   // emoji or string
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("categories")
}

// Добавить в модель User:
// categories Category[]
```

### DTO валидация

```typescript
// create-category.dto.ts
export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be valid hex' })
  color!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  icon!: string;
}
```

### Controller с JWT Guard

```typescript
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: User) {
    return this.commandBus.execute(
      new CreateCategoryCommand(dto.name, dto.color, dto.icon, user.id)
    );
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.queryBus.execute(new GetAllCategoriesQuery(user.id));
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(id, user.id, dto)
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(new DeleteCategoryCommand(id, user.id));
  }
}
```

### Проверка владельца

В handlers `Update` и `Delete` проверять, что `category.userId === currentUser.id`. Если нет — выбрасывать `ForbiddenException`.

---

## Файлы для модификации

| Файл | Действие |
|------|----------|
| `apps/api/prisma/schema.prisma` | Добавить модель Category и связь |
| `apps/api/src/app.module.ts` | Импортировать CategoryModule |

---

## Верификация

1. Запустить БД: `pnpm db:up`
2. Применить миграцию: `pnpm prisma:migrate`
3. Запустить API: `pnpm dev:api`
4. Тесты через curl:

```bash
# Получить токен (login)
TOKEN="Bearer ..."

# Создать категорию
curl -X POST http://localhost:3001/categories \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Еда","color":"#FF5733","icon":"🍔"}'

# Получить все категории
curl http://localhost:3001/categories -H "Authorization: $TOKEN"

# Обновить
curl -X PATCH http://localhost:3001/categories/{id} \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Продукты"}'

# Удалить
curl -X DELETE http://localhost:3001/categories/{id} \
  -H "Authorization: $TOKEN"
```

---

## Примечания

- CQRS используется для взаимодействия с User через QueryBus (проверка существования пользователя если нужно)
- `onDelete: Cascade` в Prisma — при удалении пользователя удаляются его категории
- Валидация hex цвета через regex `^#[0-9A-Fa-f]{6}$`
