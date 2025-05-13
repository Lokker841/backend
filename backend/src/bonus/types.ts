export type BonusLevel = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface LevelConfig {
  minSpent: number;
  multiplier: number;
  bonus?: number;
}

export interface BonusInfo {
  balance: number;
  level: BonusLevel;
  totalSpent: number;
  progress: {
    currentSpent: number;
    nextLevel: BonusLevel;
    requiredSpent: number;
    remaining: number;
  } | null;
  recentHistory: Array<{
    id?: number;
    amount?: number;
    type?: string;
    description?: string;
    createdAt?: Date;
  }>;
} 