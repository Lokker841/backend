import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreatePreorderDto } from './dto/create-preorder.dto';
import { PreorderResponseDto } from './dto/preorder-response.dto';

@Injectable()
export class PreorderService {
  private readonly logger = new Logger(PreorderService.name);

  constructor(private configService: ConfigService) {}

  async createPreorder(createPreorderDto: CreatePreorderDto): Promise<PreorderResponseDto> {
    try {
      // Create a testing transport (change this in production to use actual SMTP)
      const transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(this.configService.get('SMTP_PORT', '587'), 10),
        secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER', ''),
          pass: this.configService.get('SMTP_PASSWORD', ''),
        },
      });

      // Email content
      const mailOptions = {
        from: this.configService.get('SMTP_USER', 'app@example.com'),
        to: 'muffme.mail@gmail.com',
        subject: 'New Preorder Request',
        html: `
          <h2>New Preorder Request</h2>
          <p><strong>Phone:</strong> ${createPreorderDto.phone}</p>
          <p><strong>Email:</strong> ${createPreorderDto.email}</p>
          <p><strong>Message:</strong> ${createPreorderDto.message}</p>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      this.logger.log(`Preorder email sent successfully for: ${createPreorderDto.email}`);
      
      return {
        success: true,
        message: 'Your preorder request has been received. We will contact you soon.',
      };
    } catch (error) {
      this.logger.error(`Failed to send preorder email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process preorder request');
    }
  }
} 