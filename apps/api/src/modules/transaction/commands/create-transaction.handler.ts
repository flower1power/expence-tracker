import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateTransactionCommand } from './create-transaction.command';
import {
  TransactionRepository,
  TransactionWithCategory,
} from '../transaction.repository';
import { CategoryRepository } from '../../category/category.repository';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    command: CreateTransactionCommand,
  ): Promise<TransactionWithCategory> {
    const { amount, type, date, categoryId, userId, description } = command;

    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Category does not belong to user');
    }

    return this.transactionRepository.create(
      amount,
      type,
      date,
      categoryId,
      userId,
      description,
    );
  }
}
