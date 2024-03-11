import { Module } from '@nestjs/common';
import { PrismaService } from './shared/services/prisma/prisma.service';
import { AssistantModule } from './assistant/assistant.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { DocumentsModule } from './documents/documents.module';
import { VectorStoreService } from './shared/services/vector-store/vector-store.service';
import { MemoryService } from './shared/services/memory/memory.service';
import { OpenaiConfigModule } from './openai-config/openai-config.module';
import { ModelInitService } from './shared/services/model-init/model-init.service';
import { OpenaiConfigService } from './openai-config/openai-config.service';
import { SharedModule } from './shared/services/shared.module';
import { AssistantService } from './assistant/assistant.service';

@Module({
  imports: [
    AssistantModule,
    ChatgptModule,
    DocumentsModule,
    OpenaiConfigModule,
    SharedModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    VectorStoreService,
    MemoryService,
    ModelInitService,
    OpenaiConfigService,
    AssistantService,
  ],
})
export class AppModule {}
