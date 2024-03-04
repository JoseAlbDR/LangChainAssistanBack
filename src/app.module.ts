import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AssistantModule } from './assistant/assistant.module';

@Module({
  imports: [AssistantModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
