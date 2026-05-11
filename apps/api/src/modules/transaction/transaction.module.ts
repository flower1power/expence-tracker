import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionController } from './transaction.controller';
import { TransactionRepository } from './transaction.repository';
import { CategoryRepository } from '../category/category.repository';
import {
  CreateTransactionHandler,
  UpdateTransactionHandler,
  DeleteTransactionHandler,
} from './commands';
import {
  GetTransactionByIdHandler,
  GetAllTransactionsHandler,
  GetTransactionSummaryHandler,
} from './queries';

const CommandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  DeleteTransactionHandler,
];

const QueryHandlers = [
  GetTransactionByIdHandler,
  GetAllTransactionsHandler,
  GetTransactionSummaryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [TransactionController],
  providers: [
    TransactionRepository,
    CategoryRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class TransactionModule {}
