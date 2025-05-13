import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Returns all products',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Шоколадный бархат' },
          description: { type: 'string', example: 'Нежный шоколадный маффин с бархатистой текстурой' },
          ingredients: { 
            type: 'array',
            items: { type: 'string' },
            example: ['Мука', 'Сахар', 'Яйца', 'Молоко', 'Какао', 'Сливочное масло', 'Шоколадные капли']
          },
          pictureURL: { type: 'string', example: './content/author_muffins/chok.png' },
          price: { type: 'number', example: 299 },
          bonusPercent: { type: 'number', example: 5 },
          canPayByBonus: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the product',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Premium Widget' },
        description: { type: 'string', example: 'A high-quality widget for all your needs' },
        price: { type: 'number', example: 29.99 },
        bonusPercent: { type: 'number', example: 5.0 },
        canPayByBonus: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productsService.findById(Number(id));
  }

  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Premium Widget' },
        description: { type: 'string', example: 'A high-quality widget for all your needs' },
        price: { type: 'number', example: 29.99 },
        bonusPercent: { type: 'number', example: 5.0 },
        canPayByBonus: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Update product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Updated Widget' },
        description: { type: 'string', example: 'An updated high-quality widget' },
        price: { type: 'number', example: 39.99 },
        bonusPercent: { type: 'number', example: 7.0 },
        canPayByBonus: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(Number(id), updateProductDto);
  }

  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Premium Widget' },
        description: { type: 'string', example: 'A high-quality widget' },
        price: { type: 'number', example: 29.99 },
        bonusPercent: { type: 'number', example: 5.0 },
        canPayByBonus: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(Number(id));
  }
} 