import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AssistantModule } from './assistant/assistant.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';

@Module({
  imports: [AssistantModule, ChatgptModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
