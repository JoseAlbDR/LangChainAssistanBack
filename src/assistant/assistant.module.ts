import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { VectorStoreModule } from 'src/shared/services/vector-store/vector-store.module';

@Module({
  imports: [VectorStoreModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    PrismaService,
    {
      provide: 'OPENAI_CONFIG',
      useValue: {
        modelName: 'gpt-3.5-turbo-0125',
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
        maxTokens: 100,
      },
    },
  ],
})
export class AssistantModule {}
