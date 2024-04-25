// shared.module.ts

import { Module } from '@nestjs/common';
import { ModelInitService } from './model-init/model-init.service';
import { DocumentsService } from 'src/documents/documents.service';
import { VectorStoreService } from './vector-store/vector-store.service';
import { PrismaService } from './prisma/prisma.service';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { MemoryService } from './memory/memory.service';
import { EncryptService } from './encrypt/encrypt.service';
import { envs } from 'src/config/envs.adapter';

@Module({
  providers: [
    ModelInitService,
    DocumentsService,
    VectorStoreService,
    ModelInitService,
    PrismaService,
    OpenaiConfigService,
    MemoryService,
    {
      provide: EncryptService,
      useFactory: () => {
        const algorithm = envs.ALGORITHM;
        const secretKey = Buffer.from(envs.SECRET_KEY, 'hex');
        const iv = Buffer.from(envs.IV, 'hex');
        return new EncryptService(algorithm, secretKey, iv);
      },
    },
  ],
  exports: [
    ModelInitService,
    DocumentsService,
    VectorStoreService,
    ModelInitService,
    PrismaService,
    OpenaiConfigService,
    MemoryService,
    EncryptService,
  ],
})
export class SharedModule {}
