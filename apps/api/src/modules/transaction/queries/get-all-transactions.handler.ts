import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllTransactionsQuery } from './get-all-transactions.query';
import {
  TransactionRepository,
  TransactionWithCategory,
} from '../transaction.repository';

/** Обработчик запроса на получение списка транзакций. */
@QueryHandler(GetAllTransactionsQuery)
export class GetAllTransactionsHandler
  implements IQueryHandler<GetAllTransactionsQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Возвращает транзакции пользователя, применяя фильтр.
   *
   * @param query - Запрос с userId и необязательным фильтром
   * @returns Список транзакций с данными категорий, отсортированных по дате убывания
   */
  async execute(
    query: GetAllTransactionsQuery,
  ): Promise<TransactionWithCategory[]> {
    return this.transactionRepository.findAllByUserId(
      query.userId,
      query.filter,
    );
  }
}
