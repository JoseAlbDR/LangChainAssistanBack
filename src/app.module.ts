import { Module } from '@nestjs/common';
import { PrismaService } from './shared/services/prisma/prisma.service';
import { AssistantModule } from './assistant/assistant.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { DocumentsModule } from './documents/documents.module';
import { VectorStoreService } from './shared/services/vector-store/vector-store.service';
import { MemoryService } from './shared/services/memory/memory.service';
import { OpenaiConfigModule } from './openai-config/openai-config.module';

@Module({
  imports: [AssistantModule, ChatgptModule, DocumentsModule, OpenaiConfigModule],
  controllers: [],
  providers: [PrismaService, VectorStoreService, MemoryService],
})
export class AppModule {}
