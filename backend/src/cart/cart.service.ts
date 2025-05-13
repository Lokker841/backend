import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { BonusService } from '../bonus/bonus.service';
import { CartDto, CartItemDto, CartTotalDto, CartClearedDto } from './dto/cart.dto';
import { Prisma } from '@prisma/client';
import { AddToCartDto } from './dto/add-to-cart.dto';

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private bonusService: BonusService,
  ) {}

  async getCart(userId: number): Promise<CartDto> {
    const cart = await this.prisma.$transaction(async (tx) => {
      const existingCart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!existingCart) {
        return tx.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }

      return existingCart;
    });

    return this.mapCartToDto(cart);
  }

  async addItem(userId: number, productId: number, quantity: number): Promise<CartDto> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        bonusPercent: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const price = product.price;
    const totalPrice = price * quantity;
    const earnedBonus = await this.bonusService.calculateBonusPoints(
      userId,
      totalPrice,
      product.bonusPercent,
    );

    try {
      const updatedCart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: {
            create: {
              productId,
              quantity,
              price,
              totalPrice,
              earnedBonus,
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return this.mapCartToDto(updatedCart);
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation - item already exists
        return this.updateItemQuantity(userId, productId, quantity);
      }
      throw error;
    }
  }

  private async getOrCreateCart(userId: number): Promise<CartWithItems> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async updateItemQuantity(userId: number, productId: number, quantity: number): Promise<CartDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = cart.items.find(item => item.productId === productId);
    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        bonusPercent: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const price = product.price;
    const totalPrice = price * quantity;
    const earnedBonus = await this.bonusService.calculateBonusPoints(
      userId,
      totalPrice,
      product.bonusPercent,
    );

    const updatedCart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          update: {
            where: { id: cartItem.id },
            data: { quantity, totalPrice, earnedBonus },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.mapCartToDto(updatedCart);
  }

  async removeItem(userId: number, productId: number): Promise<CartDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = cart.items.find(item => item.productId === productId);
    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    const updatedCart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          delete: { id: cartItem.id },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.mapCartToDto(updatedCart);
  }

  async clearCart(userId: number): Promise<CartClearedDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared successfully' };
  }

  async getCartTotal(userId: number): Promise<CartTotalDto> {
    const cart = await this.getCart(userId);
    
    const total = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    return { total };
  }

  async addMultipleItems(userId: number, items: AddToCartDto[]): Promise<CartDto> {
    const cart = await this.getOrCreateCart(userId);
    
    // Process each item sequentially
    let updatedCart = cart;
    
    for (const item of items) {
      const { productId, quantity } = item;
      
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          bonusPercent: true,
        },
      });

      if (!product) {
        throw new BadRequestException(`Product with ID ${productId} not found`);
      }

      const price = product.price;
      const totalPrice = price * quantity;
      const earnedBonus = await this.bonusService.calculateBonusPoints(
        userId,
        totalPrice,
        product.bonusPercent,
      );

      // Check if the item already exists in the cart
      const existingItem = updatedCart.items.find(cartItem => cartItem.productId === productId);

      if (existingItem) {
        // Update the existing item
        updatedCart = await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: {
              update: {
                where: { id: existingItem.id },
                data: { 
                  quantity: existingItem.quantity + quantity,
                  totalPrice: (existingItem.quantity + quantity) * price,
                  earnedBonus: earnedBonus
                },
              },
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      } else {
        // Add a new item
        updatedCart = await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: {
              create: {
                productId,
                quantity,
                price,
                totalPrice,
                earnedBonus,
              },
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }
    }

    return this.mapCartToDto(updatedCart);
  }

  private mapCartToDto(cart: CartWithItems): CartDto {
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        bonusPercent: item.product.bonusPercent,
        earnedBonus: item.earnedBonus,
      })),
    };
  }
} 