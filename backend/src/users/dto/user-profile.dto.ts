import { ApiProperty } from '@nestjs/swagger';
import { BonusInfoDto } from '../../bonus/dto/bonus-info.dto';

export class UserProfileDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    nullable: true
  })
  name: string;

  @ApiProperty({
    description: 'Phone number in international format',
    example: '+79123456789'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'User\'s birthday',
    example: '1990-01-01T00:00:00.000Z',
    required: false,
    nullable: true
  })
  birthday?: Date;

  @ApiProperty({
    description: 'User role in the system',
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  })
  role: string;

  @ApiProperty({
    description: 'User\'s bonus information including balance, level, and history',
    type: BonusInfoDto
  })
  bonus: BonusInfoDto;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2024-03-13T16:05:59.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2024-03-13T16:05:59.000Z'
  })
  updatedAt: Date;
} 