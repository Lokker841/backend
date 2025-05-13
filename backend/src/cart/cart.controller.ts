import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CartDto, CartTotalDto, CartClearedDto } from './dto/cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AddMultipleToCartDto } from './dto/add-multiple-to-cart.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user cart with items',
    type: CartDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@Request() req): Promise<CartDto> {
    return this.cartService.getCart(req.user.id);
  }

  @Get('total')
  @ApiOperation({ summary: 'Get cart total' })
  @ApiResponse({
    status: 200,
    description: 'Returns the cart total amount',
    type: CartTotalDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCartTotal(@Request() req): Promise<CartTotalDto> {
    return this.cartService.getCartTotal(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item has been successfully added to cart',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid quantity or product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addToCart(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartDto> {
    return this.cartService.addItem(
      req.user.id,
      addToCartDto.productId,
      addToCartDto.quantity,
    );
  }

  @Put('items/:productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Item quantity has been successfully updated',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid quantity' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async updateCartItem(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartDto> {
    return this.cartService.updateItemQuantity(
      req.user.id,
      Number(productId),
      updateCartItemDto.quantity,
    );
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item has been successfully removed from cart',
    type: CartDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async removeFromCart(
    @Request() req,
    @Param('productId') productId: string,
  ): Promise<CartDto> {
    return this.cartService.removeItem(req.user.id, Number(productId));
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart has been successfully cleared',
    type: CartClearedDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(@Request() req): Promise<CartClearedDto> {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('items/multiple')
  @ApiOperation({ summary: 'Add multiple items to cart' })
  @ApiResponse({
    status: 201,
    description: 'Items have been successfully added to cart',
    type: CartDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid items data or products not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addMultipleToCart(
    @Request() req,
    @Body() addMultipleToCartDto: AddMultipleToCartDto,
  ): Promise<CartDto> {
    return this.cartService.addMultipleItems(
      req.user.id,
      addMultipleToCartDto.items,
    );
  }
}