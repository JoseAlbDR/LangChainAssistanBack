import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { SharedModule } from 'src/shared/services/shared.module';
import { DocumentsService } from './documents.service';

@Module({
  imports: [SharedModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
