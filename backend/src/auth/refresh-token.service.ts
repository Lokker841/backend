import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createRefreshToken(userId: number): Promise<string> {
    const token = uuidv4();
    const expiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 30 * 24 * 60 * 60; // 30 days in seconds

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return token;
  }

  async generateTokens(userId: number, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, role },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
        },
      ),
      this.createRefreshToken(userId),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenString: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: { user: true },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Delete the used refresh token
    await this.prisma.refreshToken.delete({
      where: { id: token.id },
    });

    // Generate new tokens
    return this.generateTokens(token.user.id, token.user.role);
  }

  async revokeRefreshToken(refreshTokenString: string) {
    await this.prisma.refreshToken.delete({
      where: { token: refreshTokenString },
    });
  }

  async revokeAllUserTokens(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
} 