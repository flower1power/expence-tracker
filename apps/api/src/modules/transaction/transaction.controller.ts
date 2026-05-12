import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionSummaryQueryDto, TransactionSummaryResponseDto } from './dto/transaction-summary.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import {
  CreateTransactionCommand,
  UpdateTransactionCommand,
  DeleteTransactionCommand,
} from './commands';
import {
  GetAllTransactionsQuery,
  GetTransactionByIdQuery,
  GetTransactionSummaryQuery,
} from './queries';
import {
  TransactionWithCategory,
  CategorySummary,
} from './transaction.repository';

/**
 * Преобразует Decimal amount в строку для JSON-сериализации.
 *
 * @param transaction - Транзакция с amount типа Prisma.Decimal
 * @returns Объект транзакции с amount в виде строки
 */
function toResponseDto(transaction: TransactionWithCategory) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
}

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую транзакцию для текущего пользователя.
   *
   * @param dto - Данные новой транзакции
   * @param user - Текущий аутентифицированный пользователь
   * @returns Созданная транзакция с данными категории
   * @throws NotFoundException если категория не найдена
   * @throws ForbiddenException если категория принадлежит другому пользователю
   */
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 201, description: 'Транзакция создана', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Категория не принадлежит пользователю' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @Post()
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.commandBus.execute(
      new CreateTransactionCommand(
        dto.amount,
        dto.type,
        new Date(dto.date),
        dto.categoryId,
        user.id,
        dto.description,
      ),
    );
    return toResponseDto(result);
  }

  /**
   * Возвращает список транзакций текущего пользователя с возможностью фильтрации.
   *
   * @param filter - Параметры фильтрации (диапазон дат, тип, категория)
   * @param user - Текущий аутентифицированный пользователь
   * @returns Список транзакций, отсортированных по дате убывания
   */
  @ApiOperation({ summary: 'Получить список транзакций' })
  @ApiResponse({ status: 200, description: 'Список транзакций пользователя', type: [TransactionResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get()
  async findAll(
    @Query() filter: TransactionFilterDto,
    @CurrentUser() user: User,
  ) {
    const filterParams = {
      dateFrom: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
      dateTo: filter.dateTo ? new Date(filter.dateTo) : undefined,
      type: filter.type,
      categoryId: filter.categoryId,
    };

    const results: TransactionWithCategory[] = await this.queryBus.execute(
      new GetAllTransactionsQuery(user.id, filterParams),
    );

    return results.map(toResponseDto);
  }

  /**
   * Возвращает финансовую сводку за указанный месяц: доходы, расходы, баланс и разбивку по категориям.
   *
   * @param query - Год и месяц для расчёта сводки
   * @param user - Текущий аутентифицированный пользователь
   * @returns Объект с totalIncome, totalExpense, balance и массивом byCategory
   */
  @ApiOperation({ summary: 'Получить финансовую сводку за месяц' })
  @ApiResponse({ status: 200, description: 'Сводка доходов и расходов', type: TransactionSummaryResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('summary')
  async getSummary(
    @Query() query: TransactionSummaryQueryDto,
    @CurrentUser() user: User,
  ) {
    const summary = await this.queryBus.execute(
      new GetTransactionSummaryQuery(user.id, query.year, query.month),
    );

    const balance = summary.totalIncome.minus(summary.totalExpense);

    return {
      totalIncome: summary.totalIncome.toString(),
      totalExpense: summary.totalExpense.toString(),
      balance: balance.toString(),
      byCategory: summary.byCategory.map((c: CategorySummary) => ({
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        categoryColor: c.categoryColor,
        categoryIcon: c.categoryIcon,
        total: c.total.toString(),
        type: c.type,
      })),
    };
  }

  /**
   * Возвращает транзакцию по UUID.
   *
   * @param id - UUID транзакции
   * @param user - Текущий аутентифицированный пользователь
   * @returns Транзакция с данными категории
   * @throws NotFoundException если транзакция не найдена
   * @throws ForbiddenException если транзакция принадлежит другому пользователю
   */
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Транзакция найдена', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const transaction: TransactionWithCategory | null =
      await this.queryBus.execute(new GetTransactionByIdQuery(id));

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return toResponseDto(transaction);
  }

  /**
   * Обновляет поля транзакции по UUID.
   *
   * @param id - UUID транзакции
   * @param dto - Поля для обновления (все необязательны)
   * @param user - Текущий аутентифицированный пользователь
   * @returns Обновлённая транзакция с данными категории
   * @throws NotFoundException если транзакция или указанная категория не найдена
   * @throws ForbiddenException если транзакция или категория принадлежит другому пользователю
   */
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена', type: TransactionResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Транзакция или категория не найдена' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: User,
  ) {
    const data = {
      amount: dto.amount,
      type: dto.type,
      description: dto.description,
      date: dto.date ? new Date(dto.date) : undefined,
      categoryId: dto.categoryId,
    };

    const result = await this.commandBus.execute(
      new UpdateTransactionCommand(id, user.id, data),
    );

    return toResponseDto(result);
  }

  /**
   * Удаляет транзакцию по UUID.
   *
   * @param id - UUID транзакции
   * @param user - Текущий аутентифицированный пользователь
   * @throws NotFoundException если транзакция не найдена
   * @throws ForbiddenException если транзакция принадлежит другому пользователю
   */
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Транзакция удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(new DeleteTransactionCommand(id, user.id));
  }
}
