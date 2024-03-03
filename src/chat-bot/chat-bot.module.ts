import { Module } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { ChatBotController } from './chat-bot.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ChatBotController],
  providers: [
    ChatBotService,
    PrismaService,
    {
      provide: 'OPENAI_CONFIG',
      useValue: {
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
        maxTokens: 100,
      },
    },
  ],
})
export class ChatBotModule {}
