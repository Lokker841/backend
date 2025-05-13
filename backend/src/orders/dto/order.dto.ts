import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'Product Name' })
  productName: string;

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

export class OrderDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 5000 })
  totalAmount: number;

  @ApiProperty({ example: 250 })
  totalBonus: number;

  @ApiProperty({ example: 100 })
  usedBonus: number;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];

  @ApiProperty({ example: '2024-03-13T16:05:59.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-13T16:05:59.000Z' })
  updatedAt: Date;
} 