import { ApiProperty } from '@nestjs/swagger';
import { BonusLevel } from '../types';

class BonusProgressDto {
  @ApiProperty({ example: 1500 })
  currentSpent: number;

  @ApiProperty({ example: 'GOLD', enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'] })
  nextLevel: BonusLevel;

  @ApiProperty({ example: 5000 })
  requiredSpent: number;

  @ApiProperty({ example: 3500 })
  remaining: number;
}

class BonusHistoryItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ example: 'EARNED_FROM_PURCHASE' })
  type: string;

  @ApiProperty({ example: 'Earned from order #123' })
  description: string;

  @ApiProperty({ example: '2024-03-13T16:05:59.000Z' })
  createdAt: Date;
}

export class BonusInfoDto {
  @ApiProperty({ example: 1500 })
  balance: number;

  @ApiProperty({ example: 'SILVER', enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'] })
  level: BonusLevel;

  @ApiProperty({ example: 1500 })
  totalSpent: number;

  @ApiProperty({ type: BonusProgressDto, nullable: true })
  progress: BonusProgressDto | null;

  @ApiProperty({ type: [BonusHistoryItemDto] })
  recentHistory: BonusHistoryItemDto[];
} 