import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VectorStoreService } from './vector-store.service';
import { ModelInitService } from '../model-init/model-init.service';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';

@Module({
  providers: [
    PrismaService,
    VectorStoreService,
    ModelInitService,
    OpenaiConfigService,
  ],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}
