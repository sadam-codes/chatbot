import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Document } from '../model/chatbot.model';

@Module({
  imports: [SequelizeModule.forFeature([Document])],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}