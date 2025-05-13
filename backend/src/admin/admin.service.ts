import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { PeriodStatsDto } from './dto/period-stats.dto';
import { PopularProductDto } from './dto/popular-product.dto';
import { TableDataDto } from './dto/database.dto';
import { subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getStats(): Promise<AdminStatsDto> {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      activeUsers,
      recentOrders,
      averageOrderValue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: subDays(new Date(), 30),
          },
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 30),
          },
        },
      }),
      this.prisma.order.aggregate({
        _avg: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeUsers,
      recentOrders,
      averageOrderValue: averageOrderValue._avg.totalAmount || 0,
      periodStats: [],
      popularProducts: [],
      last24HoursRevenue: 0,
      lastWeekRevenue: 0,
      lastMonthRevenue: 0,
      last24HoursOrders: 0,
      lastWeekOrders: 0,
      lastMonthOrders: 0,
    };
  }

  async getPeriodStats(period: '24h' | '7d' | '30d'): Promise<PeriodStatsDto> {
    const now = new Date();
    const startDate = period === '24h' 
      ? subDays(now, 1)
      : period === '7d'
        ? subDays(now, 7)
        : subDays(now, 30);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
        status: 'COMPLETED',
      },
      select: {
        totalAmount: true,
      },
    });

    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    return {
      revenue,
      orderCount,
      averageOrderValue,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }

  async getMonthlyPerformance(): Promise<PeriodStatsDto[]> {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => i);
    
    const monthlyStats = await Promise.all(
      months.map(async (monthsAgo) => {
        const startDate = startOfMonth(subMonths(now, monthsAgo));
        const endDate = endOfMonth(subMonths(now, monthsAgo));

        const orders = await this.prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            totalAmount: true,
          },
        });

        const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const orderCount = orders.length;
        const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

        return {
          revenue,
          orderCount,
          averageOrderValue,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
      })
    );

    return monthlyStats;
  }

  async getPopularProducts(limit: number = 5): Promise<PopularProductDto[]> {
    const popularProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _count: true,
      _sum: {
        price: true,
        quantity: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      popularProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });

        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          orderCount: item._count || 0,
          totalRevenue: item._sum?.price || 0,
        };
      })
    );

    return productsWithDetails;
  }

  async getRecentOrders(limit: number = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  async getRecentUsers(limit: number = 10) {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        birthday: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async getTables(): Promise<string[]> {
    // Return table names that match our mapping keys
    const tables = [
      'user',
      'verificationcode',
      'product',
      'order',
      'orderitem',
      'bonushistory',
      'analytics',
      'cart',
      'cartitem',
      'banner',
      'taste',
      'authormuffin',
      'muffinconstruct',
      'description',
      'admin'
    ];
    return tables;
  }

  // Helper method to get the Prisma model name from table name
  private getPrismaModelName(table: string): string {
    const modelMapping: Record<string, string> = {
      'user': 'user',
      'verificationcode': 'verificationCode',
      'product': 'product',
      'order': 'order',
      'orderitem': 'orderItem',
      'bonushistory': 'bonusHistory',
      'analytics': 'analytics',
      'cart': 'cart',
      'cartitem': 'cartItem',
      'banner': 'banner',
      'taste': 'taste',
      'authormuffin': 'authorMuffin',
      'muffinconstruct': 'muffinConstruct',
      'description': 'description',
      'admin': 'admin'
    };

    return modelMapping[table] || table;
  }

  async getTableData(table: string): Promise<TableDataDto> {
    const modelName = this.getPrismaModelName(table);
    const model = this.prisma[modelName];
    
    if (!model) {
      throw new Error(`Table ${table} not found`);
    }

    const rows = await model.findMany();
    
    // Get columns from schema if table is empty
    let columns: string[] = [];
    
    if (rows.length > 0) {
      columns = Object.keys(rows[0]);
    } else {
      // Provide columns based on the table schema
      switch (table) {
        case 'user':
          columns = ['id', 'email', 'name', 'phoneNumber', 'role', 'bonusBalance', 'bonusLevel', 'totalSpent', 'createdAt', 'updatedAt', 'lastLoginAt', 'profilePicUrl'];
          break;
        case 'verificationcode':
          columns = ['id', 'userId', 'phoneNumber', 'code', 'isUsed', 'expiresAt', 'createdAt'];
          break;
        case 'product':
          columns = ['id', 'name', 'description', 'price', 'bonusPercent', 'canPayByBonus', 'createdAt', 'updatedAt'];
          break;
        case 'order':
          columns = ['id', 'userId', 'totalAmount', 'totalBonus', 'usedBonus', 'status', 'createdAt', 'updatedAt'];
          break;
        case 'orderitem':
          columns = ['id', 'orderId', 'productId', 'quantity', 'price', 'totalPrice', 'earnedBonus', 'createdAt', 'updatedAt'];
          break;
        case 'bonushistory':
          columns = ['id', 'userId', 'orderId', 'amount', 'type', 'description', 'createdAt', 'updatedAt'];
          break;
        case 'analytics':
          columns = ['id', 'eventType', 'data', 'createdAt'];
          break;
        case 'cart':
          columns = ['id', 'userId', 'createdAt', 'updatedAt'];
          break;
        case 'cartitem':
          columns = ['id', 'cartId', 'productId', 'quantity', 'price', 'totalPrice', 'earnedBonus', 'createdAt', 'updatedAt'];
          break;
        case 'banner':
          columns = ['id', 'imageUrl', 'title', 'description', 'isActive', 'createdAt', 'updatedAt'];
          break;
        case 'taste':
          columns = ['id', 'name', 'imageUrl', 'description', 'createdAt', 'updatedAt'];
          break;
        case 'authormuffin':
          columns = ['id', 'name', 'imageUrl', 'description', 'authorId', 'createdAt', 'updatedAt'];
          break;
        case 'muffinconstruct':
          columns = ['id', 'name', 'imageUrl', 'description', 'price', 'type', 'createdAt', 'updatedAt'];
          break;
        case 'description':
          columns = ['id', 'key', 'value', 'type', 'createdAt', 'updatedAt'];
          break;
        case 'admin':
          columns = ['id', 'username', 'password', 'createdAt', 'updatedAt'];
          break;
        default:
          columns = ['id'];
      }
    }

    return {
      columns,
      rows,
    };
  }

  async createRecord(table: string, data: Record<string, any>): Promise<void> {
    const modelName = this.getPrismaModelName(table);
    const model = this.prisma[modelName];
    
    if (!model) {
      throw new Error(`Table ${table} not found`);
    }

    // Clean up data for specific Prisma rules
    const cleanedData = this.cleanDataForPrisma(data);

    try {
      await model.create({
        data: cleanedData,
      });
    } catch (error) {
      console.error(`Error creating record in ${table}:`, error);
      throw new Error(`Failed to create record in ${table}: ${error.message}`);
    }
  }

  async updateRecord(table: string, id: number, data: Record<string, any>): Promise<void> {
    const modelName = this.getPrismaModelName(table);
    const model = this.prisma[modelName];
    
    if (!model) {
      throw new Error(`Table ${table} not found`);
    }

    // Clean up data for specific Prisma rules
    const cleanedData = this.cleanDataForPrisma(data);

    try {
      await model.update({
        where: { id },
        data: cleanedData,
      });
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error);
      throw new Error(`Failed to update record in ${table}: ${error.message}`);
    }
  }

  // Helper method to clean data for Prisma
  private cleanDataForPrisma(data: Record<string, any>): Record<string, any> {
    const cleanedData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip null or undefined values for cleaner queries
      if (value === null || value === undefined) continue;
      
      // Handle special field types
      if (key === 'data' && typeof value === 'string') {
        // Try to convert JSON string to object for JSON fields
        try {
          cleanedData[key] = JSON.parse(value);
        } catch (e) {
          // If not valid JSON, store as-is
          cleanedData[key] = value;
        }
      } else if (key.includes('date') || key.includes('At')) {
        // Handle date fields
        if (value === '') {
          // Skip empty date fields
          continue;
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          // Valid date string
          cleanedData[key] = new Date(value);
        } else {
          // Otherwise keep as is
          cleanedData[key] = value;
        }
      } else {
        // Regular fields
        cleanedData[key] = value;
      }
    }
    
    return cleanedData;
  }

  async deleteRecord(table: string, id: number): Promise<void> {
    const modelName = this.getPrismaModelName(table);
    const model = this.prisma[modelName];
    
    if (!model) {
      throw new Error(`Table ${table} not found`);
    }

    await model.delete({
      where: { id },
    });
  }

  // Admin Authentication Methods
  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = admin;
    return result;
  }

  async login(username: string, password: string) {
    const admin = await this.validateAdmin(username, password);
    const payload = { sub: admin.id, username: admin.username, isAdmin: true };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createAdmin(username: string, password: string) {
    const exists = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (exists) {
      throw new Error('Admin with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
  }
}
