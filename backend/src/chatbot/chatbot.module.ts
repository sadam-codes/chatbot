import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Document, Messages } from '../model/chatbot.model';

@Module({
  imports: [SequelizeModule.forFeature([Document, Messages])],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
