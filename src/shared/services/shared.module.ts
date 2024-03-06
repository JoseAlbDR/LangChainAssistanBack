// shared.module.ts

import { Module } from '@nestjs/common';
import { ModelInitService } from './model-init/model-init.service';
import { DocumentsService } from 'src/documents/documents.service';
import { VectorStoreService } from './vector-store/vector-store.service';
import { PrismaService } from './prisma/prisma.service';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { MemoryService } from './memory/memory.service';

@Module({
  providers: [
    ModelInitService,
    DocumentsService,
    VectorStoreService,
    ModelInitService,
    PrismaService,
    OpenaiConfigService,
    MemoryService,
  ],
  exports: [
    ModelInitService,
    DocumentsService,
    VectorStoreService,
    ModelInitService,
    PrismaService,
    OpenaiConfigService,
    MemoryService,
  ],
})
export class SharedModule {}
