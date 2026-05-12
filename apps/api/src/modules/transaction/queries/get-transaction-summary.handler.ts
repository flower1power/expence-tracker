import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionSummaryQuery } from './get-transaction-summary.query';
import {
  TransactionRepository,
  TransactionSummary,
} from '../transaction.repository';

/** Обработчик запроса на получение финансовой сводки за месяц. */
@QueryHandler(GetTransactionSummaryQuery)
export class GetTransactionSummaryHandler
  implements IQueryHandler<GetTransactionSummaryQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Вычисляет и возвращает сводку доходов и расходов за указанный месяц.
   *
   * @param query - Запрос с userId, year и month
   * @returns Объект с итогами по доходам, расходам и разбивкой по категориям
   */
  async execute(query: GetTransactionSummaryQuery): Promise<TransactionSummary> {
    return this.transactionRepository.getSummaryByMonth(
      query.userId,
      query.year,
      query.month,
    );
  }
}
