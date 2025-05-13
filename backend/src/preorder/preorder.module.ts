import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PreorderController } from './preorder.controller';
import { PreorderService } from './preorder.service';

@Module({
  imports: [ConfigModule],
  controllers: [PreorderController],
  providers: [PreorderService],
})
export class PreorderModule {} 