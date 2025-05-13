import { ApiProperty } from '@nestjs/swagger';

export class PeriodStatsDto {
  @ApiProperty()
  revenue: number;

  @ApiProperty()
  orderCount: number;

  @ApiProperty()
  averageOrderValue: number;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;
} 