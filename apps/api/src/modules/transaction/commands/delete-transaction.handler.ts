import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteTransactionCommand } from './delete-transaction.command';
import { TransactionRepository } from '../transaction.repository';
import { GetTransactionByIdQuery } from '../queries/get-transaction-by-id.query';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler
  implements ICommandHandler<DeleteTransactionCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: DeleteTransactionCommand): Promise<void> {
    const { id, userId } = command;

    const transaction = await this.queryBus.execute(
      new GetTransactionByIdQuery(id),
    );

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.transactionRepository.delete(id);
  }
}
