/** Запрос для получения транзакции по UUID. */
export class GetTransactionByIdQuery {
  /** @param id - UUID транзакции */
  constructor(public readonly id: string) {}
}
