import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    // In development mode, just log the message
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`SMS to ${phoneNumber}: ${message}`);
      return true;
    }

    try {
      // Here you would integrate with your SMS provider
      // For example, using Twilio, MessageBird, etc.
      // For now, we'll just simulate success
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }
} 