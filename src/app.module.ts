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
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './errors/exception-filter';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AssistantModule,
    ChatgptModule,
    DocumentsModule,
    OpenaiConfigModule,
    SharedModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    VectorStoreService,
    MemoryService,
    ModelInitService,
    OpenaiConfigService,
    AssistantService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
