import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequestCodeDto, VerifyCodeDto, LoginDto, LoginResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @ApiOperation({ summary: 'Request verification code via SMS' })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification code sent successfully via SMS',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string',
          example: 'Verification code sent successfully'
        }
      }
    }
  })
  @Post('request-code')
  async requestCode(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.requestCode(phoneNumber);
  }

  @ApiOperation({ summary: 'Verify SMS code and login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Code verified and user logged in successfully',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired verification code'
  })
  @Post('verify-code')
  async verifyCode(
    @Body('phoneNumber') phoneNumber: string,
    @Body('code') code: string,
  ) {
    const result = await this.authService.verifyCode(phoneNumber, code);
    if (!result.success || !result.user) {
      throw new UnauthorizedException(result.message || 'Invalid or expired code');
    }

    // Generate both access and refresh tokens
    const tokens = await this.refreshTokenService.generateTokens(result.user.id, result.user.role);

    return {
      ...result,
      ...tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    try {
      return await this.refreshTokenService.refreshTokens(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    try {
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
      return { message: 'Successfully logged out' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // @Post('login')
  // @HttpCode(200)
  // @ApiOperation({ summary: 'Login with phone number' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns access token and user profile',
  //   type: LoginResponseDto,
  // })
  // @ApiResponse({ status: 401, description: 'Invalid credentials' })
  // async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
  //   return this.authService.login(loginDto.phoneNumber);
  // }
} 