import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { SharedModule } from 'src/shared/services/shared.module';
import { DocumentsService } from './documents.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
