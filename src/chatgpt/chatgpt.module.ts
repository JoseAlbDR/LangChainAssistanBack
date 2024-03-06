import { Module } from '@nestjs/common';
import { ChatgptController } from './chatgpt.controller';
import { SharedModule } from 'src/shared/services/shared.module';
import { ChatgptService } from './chatgpt.service';

@Module({
  imports: [SharedModule],
  controllers: [ChatgptController],
  providers: [
    ChatgptService,
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
