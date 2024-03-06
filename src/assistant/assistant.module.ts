import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { SharedModule } from 'src/shared/services/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
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
export class AssistantModule {}
