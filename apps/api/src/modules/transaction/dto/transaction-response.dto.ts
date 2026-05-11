import { TransactionType } from '@prisma/client';

export class CategoryInTransaction {
  id!: string;
  name!: string;
  color!: string;
  icon!: string;
}

export class TransactionResponseDto {
  id!: string;
  amount!: string;
  type!: TransactionType;
  description!: string | null;
  date!: Date;
  categoryId!: string;
  userId!: string;
  createdAt!: Date;
  category!: CategoryInTransaction;
}
