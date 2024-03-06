import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { VectorStoreModule } from 'src/shared/services/vector-store/vector-store.module';
import { DocumentsModule } from 'src/documents/documents.module';
import { DocumentsService } from 'src/documents/documents.service';
import { MemoryService } from 'src/shared/services/memory/memory.service';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { SharedModule } from 'src/shared/services/shared.module';

@Module({
  imports: [VectorStoreModule, DocumentsModule, SharedModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    PrismaService,
    DocumentsService,
    MemoryService,
    OpenaiConfigService,
    // {
    //   provide: 'OPENAI_CONFIG',
    //   useValue: {
    //     modelName: 'gpt-3.5-turbo-0125',
    //     openAIApiKey: process.env.OPENAI_API_KEY,
    //     temperature: 0.7,
    //     maxTokens: 500,
    //   },
    // },
  ],
})
export class AssistantModule {}
