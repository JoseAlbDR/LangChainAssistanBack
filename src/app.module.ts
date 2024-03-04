import { Module } from '@nestjs/common';
import { PrismaService } from './shared/services/prisma/prisma.service';
import { AssistantModule } from './assistant/assistant.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [AssistantModule, ChatgptModule, DocumentsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
