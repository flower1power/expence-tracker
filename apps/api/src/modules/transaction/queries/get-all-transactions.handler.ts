import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllTransactionsQuery } from './get-all-transactions.query';
import {
  TransactionRepository,
  TransactionWithCategory,
} from '../transaction.repository';

@QueryHandler(GetAllTransactionsQuery)
export class GetAllTransactionsHandler
  implements IQueryHandler<GetAllTransactionsQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    query: GetAllTransactionsQuery,
  ): Promise<TransactionWithCategory[]> {
    return this.transactionRepository.findAllByUserId(
      query.userId,
      query.filter,
    );
  }
}
