import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { BonusService } from '../bonus/bonus.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private bonusService: BonusService,
  ) {}

  private async validateOrder(userId: number, bonusAmount?: number) {
    const cart = await this.cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    if (bonusAmount) {
      const bonusInfo = await this.bonusService.getUserBonusInfo(userId);
      if (bonusAmount > bonusInfo.balance) {
        throw new BadRequestException('Insufficient bonus points');
      }
    }

    return cart;
  }

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<OrderDto> {
    const cart = await this.validateOrder(userId, createOrderDto.bonusAmount);
    
    // Calculate totals
    const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    let finalAmount = totalAmount;
    
    // Apply bonus points if used
    if (createOrderDto.bonusAmount) {
      finalAmount = Math.max(0, finalAmount - createOrderDto.bonusAmount);
    }

    // Create order with items
    const orderSelect = {
      id: true,
      userId: true,
      totalAmount: true,
      totalBonus: true,
      usedBonus: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              name: true,
              price: true,
              bonusPercent: true,
            },
          },
          quantity: true,
          price: true,
          totalPrice: true,
          earnedBonus: true,
        },
      },
    } satisfies Prisma.OrderSelect;

    const order = await this.prisma.order.create({
      data: {
        user: { connect: { id: userId } },
        totalAmount: finalAmount,
        usedBonus: createOrderDto.bonusAmount || 0,
        status: 'PENDING',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            earnedBonus: item.earnedBonus,
          })),
        },
      },
      select: orderSelect,
    });

    // Spend bonus points if used
    if (createOrderDto.bonusAmount) {
      await this.bonusService.spendBonusPoints(
        userId,
        createOrderDto.bonusAmount,
        order.id,
      );
    }

    // Clear the cart
    await this.cartService.clearCart(userId);

    // Format response
    return {
      ...order,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        bonusPercent: item.product.bonusPercent,
        earnedBonus: item.earnedBonus,
      })),
    };
  }

  async findAll(userId: number): Promise<OrderDto[]> {
    const orderSelect = {
      id: true,
      userId: true,
      totalAmount: true,
      totalBonus: true,
      usedBonus: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              name: true,
              price: true,
              bonusPercent: true,
            },
          },
          quantity: true,
          price: true,
          totalPrice: true,
          earnedBonus: true,
        },
      },
    } satisfies Prisma.OrderSelect;

    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: orderSelect,
    });

    return orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        bonusPercent: item.product.bonusPercent,
        earnedBonus: item.earnedBonus,
      })),
    }));
  }

  async findOne(userId: number, id: number): Promise<OrderDto> {
    const orderSelect = {
      id: true,
      userId: true,
      totalAmount: true,
      totalBonus: true,
      usedBonus: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              name: true,
              price: true,
              bonusPercent: true,
            },
          },
          quantity: true,
          price: true,
          totalPrice: true,
          earnedBonus: true,
        },
      },
    } satisfies Prisma.OrderSelect;

    const order = await this.prisma.order.findUnique({
      where: { id, userId },
      select: orderSelect,
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return {
      ...order,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        bonusPercent: item.product.bonusPercent,
        earnedBonus: item.earnedBonus,
      })),
    };
  }

  async cancel(userId: number, id: number): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id, userId },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // Refund bonus points if they were used
    if (order.usedBonus > 0) {
      await this.bonusService.addBonusPoints(
        userId,
        order.usedBonus,
        'REFUND',
        `Refund for cancelled order #${id}`,
        id,
      );
    }

    const orderSelect = {
      id: true,
      userId: true,
      totalAmount: true,
      totalBonus: true,
      usedBonus: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              name: true,
              price: true,
              bonusPercent: true,
            },
          },
          quantity: true,
          price: true,
          totalPrice: true,
          earnedBonus: true,
        },
      },
    } satisfies Prisma.OrderSelect;

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      select: orderSelect,
    });

    return {
      ...updatedOrder,
      items: updatedOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        bonusPercent: item.product.bonusPercent,
        earnedBonus: item.earnedBonus,
      })),
    };
  }
} 