import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BonusInfo } from './types';
import { BonusInfoDto } from './dto/bonus-info.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bonus')
@Controller('bonus')
export class BonusController {
  constructor(private bonusService: BonusService) {}

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bonus information' })
  @ApiResponse({
    status: 200,
    description: 'Returns user bonus information including balance, level, and history',
    type: BonusInfoDto,
  })
  async getBonusInfo(@Request() req): Promise<BonusInfo> {
    return this.bonusService.getUserBonusInfo(req.user.id);
  }
} 