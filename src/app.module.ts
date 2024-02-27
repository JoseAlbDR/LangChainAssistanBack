import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ChatBotModule } from './chat-bot/chat-bot.module';

@Module({
  imports: [ChatBotModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
