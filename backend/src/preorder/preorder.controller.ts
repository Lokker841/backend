import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { PreorderService } from './preorder.service';
import { CreatePreorderDto } from './dto/create-preorder.dto';
import { PreorderResponseDto } from './dto/preorder-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('preorder')
@Controller('preorder')
export class PreorderController {
  constructor(private readonly preorderService: PreorderService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a preorder request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The preorder request has been successfully submitted.',
    type: PreorderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to process preorder request.',
  })
  async create(@Body() createPreorderDto: CreatePreorderDto): Promise<PreorderResponseDto> {
    return this.preorderService.createPreorder(createPreorderDto);
  }
} 