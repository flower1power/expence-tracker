import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionSummaryQueryDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 12, description: 'Месяц (1–12)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 2100, description: 'Год' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;
}

export class CategorySummaryDto {
  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ example: 'Продукты' })
  categoryName!: string;

  @ApiProperty({ example: '#FF5733' })
  categoryColor!: string;

  @ApiProperty({ example: 'shopping-cart' })
  categoryIcon!: string;

  @ApiProperty({ example: '3200.00', description: 'Сумма по категории (строка)' })
  total!: string;

  @ApiProperty({ example: 'EXPENSE' })
  type!: string;
}

export class TransactionSummaryResponseDto {
  @ApiProperty({ example: '10000.00', description: 'Суммарный доход (строка)' })
  totalIncome!: string;

  @ApiProperty({ example: '7500.00', description: 'Суммарный расход (строка)' })
  totalExpense!: string;

  @ApiProperty({ example: '2500.00', description: 'Баланс (строка)' })
  balance!: string;

  @ApiProperty({ type: [CategorySummaryDto] })
  byCategory!: CategorySummaryDto[];
}
