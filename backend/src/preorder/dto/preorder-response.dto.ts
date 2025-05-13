import { ApiProperty } from '@nestjs/swagger';

export class PreorderResponseDto {
  @ApiProperty({
    example: 'Your preorder request has been received. We will contact you soon.',
    description: 'Response message',
  })
  message: string;
  
  @ApiProperty({
    example: true,
    description: 'Whether the preorder was successfully processed',
  })
  success: boolean;
} 