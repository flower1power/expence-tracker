import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be valid hex' })
  color!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  icon!: string;
}
