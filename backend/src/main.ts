import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import 'dotenv/config';

async function bootstrap() {
  dotenv.config();
  
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], 
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
