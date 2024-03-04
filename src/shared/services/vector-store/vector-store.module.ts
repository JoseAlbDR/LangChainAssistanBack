import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VectorStoreService } from './vector-store.service';

@Module({
  providers: [PrismaService, VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}
