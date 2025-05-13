import { IsString, IsNumber, IsBoolean, Min, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Widget',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'A high-quality widget for all your needs',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'List of ingredients used in the product',
    example: 'Мука, Сахар, Яйца, Молоко',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  ingredients?: string;

  @ApiProperty({
    description: 'URL to the product image',
    example: './content/author_muffins/chok.png',
    required: false
  })
  @IsString()
  @IsOptional()
  pictureURL?: string;

  @ApiProperty({
    description: 'Product price',
    example: 299,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Bonus points percentage earned from purchase',
    example: 5.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  bonusPercent?: number;

  @ApiProperty({
    description: 'Whether the product can be purchased with bonus points',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  canPayByBonus?: boolean;
} 