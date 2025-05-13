import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class RequestCodeDto {
  @ApiProperty({
    description: 'User phone number in international format',
    example: '+79123456789'
  })
  @IsString()
  @Matches(/^\+[1-9]\d{10,14}$/, {
    message: 'Phone number must be in international format (e.g., +79123456789)'
  })
  phoneNumber: string;
}

export class VerifyCodeDto {
  @ApiProperty({
    description: 'User phone number in international format',
    example: '+79123456789'
  })
  @IsString()
  @Matches(/^\+[1-9]\d{10,14}$/, {
    message: 'Phone number must be in international format (e.g., +79123456789)'
  })
  phoneNumber: string;

  @ApiProperty({
    description: '4-digit verification code',
    example: '1234'
  })
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, {
    message: 'Verification code must be exactly 4 digits'
  })
  code: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'User phone number in international format',
    example: '+79123456789'
  })
  @IsString()
  @Matches(/^\+[1-9]\d{10,14}$/, {
    message: 'Phone number must be in international format (e.g., +79123456789)'
  })
  phoneNumber: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileDto
  })
  user: UserProfileDto;

  @ApiProperty({
    description: 'Whether this is a new user',
    example: true
  })
  isNew: boolean;
}