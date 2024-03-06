import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { VectorStoreService } from 'src/shared/services/vector-store/vector-store.service';
import { ModelInitService } from 'src/shared/services/model-init/model-init.service';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { SharedModule } from 'src/shared/services/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    PrismaService,
    VectorStoreService,
    ModelInitService,
    OpenaiConfigService,
  ],
})
export class DocumentsModule {}
