import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { VectorStoreModule } from 'src/shared/services/vector-store/vector-store.module';
import { DocumentsModule } from 'src/documents/documents.module';
import { DocumentsService } from 'src/documents/documents.service';

@Module({
  imports: [VectorStoreModule, DocumentsModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    PrismaService,
    DocumentsService,
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
