import { TransactionType } from '@prisma/client';

/** Параметры фильтрации для запроса списка транзакций. */
export interface TransactionFilterParams {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  categoryId?: string;
}

/** Запрос для получения всех транзакций пользователя с необязательной фильтрацией. */
export class GetAllTransactionsQuery {
  /**
   * @param userId - UUID пользователя
   * @param filter - Необязательные параметры фильтрации
   */
  constructor(
    public readonly userId: string,
    public readonly filter?: TransactionFilterParams,
  ) {}
}
