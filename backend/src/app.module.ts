import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'sadam@123',
      database: 'chatbot',
      autoLoadModels: true,
      synchronize: true,
    }),
    ChatbotModule,
  ],
})
export class AppModule {}