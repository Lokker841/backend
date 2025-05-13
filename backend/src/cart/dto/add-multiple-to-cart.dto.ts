import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddToCartDto } from './add-to-cart.dto';

export class AddMultipleToCartDto {
  @ApiProperty({
    type: [AddToCartDto],
    description: 'Array of cart items to add',
    example: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddToCartDto)
  items: AddToCartDto[];
} 