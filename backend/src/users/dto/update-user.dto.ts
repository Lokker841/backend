import { IsString, IsOptional, Matches, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User phone number in international format',
    example: '+79123456789',
    required: false
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{10,14}$/, {
    message: 'Phone number must be in international format (e.g., +79123456789)'
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'User birthday',
    example: '1990-01-01',
    required: false
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;
} 