import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AssistantController],
  providers: [
    AssistantService,
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
export class AssistantModule {}
