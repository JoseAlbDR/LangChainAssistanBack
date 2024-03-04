import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { ChatgptController } from './chatgpt.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ChatgptController],
  providers: [
    ChatgptService,
    PrismaService,
    {
      provide: 'OPENAI_CONFIG',
      useValue: {
        modelName: 'gpt-3.5-turbo-0125',
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        maxTokens: 100,
      },
    },
  ],
})
export class ChatgptModule {}
