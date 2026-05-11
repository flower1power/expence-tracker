import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date!: string;

  @IsUUID()
  categoryId!: string;
}
