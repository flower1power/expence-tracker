/** Запрос для получения финансовой сводки за указанный месяц. */
export class GetTransactionSummaryQuery {
  /**
   * @param userId - UUID пользователя
   * @param year - Год (например, 2024)
   * @param month - Месяц (1–12)
   */
  constructor(
    public readonly userId: string,
    public readonly year: number,
    public readonly month: number,
  ) {}
}
