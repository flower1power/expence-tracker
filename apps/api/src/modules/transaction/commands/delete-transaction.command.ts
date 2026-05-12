/** Команда для удаления транзакции. */
export class DeleteTransactionCommand {
  /**
   * @param id - UUID транзакции
   * @param userId - UUID пользователя (для проверки владения)
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
