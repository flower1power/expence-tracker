import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionByIdQuery } from './get-transaction-by-id.query';
import {
  TransactionRepository,
  TransactionWithCategory,
} from '../transaction.repository';

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler
  implements IQueryHandler<GetTransactionByIdQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    query: GetTransactionByIdQuery,
  ): Promise<TransactionWithCategory | null> {
    return this.transactionRepository.findById(query.id);
  }
}
