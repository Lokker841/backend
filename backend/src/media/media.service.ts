import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async getBanners() {
    return this.prisma.banner.findMany({
      select: {
        id: true,
        imageUrl: true,
        title: true,
        description: true,
        isActive: true,
      },
      where: {
        isActive: true,
      },
    });
  }
}