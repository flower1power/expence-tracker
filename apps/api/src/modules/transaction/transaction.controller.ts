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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionSummaryQueryDto } from './dto/transaction-summary.dto';
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

function toResponseDto(transaction: TransactionWithCategory) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.commandBus.execute(new DeleteTransactionCommand(id, user.id));
  }
}
