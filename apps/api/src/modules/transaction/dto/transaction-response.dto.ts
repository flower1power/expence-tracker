import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CategoryInTransaction {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Продукты' })
  name!: string;

  @ApiProperty({ example: '#FF5733' })
  color!: string;

  @ApiProperty({ example: 'shopping-cart' })
  icon!: string;
}

export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: '1500.50', description: 'Сумма транзакции (строка)' })
  amount!: string;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiPropertyOptional({ example: 'Продукты в магазине', nullable: true })
  description!: string | null;

  @ApiProperty({ example: '2026-05-12T00:00:00.000Z' })
  date!: Date;

  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ example: '2026-05-12T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: () => CategoryInTransaction })
  category!: CategoryInTransaction;
}
