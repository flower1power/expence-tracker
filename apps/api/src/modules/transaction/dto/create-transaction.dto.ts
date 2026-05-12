import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ example: 1500.5, minimum: 0.01, description: 'Сумма транзакции' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ example: 'Продукты в магазине' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-05-12', description: 'Дата транзакции (ISO 8601)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'uuid-категории', format: 'uuid' })
  @IsUUID()
  categoryId!: string;
}
