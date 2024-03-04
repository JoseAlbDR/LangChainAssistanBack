import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { VectorStoreService } from 'src/shared/services/vector-store/vector-store.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, VectorStoreService],
})
export class DocumentsModule {}
