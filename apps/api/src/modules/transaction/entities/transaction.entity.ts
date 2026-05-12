import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/** Сущность транзакции, отражающая модель Prisma. */
export class Transaction {
  id!: string;
  amount!: Decimal;
  type!: TransactionType;
  description!: string | null;
  date!: Date;
  categoryId!: string;
  userId!: string;
  createdAt!: Date;
}
