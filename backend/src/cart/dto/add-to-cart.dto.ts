import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'Product ID to add to cart' })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 1, description: 'Quantity to add' })
  @IsInt()
  @Min(1)
  quantity: number;
} 