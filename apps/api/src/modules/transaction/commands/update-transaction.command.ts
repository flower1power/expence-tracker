import { TransactionType } from '@prisma/client';

export interface UpdateTransactionData {
  amount?: number;
  type?: TransactionType;
  description?: string;
  date?: Date;
  categoryId?: string;
}

export class UpdateTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: UpdateTransactionData,
  ) {}
}
