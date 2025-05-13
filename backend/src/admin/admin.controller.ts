import { Controller, Get, Post, Put, Delete, Query, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { PeriodStatsDto } from './dto/period-stats.dto';
import { PopularProductDto } from './dto/popular-product.dto';
import { TableDataDto, CreateRecordDto, UpdateRecordDto, TableParamDto, IdParamDto } from './dto/database.dto';
import { AdminLoginDto, AdminLoginResponseDto } from './dto/admin-auth.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login as admin' })
  @ApiResponse({ status: 200, type: AdminLoginResponseDto })
  async login(@Body() loginDto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return this.adminService.login(loginDto.username, loginDto.password);
  }

  @Post('create-initial-admin')
  @ApiOperation({ summary: 'Create initial admin account (should be disabled in production)' })
  async createInitialAdmin(): Promise<{ message: string }> {
    // This endpoint should be disabled in production
    if (process.env.NODE_ENV === 'production') {
      return { message: 'This endpoint is disabled in production' };
    }
    
    try {
      await this.adminService.createAdmin('admin', 'admin123');
      return { message: 'Initial admin created successfully' };
    } catch (error) {
      return { message: error.message };
    }
  }
  
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, type: AdminStatsDto })
  async getStats(): Promise<AdminStatsDto> {
    return this.adminService.getStats();
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('period-stats')
  @ApiOperation({ summary: 'Get statistics for a specific period' })
  @ApiResponse({ status: 200, type: PeriodStatsDto })
  async getPeriodStats(
    @Query('period') period: '24h' | '7d' | '30d' = '30d'
  ): Promise<PeriodStatsDto> {
    return this.adminService.getPeriodStats(period);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('monthly-performance')
  @ApiOperation({ summary: 'Get monthly performance statistics' })
  @ApiResponse({ status: 200, type: [PeriodStatsDto] })
  async getMonthlyPerformance(): Promise<PeriodStatsDto[]> {
    return this.adminService.getMonthlyPerformance();
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('popular-products')
  @ApiOperation({ summary: 'Get popular products' })
  @ApiResponse({ status: 200, type: [PopularProductDto] })
  async getPopularProducts(
    @Query('limit', ParseIntPipe) limit: number = 5
  ): Promise<PopularProductDto[]> {
    return this.adminService.getPopularProducts(limit);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('recent-orders')
  @ApiOperation({ summary: 'Get recent orders' })
  async getRecentOrders(
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.adminService.getRecentOrders(limit);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('recent-users')
  @ApiOperation({ summary: 'Get recent users' })
  async getRecentUsers(
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.adminService.getRecentUsers(limit);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('database/tables')
  @ApiOperation({ summary: 'Get list of database tables' })
  @ApiResponse({ status: 200, type: [String] })
  async getTables(): Promise<string[]> {
    return this.adminService.getTables();
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Get('database/:table')
  @ApiOperation({ summary: 'Get table data' })
  @ApiResponse({ status: 200, type: TableDataDto })
  async getTableData(@Param('table') table: string): Promise<TableDataDto> {
    return this.adminService.getTableData(table);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Post('database/:table')
  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({ status: 201 })
  async createRecord(
    @Param('table') table: string,
    @Body() data: Record<string, any>,
  ): Promise<void> {
    await this.adminService.createRecord(table, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Put('database/:table/:id')
  @ApiOperation({ summary: 'Update a record' })
  @ApiResponse({ status: 200 })
  async updateRecord(
    @Param('table') table: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Record<string, any>,
  ): Promise<void> {
    await this.adminService.updateRecord(table, id, data);
  }

  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @Delete('database/:table/:id')
  @ApiOperation({ summary: 'Delete a record' })
  @ApiResponse({ status: 200 })
  async deleteRecord(
    @Param('table') table: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.adminService.deleteRecord(table, id);
  }
}
