import { ApiProperty } from '@nestjs/swagger';

export class PopularProductDto {
  @ApiProperty({ description: 'Product ID' })
  productId: number;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Number of times ordered' })
  orderCount: number;

  @ApiProperty({ description: 'Total revenue from this product' })
  totalRevenue: number;
}

export class PeriodStatsDto {
  @ApiProperty({ description: 'Total revenue for the period' })
  revenue: number;

  @ApiProperty({ description: 'Number of orders in the period' })
  orderCount: number;

  @ApiProperty({ description: 'Average order value for the period' })
  averageOrderValue: number;

  @ApiProperty({ description: 'Start date of the period' })
  startDate: Date;

  @ApiProperty({ description: 'End date of the period' })
  endDate: Date;
}

export class AdminStatsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ description: 'Total revenue' })
  totalRevenue: number;

  @ApiProperty({ description: 'Active users in last 30 days' })
  activeUsers: number;

  @ApiProperty({ description: 'Orders in last 30 days' })
  recentOrders: number;

  @ApiProperty({ description: 'Average order value' })
  averageOrderValue: number;

  @ApiProperty({ description: 'Revenue statistics by period' })
  periodStats: PeriodStatsDto[];

  @ApiProperty({ description: 'Most popular products', type: [PopularProductDto] })
  popularProducts: PopularProductDto[];

  @ApiProperty({ description: 'Revenue in last 24 hours' })
  last24HoursRevenue: number;

  @ApiProperty({ description: 'Revenue in last 7 days' })
  lastWeekRevenue: number;

  @ApiProperty({ description: 'Revenue in last 30 days' })
  lastMonthRevenue: number;

  @ApiProperty({ description: 'Number of orders in last 24 hours' })
  last24HoursOrders: number;

  @ApiProperty({ description: 'Number of orders in last 7 days' })
  lastWeekOrders: number;

  @ApiProperty({ description: 'Number of orders in last 30 days' })
  lastMonthOrders: number;
} 