import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BonusService } from '../bonus/bonus.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { BonusInfoDto } from '../bonus/dto/bonus-info.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private bonusService: BonusService,
  ) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByPhoneNumber(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new NotFoundException(`User with phone number ${phoneNumber} not found`);
    }

    return user;
  }

  async getUserProfile(userId: number): Promise<UserProfileDto> {
    const [user, bonusInfo] = await Promise.all([
      this.findById(userId),
      this.bonusService.getUserBonusInfo(userId),
    ]);

    const bonus: BonusInfoDto = {
      balance: bonusInfo.balance,
      level: bonusInfo.level,
      totalSpent: bonusInfo.totalSpent,
      progress: bonusInfo.progress,
      recentHistory: bonusInfo.recentHistory.map(history => ({
        id: history.id!,
        amount: history.amount!,
        type: history.type!,
        description: history.description!,
        createdAt: history.createdAt!,
      })),
    };

    return {
      id: user.id,
      name: user.name || '',
      phoneNumber: user.phoneNumber,
      role: user.role,
      bonus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(id: number, data: { name?: string; phoneNumber?: string; birthday?: string }): Promise<UserProfileDto> {
    await this.prisma.user.update({
      where: { id },
      data,
    });

    // Return complete user profile after update
    return this.getUserProfile(id);
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
} 