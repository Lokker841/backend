import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly isDevelopment: boolean;
  private readonly smscLogin: string;
  private readonly smscPassword: string;
  private readonly smscApiKey: string;
  private readonly developmentCode = '1234';

  constructor(private configService: ConfigService) {
    this.isDevelopment = configService.get('NODE_ENV') !== 'production';
    this.smscLogin = configService.get('SMSC_LOGIN') || '';
    this.smscPassword = configService.get('SMSC_PASSWORD') || '';
    this.smscApiKey = configService.get('SMSC_API_KEY') || ''; // Empty for development
  }

  /**
   * Send an SMS verification code to the provided phone number
   * @param phoneNumber The phone number to send the code to
   * @param code The verification code to send
   * @returns True if the SMS was sent (or would have been sent in dev mode)
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    // In development mode, log the code and don't send a real SMS
    if (this.isDevelopment) {
      this.logger.debug(`[DEV MODE] SMS not actually sent. Code for ${phoneNumber}: ${code}`);
      return true;
    }

    // Don't send SMS if we're in dev mode with empty API key
    if (!this.smscApiKey && !this.smscPassword) {
      this.logger.debug(`[DEV MODE] SMS not sent. Empty API key configuration. Code for ${phoneNumber}: ${code}`);
      return true;
    }

    try {
      // Format the message
      const message = `Your verification code is: ${code}`;
      
      // Prepare API request params
      const params: Record<string, any> = {
        login: this.smscLogin,
        phones: phoneNumber,
        mes: message,
      };

      // Add authentication - either API key or password
      if (this.smscApiKey) {
        params.apikey = this.smscApiKey;
      } else {
        params.psw = this.smscPassword;
      }

      // Make the request to SMSC.ru API
      const response = await axios.get('https://smsc.ru/sys/send.php', {
        params: {
          ...params,
          fmt: 3, // Return JSON format
          charset: 'utf-8', // Use UTF-8 encoding
        },
      });

      // Log the response for debugging
      this.logger.debug(`SMSC Response: ${JSON.stringify(response.data)}`);
      
      // Check if the SMS was sent successfully
      if (response.data && !response.data.error) {
        return true;
      } else {
        this.logger.error(`Failed to send SMS: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`SMS sending error: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate a verification code
   * In development mode, always return the same code for easier testing
   */
  generateVerificationCode(): string {
    if (this.isDevelopment) {
      return this.developmentCode;
    }
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
} 