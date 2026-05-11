import { TransactionType } from '@prisma/client';

export interface TransactionFilterParams {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  categoryId?: string;
}

export class GetAllTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly filter?: TransactionFilterParams,
  ) {}
}
