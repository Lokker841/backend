import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('MuffMe API Documentation')
    .setDescription(`
      Welcome to the MuffMe API documentation. This API provides endpoints for:
      - User Management
      - Order Processing
      - Admin Dashboard
      - Authentication
    `)
    .setVersion('1.0')
    .addTag('Base', 'Base endpoints')
    .addTag('Admin', 'Admin dashboard endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
  logger.log(`Application is running on: http://localhost:3001`);
  logger.log(`Swagger documentation is available at: http://localhost:3001/api`);
}

bootstrap();