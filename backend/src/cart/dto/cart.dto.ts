import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'Product Name' })
  name: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1000 })
  price: number;

  @ApiProperty({ example: 2000 })
  totalPrice: number;

  @ApiProperty({ example: 5 })
  bonusPercent: number;

  @ApiProperty({ example: 100 })
  earnedBonus: number;
}

export class CartDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ type: [CartItemDto] })
  items: CartItemDto[];
}

export class CartTotalDto {
  @ApiProperty({ example: 5000 })
  total: number;
}

export class CartClearedDto {
  @ApiProperty({ example: 'Cart cleared successfully' })
  message: string;
} 