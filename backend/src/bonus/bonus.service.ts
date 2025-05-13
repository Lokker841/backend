import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BonusLevel, LevelConfig, BonusInfo } from './types';

// Bonus level configuration
const BONUS_LEVELS = {
  STANDARD: {
    minSpent: 0,
    multiplier: 1,
  },
  SILVER: {
    minSpent: 10000,
    multiplier: 1.5,
  },
  GOLD: {
    minSpent: 50000,
    multiplier: 2,
  },
  PLATINUM: {
    minSpent: 100000,
    multiplier: 3,
  },
};

@Injectable()
export class BonusService {
  constructor(private prisma: PrismaService) {}

  private readonly LEVEL_THRESHOLDS: Record<BonusLevel, LevelConfig> = {
    STANDARD: { minSpent: 0, multiplier: 1.0 },
    SILVER: { minSpent: 1000, multiplier: 1.2, bonus: 100 },
    GOLD: { minSpent: 5000, multiplier: 1.5, bonus: 500 },
    PLATINUM: { minSpent: 10000, multiplier: 2.0, bonus: 1000 },
  };

  async calculateOrderBonus(userId: number, totalAmount: number, productId: number): Promise<number> {
    const [user, product] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!user || !product) {
      return 0;
    }

    const levelMultiplier = BONUS_LEVELS[user.bonusLevel as BonusLevel].multiplier;
    return Math.floor(totalAmount * (product.bonusPercent / 100) * levelMultiplier);
  }

  async getUserBonusInfo(userId: number): Promise<BonusInfo> {
    const userSelect = {
      bonusBalance: true,
      bonusLevel: true,
      totalSpent: true,
      bonusHistory: {
        orderBy: {
          createdAt: 'desc' as const,
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          createdAt: true,
        },
      },
    } satisfies Prisma.UserSelect;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const nextLevel = this.getNextLevel(user.bonusLevel as BonusLevel);
    const progress = nextLevel ? {
      currentSpent: user.totalSpent,
      nextLevel,
      requiredSpent: this.LEVEL_THRESHOLDS[nextLevel].minSpent,
      remaining: this.LEVEL_THRESHOLDS[nextLevel].minSpent - user.totalSpent,
    } : null;

    return {
      balance: user.bonusBalance,
      level: user.bonusLevel as BonusLevel,
      totalSpent: user.totalSpent,
      progress,
      recentHistory: user.bonusHistory,
    };
  }

  private getNextLevel(currentLevel: BonusLevel): BonusLevel | null {
    const levels = Object.keys(this.LEVEL_THRESHOLDS) as BonusLevel[];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  }

  async calculateBonusPoints(userId: number, amount: number, productBonusPercent: number): Promise<number> {
    const userSelect = {
      bonusLevel: true,
    } satisfies Prisma.UserSelect;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const multiplier = this.LEVEL_THRESHOLDS[user.bonusLevel as BonusLevel].multiplier;
    return Math.floor(amount * (productBonusPercent / 100) * multiplier);
  }

  async addBonusPoints(
    userId: number,
    amount: number,
    type: string,
    description: string,
    orderId?: number,
  ) {
    const userSelect = {
      bonusBalance: true,
    } satisfies Prisma.UserSelect;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const bonusHistorySelect = {
      id: true,
      amount: true,
      type: true,
      description: true,
      createdAt: true,
    } satisfies Prisma.BonusHistorySelect;

    // Create bonus history entry
    const bonusHistory = await this.prisma.bonusHistory.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        order: orderId ? {
          connect: {
            id: orderId,
          },
        } : undefined,
        amount,
        type,
        description,
      },
      select: bonusHistorySelect,
    });

    // Update user's bonus balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        bonusBalance: user.bonusBalance + amount,
      },
    });

    return bonusHistory;
  }

  async spendBonusPoints(
    userId: number,
    amount: number,
    orderId: number,
  ) {
    const userSelect = {
      bonusBalance: true,
    } satisfies Prisma.UserSelect;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.bonusBalance < amount) {
      throw new BadRequestException('Insufficient bonus points');
    }

    const bonusHistorySelect = {
      id: true,
      amount: true,
      type: true,
      description: true,
      createdAt: true,
    } satisfies Prisma.BonusHistorySelect;

    // Create bonus history entry for spent points
    const bonusHistory = await this.prisma.bonusHistory.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        order: {
          connect: {
            id: orderId,
          },
        },
        amount: -amount,
        type: 'SPENT_ON_PURCHASE',
        description: `Spent ${amount} bonus points on order #${orderId}`,
      },
      select: bonusHistorySelect,
    });

    // Update user's bonus balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        bonusBalance: user.bonusBalance - amount,
      },
    });

    return bonusHistory;
  }

  async checkLevelUpgrade(userId: number) {
    const userSelect = {
      bonusLevel: true,
      bonusBalance: true,
      totalSpent: true,
    } satisfies Prisma.UserSelect;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const nextLevel = this.getNextLevel(user.bonusLevel as BonusLevel);
    if (!nextLevel) return null; // Already at max level

    if (user.totalSpent >= this.LEVEL_THRESHOLDS[nextLevel].minSpent) {
      const levelUpBonus = this.LEVEL_THRESHOLDS[nextLevel].bonus || 0;

      // Update user level and add bonus points
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          bonusLevel: nextLevel,
          bonusBalance: user.bonusBalance + levelUpBonus,
        },
      });

      const bonusHistorySelect = {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
      } satisfies Prisma.BonusHistorySelect;

      // Create bonus history entry for level up bonus
      return this.prisma.bonusHistory.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          amount: levelUpBonus,
          type: 'LEVEL_UP_BONUS',
          description: `Level up bonus for reaching ${nextLevel} level`,
        },
        select: bonusHistorySelect,
      });
    }

    return null;
  }
} 