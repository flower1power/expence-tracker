import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateTransactionCommand } from './update-transaction.command';
import {
  TransactionRepository,
  TransactionWithCategory,
} from '../transaction.repository';
import { CategoryRepository } from '../../category/category.repository';
import { GetTransactionByIdQuery } from '../queries/get-transaction-by-id.query';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler
  implements ICommandHandler<UpdateTransactionCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: UpdateTransactionCommand,
  ): Promise<TransactionWithCategory> {
    const { id, userId, data } = command;

    const transaction = await this.queryBus.execute(
      new GetTransactionByIdQuery(id),
    );

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.userId !== userId) {
        throw new ForbiddenException('Category does not belong to user');
      }
    }

    return this.transactionRepository.update(id, data);
  }
}
