import { TransactionType } from '@prisma/client';

/** Команда для создания новой транзакции. */
export class CreateTransactionCommand {
  /**
   * @param amount - Сумма транзакции (минимум 0.01)
   * @param type - Тип транзакции: INCOME или EXPENSE
   * @param date - Дата совершения транзакции
   * @param categoryId - UUID категории
   * @param userId - UUID владельца транзакции
   * @param description - Необязательное описание
   */
  constructor(
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: Date,
    public readonly categoryId: string,
    public readonly userId: string,
    public readonly description?: string,
  ) {}
}
