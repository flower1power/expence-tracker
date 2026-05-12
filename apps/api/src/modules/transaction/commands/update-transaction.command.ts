import { TransactionType } from '@prisma/client';

/** Поля транзакции, доступные для изменения. */
export interface UpdateTransactionData {
  amount?: number;
  type?: TransactionType;
  description?: string;
  date?: Date;
  categoryId?: string;
}

/** Команда для обновления существующей транзакции. */
export class UpdateTransactionCommand {
  /**
   * @param id - UUID транзакции для обновления
   * @param userId - UUID пользователя (для проверки владения)
   * @param data - Поля для обновления
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: UpdateTransactionData,
  ) {}
}
