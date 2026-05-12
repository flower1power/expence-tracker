import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Продукты', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: '#FF5733', description: 'HEX-цвет категории' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be valid hex' })
  color!: string;

  @ApiProperty({ example: '🛒', minLength: 1, maxLength: 10, description: 'Эмодзи или иконка' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  icon!: string;
}
