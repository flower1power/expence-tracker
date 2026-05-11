import { TransactionType } from '@prisma/client';

export class CreateTransactionCommand {
  constructor(
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: Date,
    public readonly categoryId: string,
    public readonly userId: string,
    public readonly description?: string,
  ) {}
}
