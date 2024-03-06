import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { ChatgptController } from './chatgpt.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { VectorStoreService } from 'src/shared/services/vector-store/vector-store.service';
import { MemoryService } from 'src/shared/services/memory/memory.service';

@Module({
  controllers: [ChatgptController],
  providers: [
    ChatgptService,
    PrismaService,
    VectorStoreService,
    MemoryService,
    // {
    //   provide: 'OPENAI_CONFIG',
    //   useValue: {
    //     modelName: 'gpt-3.5-turbo-0125',
    //     openAIApiKey: process.env.OPENAI_API_KEY,
    //     temperature: 0.7,
    //     maxTokens: 500,
    //   },
    // },
  ],
})
export class ChatgptModule {}
