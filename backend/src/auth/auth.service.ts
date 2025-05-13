import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { addMinutes } from 'date-fns';
import { BonusService } from '../bonus/bonus.service';
import { UsersService } from '../users/users.service';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { LoginResponseDto } from './dto/auth.dto';
import { SmsService } from '../sms/sms.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cartService: CartService,
    private bonusService: BonusService,
    private usersService: UsersService,
    private smsService: SmsService,
    private configService: ConfigService,
  ) {}

  async requestCode(phoneNumber: string) {
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Create or update verification code
    await this.prisma.verificationCode.create({
      data: {
        phoneNumber,
        code,
        expiresAt,
      },
    });

    // Send SMS with code
    await this.smsService.sendSms(phoneNumber, `Your verification code is: ${code}`);

    return { message: 'Verification code sent' };
  }

  async verifyCode(phoneNumber: string, code: string) {
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        phoneNumber,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCode) {
      return { success: false, message: 'Invalid or expired code' };
    }

    // Mark code as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { isUsed: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber,
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    return {
      success: true,
      message: 'Code verified successfully',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    };
  }

  async calculateOrderBonus(userId: string, totalAmount: number, productId: string) {
    const earnedBonus = await this.bonusService.calculateOrderBonus(
      Number(userId),
      totalAmount,
      Number(productId)
    );
    return earnedBonus;
  }

  async spendBonusPoints(userId: string, bonusAmount: number, orderId: string) {
    const success = await this.bonusService.spendBonusPoints(
      Number(userId),
      bonusAmount,
      Number(orderId)
    );
    return success;
  }

  async validateUser(phoneNumber: string): Promise<any> {
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(phoneNumber: string): Promise<LoginResponseDto> {
    const user = await this.validateUser(phoneNumber);
    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const userProfile = await this.usersService.getUserProfile(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: userProfile,
      isNew: false,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: Number(payload.sub) },
      });
      return user;
    } catch {
      throw new UnauthorizedException();
    }
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    return this.cartService.addItem(Number(userId), Number(productId), quantity);
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    return this.cartService.updateItemQuantity(Number(userId), Number(productId), quantity);
  }
} 