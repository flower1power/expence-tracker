import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTransactionByIdQuery } from './get-transaction-by-id.query';
import {
  TransactionRepository,
  TransactionWithCategory,
} from '../transaction.repository';

/** Обработчик запроса на получение транзакции по UUID. */
@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler
  implements IQueryHandler<GetTransactionByIdQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Возвращает транзакцию с данными категории по UUID.
   *
   * @param query - Запрос с UUID транзакции
   * @returns Транзакция с данными категории или null, если не найдена
   */
  async execute(
    query: GetTransactionByIdQuery,
  ): Promise<TransactionWithCategory | null> {
    return this.transactionRepository.findById(query.id);
  }
}
