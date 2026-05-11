import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionSummaryQuery } from './get-transaction-summary.query';
import {
  TransactionRepository,
  TransactionSummary,
} from '../transaction.repository';

@QueryHandler(GetTransactionSummaryQuery)
export class GetTransactionSummaryHandler
  implements IQueryHandler<GetTransactionSummaryQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(query: GetTransactionSummaryQuery): Promise<TransactionSummary> {
    return this.transactionRepository.getSummaryByMonth(
      query.userId,
      query.year,
      query.month,
    );
  }
}
