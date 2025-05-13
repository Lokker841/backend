import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { BonusService } from '../bonus/bonus.service';
import { BonusInfo } from '../bonus/types';
import { BonusInfoDto } from '../bonus/dto/bonus-info.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bonusService: BonusService,
  ) {}

  @ApiOperation({
    summary: 'Get user profile by ID',
    description: 'Retrieves detailed user profile information including bonus details. Requires authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns complete user profile information including personal details, role, and bonus information',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Valid JWT token is required' })
  @ApiResponse({ status: 404, description: 'User not found with the provided ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID to fetch profile for',
    example: '1',
    type: 'string'
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<UserProfileDto> {
    return this.usersService.getUserProfile(Number(id));
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the currently authenticated user. Uses the JWT token to identify the user.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns complete profile information for the currently authenticated user',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Valid JWT token is required' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req): Promise<UserProfileDto> {
    return this.usersService.getUserProfile(req.user.id);
  }

  @ApiOperation({
    summary: 'Update user data',
    description: 'Updates user information. Can update name, phone number, and birthday. Requires authentication.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User has been successfully updated. Returns the updated user profile.',
    type: UserProfileDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Valid JWT token is required' })
  @ApiResponse({ status: 404, description: 'User not found with the provided ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to update',
    example: '1',
    type: 'string'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User data to update. All fields are optional.'
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateUser(Number(id), updateData);
  }

  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently deletes a user account and all associated data. This action cannot be undone. Requires authentication.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User has been successfully deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Valid JWT token is required' })
  @ApiResponse({ status: 404, description: 'User not found with the provided ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the user to delete',
    example: '1',
    type: 'string'
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }
} 