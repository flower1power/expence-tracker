import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionSummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;
}

export class CategorySummaryDto {
  categoryId!: string;
  categoryName!: string;
  categoryColor!: string;
  categoryIcon!: string;
  total!: string;
  type!: string;
}

export class TransactionSummaryResponseDto {
  totalIncome!: string;
  totalExpense!: string;
  balance!: string;
  byCategory!: CategorySummaryDto[];
}
