import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreorderDto {
  @ApiProperty({
    example: '+1234567890',
    description: 'Customer phone number',
  })
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Invalid phone number format. Use international format starting with +' })
  phone: string;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email address',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'I would like to preorder 2 items',
    description: 'Preorder message',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
} 