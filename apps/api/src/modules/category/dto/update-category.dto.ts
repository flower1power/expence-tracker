import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Продукты', minLength: 1, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '#FF5733', description: 'HEX-цвет категории' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be valid hex' })
  color?: string;

  @ApiPropertyOptional({ example: '🛒', minLength: 1, maxLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  icon?: string;
}
