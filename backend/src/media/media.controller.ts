import { Controller, Get, Param, Res, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Response } from 'express';
import { BannerDto } from './dto';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('media')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);
  private readonly VALID_PATHS = {
    'author_muffins': 'author_muffin',
    'author-muffins': 'author_muffin',
    'author-muffin': 'author_muffin',
    'authormuffin': 'author_muffin',
    'muffin': 'author_muffin',
  };

  private readonly VALID_FILES = [
    'apple.png', 'banan.png', 'chok.png', 'citrus.png', 
    'klubnika.png', 'lavanda.png', 'myata.png', 'orange.png',
    'pina.png', 'salt.png', 'tiramisu.png', 'vanil.png'
  ];

  constructor(private readonly mediaService: MediaService) {}

  private correctPath(filepath: string): string {
    // Split path into directory and filename
    const parts = filepath.split(/[\/\\,]/);
    const filename = parts[parts.length - 1];
    const directory = parts.slice(0, -1).join('/');

    // Correct directory name if it's a known variation
    let correctedDir = this.VALID_PATHS[directory.toLowerCase()] || directory;

    // Find closest matching filename if it doesn't match exactly
    let correctedFile = filename;
    if (!this.VALID_FILES.includes(filename)) {
      const withoutExt = filename.replace(/\.[^/.]+$/, '');
      const matchingFile = this.VALID_FILES.find(f => 
        f.toLowerCase().includes(withoutExt.toLowerCase()) ||
        withoutExt.toLowerCase().includes(f.replace(/\.[^/.]+$/, '').toLowerCase())
      );
      if (matchingFile) {
        correctedFile = matchingFile;
      }
    }

    return path.join(correctedDir, correctedFile);
  }

  @Get('banners')
  @ApiOperation({ summary: 'Get all active banners' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active banners',
    type: [BannerDto],
  })
  async getBanners(): Promise<BannerDto[]> {
    return this.mediaService.getBanners();
  }

  @Get('picture/*filepath')
  @ApiOperation({ summary: 'Get image by URL' })
  @ApiParam({
    name: 'filepath',
    description: 'Path to the image file (e.g., author_muffin/chok.png)',
    type: 'string',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the image file',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image path',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async getPicture(@Param('filepath') imagePath: string, @Res() res: Response) {
    try {
      if (!imagePath) {
        this.logger.error('Image path is undefined or empty');
        throw new BadRequestException('Image path is required');
      }

      this.logger.log(`Received request for image: ${imagePath}`);

      // Convert comma-separated path to forward slashes and handle potential array input
      let processedPath = Array.isArray(imagePath) ? imagePath[0] : imagePath;
      
      // Try to correct the path
      processedPath = this.correctPath(processedPath);

      // Remove any '../' or './' from the path for security
      const sanitizedPath = processedPath.replace(/^[.\/]+/, '').replace(/\.\./g, '');
      
      if (!sanitizedPath) {
        this.logger.error('Sanitized path is empty');
        throw new BadRequestException('Invalid image path');
      }

      // Resolve path relative to the content directory (one level up from backend)
      const fullPath = path.join(process.cwd(), '..', 'content', sanitizedPath);
      
      this.logger.log(`Attempting to serve image from path: ${fullPath}`);
      this.logger.log(`Original path: ${imagePath}`);
      this.logger.log(`Processed path: ${processedPath}`);
      this.logger.log(`Sanitized path: ${sanitizedPath}`);
      this.logger.log(`Current working directory: ${process.cwd()}`);
      
      // Check if file exists before trying to send it
      if (!fs.existsSync(fullPath)) {
        this.logger.error(`File not found at path: ${fullPath}`);
        throw new NotFoundException('Image not found');
      }

      if (!fullPath.includes('content')) {
        this.logger.error('Attempted to access file outside of content directory');
        throw new BadRequestException('Invalid image path');
      }

      return res.sendFile(fullPath, (err) => {
        if (err) {
          this.logger.error(`Error sending file: ${err.message}`);
          throw new NotFoundException('Image not found');
        }
      });
    } catch (error) {
      this.logger.error(`Failed to serve image: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Image not found');
    }
  }
} 