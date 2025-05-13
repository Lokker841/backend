import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BonusModule } from './bonus/bonus.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { PreorderModule } from './preorder/preorder.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    BonusModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AnalyticsModule,
    HealthModule,
    LoggerModule,
    MediaModule,
    AdminModule,
    PreorderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}