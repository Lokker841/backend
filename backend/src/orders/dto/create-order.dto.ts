import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Amount of bonus points to use for the order',
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bonusAmount?: number;
}