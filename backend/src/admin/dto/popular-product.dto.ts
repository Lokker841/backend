import { ApiProperty } from '@nestjs/swagger';

export class PopularProductDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  orderCount: number;

  @ApiProperty()
  totalRevenue: number;
} 