import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Продукты' })
  name!: string;

  @ApiProperty({ example: '#FF5733' })
  color!: string;

  @ApiProperty({ example: '🛒' })
  icon!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ example: '2026-05-12T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-12T10:00:00.000Z' })
  updatedAt!: Date;
}
