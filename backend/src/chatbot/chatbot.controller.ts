import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    return this.chatbotService.processPdf(file);
  }

  @Get('chat')
  async chat(@Query('q') question: string) {
    return this.chatbotService.chatWithRag(question);
  }
}
